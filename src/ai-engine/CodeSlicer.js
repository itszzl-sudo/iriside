class CodeSlicer {
  constructor(astParser, symbolStorage) {
    this.parser = astParser;
    this.storage = symbolStorage;
    this.cache = new Map();
  }

  sliceBySymbol(filePath, symbolName, options = {}) {
    const symbols = this.storage.querySymbols({ 
      filePath, 
      name: symbolName 
    });

    if (symbols.length === 0) {
      return null;
    }

    const symbol = symbols[0];
    const ast = this.parser.getAST(filePath);

    if (!ast) {
      return null;
    }

    const code = this.extractSymbolCode(ast.content, symbol);
    const dependencies = this.findDependencies(symbol, filePath);

    return {
      symbol: {
        type: symbol.symbol_type,
        name: symbol.symbol_name,
        filePath: symbol.file_path
      },
      code,
      dependencies,
      relatedSymbols: this.findRelatedSymbols(symbol, filePath)
    };
  }

  extractSymbolCode(content, symbol) {
    const lines = content.split('\n');
    const startRow = symbol.start_row;
    const endRow = symbol.end_row;

    return lines.slice(startRow, endRow + 1).join('\n');
  }

  findDependencies(symbol, filePath) {
    const dependencies = [];
    const code = this.getSymbolCode(symbol);

    const importPatterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ];

    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        dependencies.push({
          type: 'import',
          path: match[1],
          position: match.index
        });
      }
    });

    const functionCalls = code.match(/\b\w+\s*\(/g) || [];
    functionCalls.forEach(call => {
      const funcName = call.replace(/\s*\($/, '');
      const callerSymbols = this.storage.querySymbols({ 
        name: funcName,
        type: 'function'
      });
      
      if (callerSymbols.length > 0) {
        dependencies.push({
          type: 'function_call',
          name: funcName,
          symbol: callerSymbols[0]
        });
      }
    });

    return dependencies;
  }

  findRelatedSymbols(symbol, filePath) {
    const related = [];
    
    if (symbol.symbol_type === 'function' || symbol.symbol_type === 'method') {
      const callers = this.findCallers(symbol.symbol_name, filePath);
      related.push(...callers.map(c => ({
        relation: 'caller',
        ...c
      })));
    }

    const usedSymbols = this.findUsedSymbols(symbol, filePath);
    related.push(...usedSymbols.map(s => ({
      relation: 'uses',
      ...s
    })));

    return related;
  }

  findCallers(funcName, excludeFile) {
    const allFunctions = this.storage.querySymbols({ type: 'function' });
    const callers = [];

    allFunctions.forEach(func => {
      if (func.file_path === excludeFile) return;

      const ast = this.parser.getAST(func.file_path);
      if (!ast) return;

      const code = this.extractSymbolCode(ast.content, func);
      if (code.includes(funcName)) {
        callers.push({
          type: func.symbol_type,
          name: func.symbol_name,
          filePath: func.file_path
        });
      }
    });

    return callers;
  }

  findUsedSymbols(symbol, filePath) {
    const code = this.getSymbolCode(symbol);
    const used = [];

    const symbolPatterns = [
      /\bfunction\s+(\w+)/g,
      /\bconst\s+(\w+)\s*=/g,
      /\bclass\s+(\w+)/g,
      /\b(\w+)\s*\(/g
    ];

    const foundNames = new Set();
    symbolPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        foundNames.add(match[1]);
      }
    });

    foundNames.forEach(name => {
      const symbols = this.storage.querySymbols({ name });
      if (symbols.length > 0) {
        used.push({
          type: symbols[0].symbol_type,
          name: symbols[0].symbol_name,
          filePath: symbols[0].file_path
        });
      }
    });

    return used;
  }

  sliceByFile(filePath, options = {}) {
    const ast = this.parser.getAST(filePath);
    if (!ast) return null;

    const symbols = this.storage.querySymbols({ filePath });
    
    return {
      filePath,
      language: ast.language,
      symbols: symbols.map(s => ({
        type: s.symbol_type,
        name: s.symbol_name,
        code: this.extractSymbolCode(ast.content, s)
      })),
      dependencies: this.extractFileDependencies(ast.content)
    };
  }

  extractFileDependencies(content) {
    const deps = [];
    
    const importPattern = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    while ((match = importPattern.exec(content)) !== null) {
      deps.push({ type: 'import', path: match[1] });
    }
    while ((match = requirePattern.exec(content)) !== null) {
      deps.push({ type: 'require', path: match[1] });
    }

    return deps;
  }

  buildMinimalContext(filePath, symbolNames = []) {
    const slices = [];
    const processed = new Set();

    const processSymbol = (filePath, symbolName) => {
      const key = `${filePath}:${symbolName}`;
      if (processed.has(key)) return;
      processed.add(key);

      const slice = this.sliceBySymbol(filePath, symbolName);
      if (slice) {
        slices.push(slice);

        slice.dependencies.forEach(dep => {
          if (dep.type === 'function_call' && dep.symbol) {
            processSymbol(dep.symbol.file_path, dep.symbol.symbol_name);
          }
        });
      }
    };

    if (symbolNames.length === 0) {
      const fileSlice = this.sliceByFile(filePath);
      if (fileSlice) {
        slices.push(fileSlice);
      }
    } else {
      symbolNames.forEach(name => processSymbol(filePath, name));
    }

    return this.assembleContext(slices);
  }

  assembleContext(slices) {
    const files = new Map();
    
    slices.forEach(slice => {
      if (slice.filePath) {
        if (!files.has(slice.filePath)) {
          files.set(slice.filePath, {
            symbols: [],
            dependencies: []
          });
        }

        if (slice.symbol) {
          files.get(slice.filePath).symbols.push(slice.symbol);
        }

        if (slice.dependencies) {
          files.get(slice.filePath).dependencies.push(...slice.dependencies);
        }
      }
    });

    return {
      files: Array.from(files.entries()).map(([path, data]) => ({
        path,
        ...data
      })),
      summary: {
        totalFiles: files.size,
        totalSymbols: slices.reduce((sum, s) => sum + (s.symbols?.length || 1), 0)
      }
    };
  }

  getSymbolCode(symbol) {
    const ast = this.parser.getAST(symbol.file_path || symbol.filePath);
    if (!ast) return '';

    return this.extractSymbolCode(ast.content, symbol);
  }
}

module.exports = CodeSlicer;
