const Database = require('better-sqlite3');
const { Level } = require('level');
const path = require('path');
const fs = require('fs');

class SymbolStorage {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.dbPath = path.join(projectPath, '.iriside', 'symbols.db');
    this.cachePath = path.join(projectPath, '.iriside', 'ast-cache');
    
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    
    this.db = new Database(this.dbPath);
    this.astCache = new Level(this.cachePath, { valueEncoding: 'json' });
    
    this.initTables();
  }

  initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS symbols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        symbol_type TEXT NOT NULL,
        symbol_name TEXT,
        tag_name TEXT,
        start_row INTEGER NOT NULL,
        start_column INTEGER NOT NULL,
        end_row INTEGER NOT NULL,
        end_column INTEGER NOT NULL,
        language TEXT NOT NULL,
        attributes TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_file_path ON symbols(file_path);
      CREATE INDEX IF NOT EXISTS idx_symbol_type ON symbols(symbol_type);
      CREATE INDEX IF NOT EXISTS idx_symbol_name ON symbols(symbol_name);
      CREATE INDEX IF NOT EXISTS idx_language ON symbols(language);

      CREATE TABLE IF NOT EXISTS dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_file TEXT NOT NULL,
        to_file TEXT NOT NULL,
        import_type TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_from_file ON dependencies(from_file);
      CREATE INDEX IF NOT EXISTS idx_to_file ON dependencies(to_file);

      CREATE TABLE IF NOT EXISTS file_metadata (
        file_path TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        symbol_count INTEGER NOT NULL,
        last_modified INTEGER NOT NULL,
        parse_time INTEGER,
        file_hash TEXT
      );
    `);
  }

  saveSymbols(filePath, symbols, language) {
    const deleteStmt = this.db.prepare('DELETE FROM symbols WHERE file_path = ?');
    const insertStmt = this.db.prepare(`
      INSERT INTO symbols 
      (file_path, symbol_type, symbol_name, tag_name, start_row, start_column, end_row, end_column, language, attributes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      deleteStmt.run(filePath);
      
      symbols.forEach(symbol => {
        insertStmt.run(
          filePath,
          symbol.type,
          symbol.name || null,
          symbol.tagName || null,
          symbol.startPosition.row,
          symbol.startPosition.column,
          symbol.endPosition.row,
          symbol.endPosition.column,
          language,
          symbol.attributes ? JSON.stringify(symbol.attributes) : null,
          Date.now()
        );
      });
    });

    transaction();
  }

  updateFileMetadata(filePath, language, symbolCount, parseTime, fileHash) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_metadata 
      (file_path, language, symbol_count, last_modified, parse_time, file_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(filePath, language, symbolCount, Date.now(), parseTime, fileHash);
  }

  async cacheAST(filePath, astData) {
    await this.astCache.put(filePath, {
      ...astData,
      timestamp: Date.now()
    });
  }

  async getCachedAST(filePath) {
    try {
      return await this.astCache.get(filePath);
    } catch (error) {
      if (error.code === 'LEVEL_NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  async removeCachedAST(filePath) {
    try {
      await this.astCache.del(filePath);
    } catch (error) {
      if (error.code !== 'LEVEL_NOT_FOUND') {
        throw error;
      }
    }
  }

  querySymbols(options = {}) {
    let sql = 'SELECT * FROM symbols WHERE 1=1';
    const params = [];

    if (options.filePath) {
      sql += ' AND file_path = ?';
      params.push(options.filePath);
    }

    if (options.type) {
      sql += ' AND symbol_type = ?';
      params.push(options.type);
    }

    if (options.name) {
      sql += ' AND symbol_name = ?';
      params.push(options.name);
    }

    if (options.language) {
      sql += ' AND language = ?';
      params.push(options.language);
    }

    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  getFileMetadata(filePath) {
    const stmt = this.db.prepare('SELECT * FROM file_metadata WHERE file_path = ?');
    return stmt.get(filePath);
  }

  getAllFiles() {
    const stmt = this.db.prepare('SELECT * FROM file_metadata');
    return stmt.all();
  }

  getStats() {
    const symbolCount = this.db.prepare('SELECT COUNT(*) as count FROM symbols').get().count;
    const fileCount = this.db.prepare('SELECT COUNT(*) as count FROM file_metadata').get().count;
    
    const byLanguage = this.db.prepare(`
      SELECT language, COUNT(*) as count 
      FROM file_metadata 
      GROUP BY language
    `).all();

    return {
      totalSymbols: symbolCount,
      totalFiles: fileCount,
      byLanguage: byLanguage.reduce((acc, row) => {
        acc[row.language] = row.count;
        return acc;
      }, {})
    };
  }

  removeFile(filePath) {
    const deleteSymbols = this.db.prepare('DELETE FROM symbols WHERE file_path = ?');
    const deleteMetadata = this.db.prepare('DELETE FROM file_metadata WHERE file_path = ?');
    
    const transaction = this.db.transaction(() => {
      deleteSymbols.run(filePath);
      deleteMetadata.run(filePath);
    });

    transaction();
    this.removeCachedAST(filePath);
  }

  close() {
    this.db.close();
    this.astCache.close();
  }
}

module.exports = SymbolStorage;
