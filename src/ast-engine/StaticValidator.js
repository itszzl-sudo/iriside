const ASTParser = require('./ASTParser');

class StaticValidator {
  constructor() {
    this.parser = new ASTParser();
    this.errors = [];
    this.warnings = [];
  }

  validate(content, language, filePath) {
    this.errors = [];
    this.warnings = [];

    const astNode = this.parser.parse(content, language, filePath);

    switch (language) {
      case 'javascript':
        this.validateJavaScript(astNode);
        break;
      case 'html':
        this.validateHTML(astNode);
        break;
      case 'css':
        this.validateCSS(astNode);
        break;
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      symbolCount: astNode.symbols.length,
      parseTime: astNode.timestamp
    };
  }

  validateJavaScript(astNode) {
    this.checkJavaScriptSyntax(astNode);
  }

  validateHTML(astNode) {
    this.checkHTMLSyntax(astNode);
    this.checkIDUniqueness(astNode);
  }

  validateCSS(astNode) {
    this.checkCSSSyntax(astNode);
  }

  checkJavaScriptSyntax(astNode) {
    const tree = astNode.tree;
    const errors = this.findSyntaxErrors(tree.rootNode);
    
    errors.forEach(error => {
      this.errors.push({
        type: 'syntax_error',
        message: error.message,
        position: error.position,
        severity: 'error'
      });
    });
  }

  findSyntaxErrors(node, errors = []) {
    if (node.type === 'ERROR' || node.isError) {
      errors.push({
        message: `语法错误: ${node.text}`,
        position: {
          start: node.startPosition,
          end: node.endPosition
        }
      });
    }

    for (let i = 0; i < node.childCount; i++) {
      this.findSyntaxErrors(node.child(i), errors);
    }

    return errors;
  }

  checkHTMLSyntax(astNode) {
    const tree = astNode.tree;
    const errors = this.findSyntaxErrors(tree.rootNode);
    
    errors.forEach(error => {
      this.errors.push({
        type: 'html_syntax_error',
        message: error.message,
        position: error.position,
        severity: 'error'
      });
    });

    this.checkTagClosure(astNode);
  }

  checkTagClosure(astNode) {
    const symbols = astNode.symbols;
    const openTags = new Map();
    
    symbols.forEach(symbol => {
      if (symbol.type === 'element' && symbol.tagName) {
        const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        
        if (!voidElements.includes(symbol.tagName.toLowerCase())) {
          if (!openTags.has(symbol.tagName)) {
            openTags.set(symbol.tagName, []);
          }
          openTags.get(symbol.tagName).push(symbol);
        }
      }
    });
  }

  checkIDUniqueness(astNode) {
    const symbols = astNode.symbols;
    const idMap = new Map();

    symbols.forEach(symbol => {
      if (symbol.type === 'element' && symbol.name) {
        if (!idMap.has(symbol.name)) {
          idMap.set(symbol.name, []);
        }
        idMap.get(symbol.name).push(symbol);
      }
    });

    idMap.forEach((elements, id) => {
      if (elements.length > 1) {
        this.errors.push({
          type: 'duplicate_id',
          message: `ID重复: "${id}" 出现 ${elements.length} 次`,
          positions: elements.map(el => ({
            start: el.startPosition,
            end: el.endPosition
          })),
          severity: 'error'
        });
      }
    });
  }

  checkCSSSyntax(astNode) {
    const tree = astNode.tree;
    const errors = this.findSyntaxErrors(tree.rootNode);
    
    errors.forEach(error => {
      this.errors.push({
        type: 'css_syntax_error',
        message: error.message,
        position: error.position,
        severity: 'error'
      });
    });
  }

  validateDOMReferences(htmlAST, jsAST) {
    const htmlIDs = new Set();
    
    htmlAST.symbols.forEach(symbol => {
      if (symbol.type === 'element' && symbol.name) {
        htmlIDs.add(symbol.name);
      }
    });

    const jsContent = jsAST.content;
    const domAccessPatterns = [
      /getElementById\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /querySelector\s*\(\s*['"]#([^'"]+)['"]\s*\)/g,
      /querySelectorAll\s*\(\s*['"]#([^'"]+)['"]\s*\)/g
    ];

    domAccessPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(jsContent)) !== null) {
        const id = match[1];
        if (!htmlIDs.has(id)) {
          this.warnings.push({
            type: 'invalid_dom_reference',
            message: `DOM引用无效: 未找到ID为 "${id}" 的元素`,
            position: {
              index: match.index,
              length: match[0].length
            },
            severity: 'warning'
          });
        }
      }
    });

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  validateProject(files) {
    const results = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    files.forEach(file => {
      const result = this.validate(file.content, file.language, file.path);
      results[file.path] = result;
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    });

    const htmlFiles = files.filter(f => f.language === 'html');
    const jsFiles = files.filter(f => f.language === 'javascript');

    if (htmlFiles.length > 0 && jsFiles.length > 0) {
      const crossValidation = this.validateDOMReferences(
        this.parser.parse(htmlFiles[0].content, 'html', htmlFiles[0].path),
        this.parser.parse(jsFiles[0].content, 'javascript', jsFiles[0].path)
      );
      
      totalWarnings += crossValidation.warnings.length;
      results._crossValidation = crossValidation;
    }

    return {
      valid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      results,
      summary: {
        filesValidated: files.length,
        errorRate: totalErrors / files.length,
        warningRate: totalWarnings / files.length
      }
    };
  }
}

module.exports = StaticValidator;
