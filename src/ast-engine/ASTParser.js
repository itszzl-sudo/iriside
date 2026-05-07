const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
const HTML = require('tree-sitter-html');
const CSS = require('tree-sitter-css');

class ASTParser {
  constructor() {
    this.parsers = {
      javascript: this.createParser('javascript'),
      html: this.createParser('html'),
      css: this.createParser('css')
    };
    this.astCache = new Map();
    this.symbolTable = new Map();
  }

  createParser(language) {
    const parser = new Parser();
    const languageMap = {
      javascript: JavaScript,
      html: HTML,
      css: CSS
    };
    parser.setLanguage(languageMap[language]);
    return parser;
  }

  parse(content, language, filePath) {
    if (!this.parsers[language]) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const parser = this.parsers[language];
    const tree = parser.parse(content);
    
    const astNode = {
      filePath,
      language,
      tree,
      content,
      timestamp: Date.now(),
      symbols: this.extractSymbols(tree.rootNode, language)
    };

    this.astCache.set(filePath, astNode);
    this.updateSymbolTable(filePath, astNode.symbols);

    return astNode;
  }

  extractSymbols(node, language, symbols = []) {
    const symbolExtractors = {
      javascript: this.extractJavaScriptSymbols.bind(this),
      html: this.extractHTMLSymbols.bind(this),
      css: this.extractCSSSymbols.bind(this)
    };

    if (symbolExtractors[language]) {
      symbolExtractors[language](node, symbols);
    }

    return symbols;
  }

  extractJavaScriptSymbols(node, symbols) {
    const symbolTypes = {
      'function_declaration': 'function',
      'variable_declaration': 'variable',
      'class_declaration': 'class',
      'method_definition': 'method',
      'arrow_function': 'arrow_function'
    };

    if (symbolTypes[node.type]) {
      const nameNode = node.childForFieldName('name') || node.firstChild;
      symbols.push({
        type: symbolTypes[node.type],
        name: nameNode ? nameNode.text : 'anonymous',
        node,
        startPosition: node.startPosition,
        endPosition: node.endPosition
      });
    }

    for (let i = 0; i < node.childCount; i++) {
      this.extractJavaScriptSymbols(node.child(i), symbols);
    }
  }

  extractHTMLSymbols(node, symbols, depth = 0) {
    if (node.type === 'element') {
      let tagName = 'unknown';
      let attributes = {};
      
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        
        if (child.type === 'start_tag' || child.type === 'self_closing_tag') {
          for (let j = 0; j < child.childCount; j++) {
            const tagChild = child.child(j);
            
            if (tagChild.type === 'tag_name') {
              tagName = tagChild.text;
            } else if (tagChild.type === 'attribute') {
              const attrName = tagChild.child(0);
              const attrValue = tagChild.child(2);
              if (attrName) {
                let value = true;
                if (attrValue && attrValue.type === 'quoted_attribute_value') {
                  const valueNode = attrValue.child(1);
                  if (valueNode) {
                    value = valueNode.text;
                  }
                }
                attributes[attrName.text] = value;
              }
            }
          }
        }
      }

      const id = attributes.id;
      symbols.push({
        type: 'element',
        name: id || null,
        tagName,
        node,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        attributes
      });
    }

    for (let i = 0; i < node.childCount; i++) {
      this.extractHTMLSymbols(node.child(i), symbols, depth + 1);
    }
  }

  extractCSSSymbols(node, symbols, depth = 0) {
    if (node.type === 'rule_set') {
      let selector = null;
      
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child.type === 'selectors') {
          selector = child.text;
          break;
        }
      }

      if (selector) {
        symbols.push({
          type: 'rule',
          name: selector,
          node,
          startPosition: node.startPosition,
          endPosition: node.endPosition
        });
      }
    }

    for (let i = 0; i < node.childCount; i++) {
      this.extractCSSSymbols(node.child(i), symbols, depth + 1);
    }
  }

  updateSymbolTable(filePath, symbols) {
    this.symbolTable.set(filePath, symbols);
  }

  getAST(filePath) {
    return this.astCache.get(filePath);
  }

  getSymbolTable() {
    return this.symbolTable;
  }

  invalidateAST(filePath) {
    this.astCache.delete(filePath);
    this.symbolTable.delete(filePath);
  }

  incrementalParse(content, language, filePath, oldTree) {
    const parser = this.parsers[language];
    if (!parser) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const tree = parser.parse(content, oldTree);
    return this.parse(content, language, filePath);
  }

  printAST(node, indent = 0) {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}${node.type} [${node.startPosition.row},${node.startPosition.column}] - [${node.endPosition.row},${node.endPosition.column}]`);
    
    for (let i = 0; i < node.childCount; i++) {
      this.printAST(node.child(i), indent + 1);
    }
  }
}

module.exports = ASTParser;
