const ASTParser = require('../ast-engine/ASTParser');

class CodeMerger {
  constructor(astParser) {
    this.parser = astParser || new ASTParser();
  }

  merge(originalCode, newCode, language, options = {}) {
    const originalAST = this.parser.parse(originalCode, language, 'original');
    const newAST = this.parser.parse(newCode, language, 'new');

    const merged = {
      code: newCode,
      original: originalAST,
      merged: newAST,
      changes: this.detectChanges(originalAST, newAST)
    };

    return merged;
  }

  mergeFunction(originalCode, functionName, newFunctionCode, language) {
    const ast = this.parser.parse(originalCode, language, 'temp');
    const symbols = ast.symbols.filter(s => s.name === functionName);

    if (symbols.length === 0) {
      return this.insertFunction(originalCode, newFunctionCode, language);
    }

    const symbol = symbols[0];
    const lines = originalCode.split('\n');
    
    const before = lines.slice(0, symbol.startPosition.row).join('\n');
    const after = lines.slice(symbol.endPosition.row + 1).join('\n');

    const mergedCode = `${before}\n${newFunctionCode}\n${after}`;

    return {
      code: mergedCode,
      operation: 'replace',
      target: functionName,
      position: {
        start: symbol.startPosition.row,
        end: symbol.endPosition.row
      }
    };
  }

  mergeClass(originalCode, className, newClassCode, language) {
    return this.mergeFunction(originalCode, className, newClassCode, language);
  }

  insertFunction(originalCode, functionCode, options = {}) {
    const lines = originalCode.split('\n');
    
    let insertIndex = lines.length;
    
    if (options.position === 'start') {
      insertIndex = 0;
    } else if (options.after) {
      const ast = this.parser.parse(originalCode, 'javascript', 'temp');
      const symbol = ast.symbols.find(s => s.name === options.after);
      if (symbol) {
        insertIndex = symbol.endPosition.row + 1;
      }
    }

    const before = lines.slice(0, insertIndex).join('\n');
    const after = lines.slice(insertIndex).join('\n');

    const mergedCode = before.trim() 
      ? `${before}\n\n${functionCode}\n${after}`
      : `${functionCode}\n${after}`;

    return {
      code: mergedCode,
      operation: 'insert',
      position: insertIndex
    };
  }

  mergeHTML(originalHTML, newHTML, options = {}) {
    const originalAST = this.parser.parse(originalHTML, 'html', 'original');
    const newAST = this.parser.parse(newHTML, 'html', 'new');

    if (options.replaceElement) {
      return this.replaceHTMLElement(originalHTML, originalAST, newHTML, newAST, options.replaceElement);
    }

    return {
      code: newHTML,
      operation: 'replace_all'
    };
  }

  replaceHTMLElement(originalHTML, originalAST, newHTML, newAST, elementId) {
    const targetSymbol = originalAST.symbols.find(s => s.name === elementId);
    
    if (!targetSymbol) {
      return { code: newHTML, operation: 'replace_all' };
    }

    const newSymbol = newAST.symbols.find(s => s.name === elementId);
    
    if (!newSymbol) {
      return { code: originalHTML, operation: 'no_change' };
    }

    const lines = originalHTML.split('\n');
    const before = lines.slice(0, targetSymbol.startPosition.row).join('\n');
    const after = lines.slice(targetSymbol.endPosition.row + 1).join('\n');

    const newLines = newHTML.split('\n');
    const newElement = newLines.slice(newSymbol.startPosition.row, newSymbol.endPosition.row + 1).join('\n');

    const mergedCode = `${before}\n${newElement}\n${after}`;

    return {
      code: mergedCode,
      operation: 'replace_element',
      target: elementId
    };
  }

  mergeCSS(originalCSS, newCSS, options = {}) {
    if (options.replaceSelector) {
      return this.replaceCSSRule(originalCSS, newCSS, options.replaceSelector);
    }

    return {
      code: this.combineCSS(originalCSS, newCSS),
      operation: 'combine'
    };
  }

  replaceCSSRule(originalCSS, newCSS, selector) {
    const originalAST = this.parser.parse(originalCSS, 'css', 'original');
    const newAST = this.parser.parse(newCSS, 'css', 'new');

    const targetSymbol = originalAST.symbols.find(s => s.name === selector);
    const newSymbol = newAST.symbols.find(s => s.name === selector);

    if (!targetSymbol || !newSymbol) {
      return { code: originalCSS + '\n' + newCSS, operation: 'append' };
    }

    const lines = originalCSS.split('\n');
    const before = lines.slice(0, targetSymbol.startPosition.row).join('\n');
    const after = lines.slice(targetSymbol.endPosition.row + 1).join('\n');

    const newLines = newCSS.split('\n');
    const newRule = newLines.slice(newSymbol.startPosition.row, newSymbol.endPosition.row + 1).join('\n');

    const mergedCode = `${before}\n${newRule}\n${after}`;

    return {
      code: mergedCode,
      operation: 'replace_rule',
      target: selector
    };
  }

  combineCSS(originalCSS, newCSS) {
    const originalRules = this.extractCSSRules(originalCSS);
    const newRules = this.extractCSSRules(newCSS);

    const combined = new Map();

    originalRules.forEach((rule, selector) => {
      combined.set(selector, rule);
    });

    newRules.forEach((rule, selector) => {
      combined.set(selector, rule);
    });

    return Array.from(combined.entries())
      .map(([selector, rule]) => `${selector} ${rule}`)
      .join('\n\n');
  }

  extractCSSRules(css) {
    const rules = new Map();
    const ast = this.parser.parse(css, 'css', 'temp');

    ast.symbols.forEach(symbol => {
      if (symbol.type === 'rule') {
        const lines = css.split('\n');
        const rule = lines.slice(symbol.startPosition.row, symbol.endPosition.row + 1).join('\n');
        const selectorMatch = rule.match(/^([^{]+)\{/);
        
        if (selectorMatch) {
          const selector = selectorMatch[1].trim();
          const body = rule.substring(rule.indexOf('{'));
          rules.set(selector, body);
        }
      }
    });

    return rules;
  }

  detectChanges(oldAST, newAST) {
    const changes = {
      added: [],
      removed: [],
      modified: []
    };

    const oldSymbols = new Map();
    oldAST.symbols.forEach(s => {
      if (s.name) {
        oldSymbols.set(`${s.type}:${s.name}`, s);
      }
    });

    const newSymbols = new Map();
    newAST.symbols.forEach(s => {
      if (s.name) {
        newSymbols.set(`${s.type}:${s.name}`, s);
      }
    });

    oldSymbols.forEach((symbol, key) => {
      if (!newSymbols.has(key)) {
        changes.removed.push({
          type: symbol.type,
          name: symbol.name
        });
      }
    });

    newSymbols.forEach((symbol, key) => {
      if (!oldSymbols.has(key)) {
        changes.added.push({
          type: symbol.type,
          name: symbol.name
        });
      }
    });

    return changes;
  }

  applyBatchChanges(originalCode, changes, language) {
    let currentCode = originalCode;

    changes.forEach(change => {
      switch (change.type) {
        case 'add_function':
          currentCode = this.insertFunction(currentCode, change.code).code;
          break;
        case 'modify_function':
          currentCode = this.mergeFunction(currentCode, change.name, change.code, language).code;
          break;
        case 'replace_element':
          currentCode = this.mergeHTML(currentCode, change.code, { replaceElement: change.selector }).code;
          break;
      }
    });

    return currentCode;
  }
}

module.exports = CodeMerger;
