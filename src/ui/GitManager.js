const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

class GitManager {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.fs = fs;
  }

  async init() {
    try {
      await git.init({
        fs: this.fs,
        dir: this.projectPath
      });
      console.log('Git仓库初始化成功');
      return true;
    } catch (error) {
      console.error('Git初始化失败:', error);
      return false;
    }
  }

  async add(filePath) {
    try {
      await git.add({
        fs: this.fs,
        dir: this.projectPath,
        filepath: filePath
      });
      return true;
    } catch (error) {
      console.error('Git add失败:', error);
      return false;
    }
  }

  async commit(message) {
    try {
      const sha = await git.commit({
        fs: this.fs,
        dir: this.projectPath,
        message,
        author: {
          name: 'AST-IDE',
          email: 'ast-ide@example.com'
        }
      });
      console.log(`提交成功: ${sha}`);
      return sha;
    } catch (error) {
      console.error('Git commit失败:', error);
      return null;
    }
  }

  async status(filePath) {
    try {
      const status = await git.status({
        fs: this.fs,
        dir: this.projectPath,
        filepath: filePath
      });
      return status;
    } catch (error) {
      console.error('Git status失败:', error);
      return null;
    }
  }

  async log(depth = 10) {
    try {
      const commits = [];
      let sha = await git.resolveRef({
        fs: this.fs,
        dir: this.projectPath,
        ref: 'HEAD'
      });

      for (let i = 0; i < depth; i++) {
        const commit = await git.readCommit({
          fs: this.fs,
          dir: this.projectPath,
          oid: sha
        });

        commits.push({
          sha: commit.oid,
          message: commit.commit.message,
          author: commit.commit.author.name,
          timestamp: commit.commit.author.timestamp * 1000
        });

        if (commit.commit.parent.length === 0) break;
        sha = commit.commit.parent[0];
      }

      return commits;
    } catch (error) {
      console.error('Git log失败:', error);
      return [];
    }
  }

  async diff(filePath) {
    try {
      const status = await this.status(filePath);
      
      if (status === 'unmodified') {
        return null;
      }

      const currentContent = fs.readFileSync(
        path.join(this.projectPath, filePath),
        'utf-8'
      );

      try {
        const { blob } = await git.readBlob({
          fs: this.fs,
          dir: this.projectPath,
          oid: await git.resolveRef({
            fs: this.fs,
            dir: this.projectPath,
            ref: 'HEAD'
          }),
          filepath: filePath
        });

        const originalContent = Buffer.from(blob).toString('utf-8');
        
        return {
          original: originalContent,
          current: currentContent,
          status
        };
      } catch {
        return {
          original: '',
          current: currentContent,
          status: 'added'
        };
      }
    } catch (error) {
      console.error('Git diff失败:', error);
      return null;
    }
  }

  async autoCommit(message, files) {
    try {
      const changes = [];
      
      for (const file of files) {
        const status = await this.status(file);
        if (status !== 'unmodified') {
          await this.add(file);
          changes.push({ file, status });
        }
      }

      if (changes.length === 0) {
        console.log('没有变更需要提交');
        return null;
      }

      const commitMessage = message || `自动提交: ${changes.length}个文件变更`;
      const sha = await this.commit(commitMessage);

      return {
        sha,
        changes,
        message: commitMessage
      };
    } catch (error) {
      console.error('自动提交失败:', error);
      return null;
    }
  }

  async getModifiedFiles() {
    try {
      const FILE = 0, HEAD = 1, WORKDIR = 2, STAGE = 3;
      
      const matrix = await git.statusMatrix({
        fs: this.fs,
        dir: this.projectPath
      });

      const modifiedFiles = matrix
        .filter(row => row[HEAD] !== row[WORKDIR] || row[HEAD] !== row[STAGE])
        .map(row => ({
          path: row[FILE],
          head: row[HEAD],
          workdir: row[WORKDIR],
          stage: row[STAGE],
          status: this.getFileStatus(row)
        }));

      return modifiedFiles;
    } catch (error) {
      console.error('获取修改文件列表失败:', error);
      return [];
    }
  }

  getFileStatus(row) {
    const FILE = 0, HEAD = 1, WORKDIR = 2, STAGE = 3;
    
    if (row[HEAD] === 0 && row[WORKDIR] === 1) return 'added';
    if (row[HEAD] === 1 && row[WORKDIR] === 0) return 'deleted';
    if (row[HEAD] === 1 && row[WORKDIR] === 2) return 'modified';
    if (row[STAGE] === 2) return 'staged';
    
    return 'unknown';
  }
}

module.exports = GitManager;
