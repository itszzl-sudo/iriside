const { VM } = require('vm2');
const ASTParser = require('../ast-engine/ASTParser');

class RuntimeValidator {
  constructor() {
    this.parser = new ASTParser();
    this.errors = [];
    this.warnings = [];
    this.performance = {};
  }

  async validate(code, language, options = {}) {
    this.errors = [];
    this.warnings = [];
    this.performance = {};

    const startTime = Date.now();

    const result = {
      valid: true,
      errors: [],
      warnings: [],
      coverage: 0,
      performance: {}
    };

    if (language === 'javascript') {
      const jsResult = await this.validateJavaScript(code, options);
      Object.assign(result, jsResult);
    }

    result.performance.totalTime = Date.now() - startTime;
    return result;
  }

  async validateJavaScript(code, options = {}) {
    const ast = this.parser.parse(code, 'javascript', 'temp');

    const typeErrors = this.detectTypeError(code, ast);
    const logicErrors = this.detectLogicErrors(code, ast);
    const securityIssues = this.detectSecurityIssues(code, ast);
    const runtimeErrors = await this.detectRuntimeErrors(code, options);

    const allErrors = [...typeErrors, ...logicErrors, ...securityIssues, ...runtimeErrors];
    const allWarnings = [...this.warnings];

    const coverage = this.calculateCoverage(ast, allErrors);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      coverage,
      performance: this.performance
    };
  }

  detectTypeError(code, ast) {
    const errors = [];
    const lines = code.split('\n');

    const variableAssignments = new Map();

    const assignmentPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(.+?);/g;
    let match;
    while ((match = assignmentPattern.exec(code)) !== null) {
      const varName = match[1];
      const value = match[2].trim();
      const type = this.inferType(value);
      variableAssignments.set(varName, { type, line: this.getLineNumber(code, match.index) });
    }

    variableAssignments.forEach((info, varName) => {
      const usagePattern = new RegExp(`${varName}\\s*\\.\\s*\\w+`, 'g');
      let usageMatch;
      while ((usageMatch = usagePattern.exec(code)) !== null) {
        const usageLine = this.getLineNumber(code, usageMatch.index);
        const method = usageMatch[0].split('.')[1].trim();
        
        if (info.type === 'number' && ['push', 'pop', 'shift'].includes(method)) {
          errors.push({
            type: 'TypeError',
            message: `变量 ${varName} 是 ${info.type} 类型，无法调用方法 ${method}()`,
            line: usageLine,
            severity: 'error'
          });
        }
      }
    });

    return errors;
  }

  detectLogicErrors(code, ast) {
    const errors = [];

    const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
      const funcName = match[1];
      const params = match[2];
      const body = match[3];
      const line = this.getLineNumber(code, match.index);

      if (!body.includes('return') && !funcName.startsWith('set') && !funcName.startsWith('log')) {
        this.warnings.push({
          type: 'LogicWarning',
          message: `函数 ${funcName} 可能缺少return语句`,
          line,
          severity: 'warning'
        });
      }

      const ifPattern = /if\s*\(/g;
      const elsePattern = /else\s*\{/g;
      const ifCount = (body.match(ifPattern) || []).length;
      const elseCount = (body.match(elsePattern) || []).length;

      if (ifCount > 0 && elseCount < ifCount) {
        this.warnings.push({
          type: 'BranchWarning',
          message: `函数 ${funcName} 可能存在未覆盖的分支`,
          line,
          severity: 'warning'
        });
      }
    }

    const tryPattern = /try\s*\{/g;
    const catchPattern = /catch\s*\(/g;
    const tryCount = (code.match(tryPattern) || []).length;
    const catchCount = (code.match(catchPattern) || []).length;

    if (tryCount > catchCount) {
      errors.push({
        type: 'TryCatchError',
        message: '存在未捕获的try块',
        line: 1,
        severity: 'error'
      });
    }

    return errors;
  }

  detectSecurityIssues(code, ast) {
    const issues = [];

    const innerHTMLPattern = /\.innerHTML\s*=/g;
    let match;
    while ((match = innerHTMLPattern.exec(code)) !== null) {
      const line = this.getLineNumber(code, match.index);
      const lineContent = code.split('\n')[line - 1];
      
      if (!lineContent.includes('sanitize') && !lineContent.includes('escape')) {
        issues.push({
          type: 'SecurityWarning',
          message: '使用innerHTML可能存在XSS风险，建议进行输入验证',
          line,
          severity: 'warning'
        });
      }
    }

    const evalPattern = /\beval\s*\(/g;
    while ((match = evalPattern.exec(code)) !== null) {
      issues.push({
        type: 'SecurityError',
        message: '使用eval()存在严重安全风险',
        line: this.getLineNumber(code, match.index),
        severity: 'error'
      });
    }

    const sqlPattern = /query\s*\(\s*[`'"]\s*(?:SELECT|INSERT|UPDATE|DELETE)/gi;
    while ((match = sqlPattern.exec(code)) !== null) {
      const line = this.getLineNumber(code, match.index);
      const lineContent = code.split('\n')[line - 1];
      
      if (lineContent.includes('${') || lineContent.includes('+')) {
        issues.push({
          type: 'SQLInjection',
          message: 'SQL查询可能存在注入风险',
          line,
          severity: 'warning'
        });
      }
    }

    return issues;
  }

  async detectRuntimeErrors(code, options = {}) {
    const errors = [];

    if (options.sandbox === false) {
      return errors;
    }

    try {
      const startTime = Date.now();
      
      const vm = new VM({
        timeout: 1000,
        sandbox: {
          console: {
            log: () => {},
            error: () => {},
            warn: () => {}
          }
        }
      });

      vm.run(code);
      
      this.performance.executionTime = Date.now() - startTime;
    } catch (error) {
      const errorMessage = error.message || String(error);
      
      if (errorMessage.includes('TypeError')) {
        errors.push({
          type: 'RuntimeTypeError',
          message: errorMessage,
          line: 1,
          severity: 'error'
        });
      } else if (errorMessage.includes('ReferenceError')) {
        errors.push({
          type: 'ReferenceError',
          message: errorMessage,
          line: 1,
          severity: 'error'
        });
      } else if (errorMessage.includes('RangeError')) {
        errors.push({
          type: 'RangeError',
          message: errorMessage,
          line: 1,
          severity: 'error'
        });
      } else if (errorMessage.includes('timeout')) {
        this.warnings.push({
          type: 'PerformanceWarning',
          message: '代码执行超时',
          line: 1,
          severity: 'warning'
        });
      }
    }

    return errors;
  }

  inferType(value) {
    if (/^-?\d+$/.test(value)) return 'number';
    if (/^-?\d+\.\d+$/.test(value)) return 'number';
    if (/^['"`]/.test(value)) return 'string';
    if (/^\[/.test(value)) return 'array';
    if (/^\{/.test(value)) return 'object';
    if (/^(true|false)$/.test(value)) return 'boolean';
    if (/^(null|undefined)$/.test(value)) return 'null';
    if (/^\w+\s*\(/.test(value)) return 'function';
    
    return 'unknown';
  }

  getLineNumber(code, index) {
    return code.substring(0, index).split('\n').length;
  }

  calculateCoverage(ast, errors) {
    const totalSymbols = ast.symbols.length;
    if (totalSymbols === 0) return 100;

    const errorSymbols = new Set();
    errors.forEach(error => {
      if (error.line) {
        errorSymbols.add(error.line);
      }
    });

    const coveredSymbols = totalSymbols - errorSymbols.size;
    return Math.max(0, Math.min(100, (coveredSymbols / totalSymbols) * 100));
  }

  validatePerformance(code) {
    const issues = [];

    const loopPattern = /for\s*\([^)]*\)\s*\{[\s\S]*?\}/g;
    let match;
    while ((match = loopPattern.exec(code)) !== null) {
      const loopBody = match[0];
      
      if (loopBody.includes('document.getElementById') || 
          loopBody.includes('document.querySelector')) {
        issues.push({
          type: 'PerformanceWarning',
          message: '循环中频繁DOM查询，建议缓存查询结果',
          line: this.getLineNumber(code, match.index),
          severity: 'warning'
        });
      }
    }

    return issues;
  }
}

module.exports = RuntimeValidator;
