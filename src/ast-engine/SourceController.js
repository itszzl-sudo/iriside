const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SourceController {
  constructor(projectPath) {
    this.projectPath = path.resolve(projectPath);
    this.lockedFiles = new Set();
    this.permissions = {
      read: true,
      write: false,
      delete: false
    };
  }

  calculateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  canAccess(filePath, operation = 'read') {
    const absolutePath = path.resolve(filePath);
    
    if (!absolutePath.startsWith(this.projectPath)) {
      return false;
    }

    if (operation === 'read') {
      return this.permissions.read;
    }

    if (operation === 'write' || operation === 'delete') {
      return this.permissions.write;
    }

    return false;
  }

  readFile(filePath) {
    const absolutePath = path.resolve(this.projectPath, filePath);
    
    if (!this.canAccess(absolutePath, 'read')) {
      throw new Error('Read access denied');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    return {
      content,
      hash: this.calculateHash(content),
      size: Buffer.byteLength(content, 'utf-8')
    };
  }

  writeFile(filePath, content, options = {}) {
    const absolutePath = path.resolve(this.projectPath, filePath);
    
    if (!this.canAccess(absolutePath, 'write')) {
      throw new Error('Write access denied');
    }

    if (this.lockedFiles.has(absolutePath)) {
      throw new Error(`File is locked: ${filePath}`);
    }

    if (!options.overwrite && fs.existsSync(absolutePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf-8');

    return {
      success: true,
      hash: this.calculateHash(content),
      size: Buffer.byteLength(content, 'utf-8'),
      path: absolutePath
    };
  }

  deleteFile(filePath) {
    const absolutePath = path.resolve(this.projectPath, filePath);
    
    if (!this.canAccess(absolutePath, 'delete')) {
      throw new Error('Delete access denied');
    }

    if (this.lockedFiles.has(absolutePath)) {
      throw new Error(`File is locked: ${filePath}`);
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    fs.unlinkSync(absolutePath);
    return { success: true, path: absolutePath };
  }

  listFiles(directory = '', options = {}) {
    const absoluteDir = path.resolve(this.projectPath, directory);
    
    if (!absoluteDir.startsWith(this.projectPath)) {
      throw new Error('Access denied');
    }

    if (!fs.existsSync(absoluteDir)) {
      return [];
    }

    const extensions = options.extensions || ['.js', '.html', '.css'];
    const files = [];

    const scan = (dir, baseDir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.projectPath, fullPath);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scan(fullPath, baseDir);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push({
              path: relativePath,
              absolutePath: fullPath,
              extension: ext,
              size: fs.statSync(fullPath).size
            });
          }
        }
      }
    };

    scan(absoluteDir, absoluteDir);
    return files;
  }

  lockFile(filePath) {
    const absolutePath = path.resolve(this.projectPath, filePath);
    this.lockedFiles.add(absolutePath);
    return true;
  }

  unlockFile(filePath) {
    const absolutePath = path.resolve(this.projectPath, filePath);
    return this.lockedFiles.delete(absolutePath);
  }

  setPermissions(permissions) {
    Object.assign(this.permissions, permissions);
  }

  getProjectInfo() {
    return {
      path: this.projectPath,
      permissions: this.permissions,
      lockedFiles: Array.from(this.lockedFiles)
    };
  }
}

module.exports = SourceController;
