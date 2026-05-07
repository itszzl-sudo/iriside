const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const ASTParser = require('./ASTParser');

class IncrementalIndexer {
  constructor(options = {}) {
    this.parser = new ASTParser();
    this.watcher = null;
    this.indexedFiles = new Map();
    this.options = {
      ignored: /(^|[\/\\])\..|node_modules/,
      persistent: true,
      ignoreInitial: false,
      ...options
    };
    this.handlers = {
      onAdd: [],
      onChange: [],
      onUnlink: [],
      onError: []
    };
  }

  watch(directory) {
    if (this.watcher) {
      this.watcher.close();
    }

    const patterns = [
      path.join(directory, '**/*.js'),
      path.join(directory, '**/*.html'),
      path.join(directory, '**/*.css')
    ];

    this.watcher = chokidar.watch(patterns, {
      ignored: this.options.ignored,
      persistent: this.options.persistent,
      ignoreInitial: this.options.ignoreInitial
    });

    this.watcher
      .on('add', filePath => this.handleFileAdd(filePath))
      .on('change', filePath => this.handleFileChange(filePath))
      .on('unlink', filePath => this.handleFileUnlink(filePath))
      .on('error', error => this.handleError(error));

    console.log(`开始监听目录: ${directory}`);
    return this;
  }

  async scanDirectory(directory) {
    const fs = require('fs').promises;
    const path = require('path');

    const scan = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!this.options.ignored.test(fullPath)) {
            await scan(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.js', '.html', '.css'].includes(ext)) {
            this.parseAndIndex(fullPath);
          }
        }
      }
    };

    await scan(directory);
    return this;
  }

  handleFileAdd(filePath) {
    this.parseAndIndex(filePath);
    this.handlers.onAdd.forEach(handler => handler(filePath));
  }

  handleFileChange(filePath) {
    this.parseAndIndex(filePath);
    this.handlers.onChange.forEach(handler => handler(filePath));
  }

  handleFileUnlink(filePath) {
    this.indexedFiles.delete(filePath);
    this.parser.invalidateAST(filePath);
    this.handlers.onUnlink.forEach(handler => handler(filePath));
    console.log(`[删除] ${filePath}`);
  }

  handleError(error) {
    console.error(`[错误] ${error}`);
    this.handlers.onError.forEach(handler => handler(error));
  }

  parseAndIndex(filePath) {
    const language = this.getLanguage(filePath);
    if (!language) return;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const startTime = Date.now();
      
      const oldAST = this.parser.getAST(filePath);
      const astNode = this.parser.parse(content, language, filePath);
      
      const elapsed = Date.now() - startTime;
      this.indexedFiles.set(filePath, {
        language,
        symbolCount: astNode.symbols.length,
        lastModified: astNode.timestamp,
        parseTime: elapsed
      });

      const changeType = oldAST ? '更新' : '新增';
      console.log(`[${changeType}] ${filePath} (${language}, ${astNode.symbols.length}符号, ${elapsed}ms)`);

    } catch (error) {
      console.error(`[解析失败] ${filePath}: ${error.message}`);
    }
  }

  getLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
      '.js': 'javascript',
      '.html': 'html',
      '.css': 'css'
    };
    return langMap[ext];
  }

  on(event, handler) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    }
    return this;
  }

  getIndexedFiles() {
    return this.indexedFiles;
  }

  getStats() {
    const stats = {
      totalFiles: this.indexedFiles.size,
      byLanguage: {},
      totalSymbols: 0
    };

    this.indexedFiles.forEach((info, filePath) => {
      if (!stats.byLanguage[info.language]) {
        stats.byLanguage[info.language] = 0;
      }
      stats.byLanguage[info.language]++;
      stats.totalSymbols += info.symbolCount;
    });

    return stats;
  }

  close() {
    if (this.watcher) {
      this.watcher.close();
      console.log('文件监听已关闭');
    }
  }
}

module.exports = IncrementalIndexer;
