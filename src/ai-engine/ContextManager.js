class ContextManager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 4000;
    this.sessions = new Map();
    this.currentSession = null;
  }

  createSession(sessionId) {
    const session = {
      id: sessionId,
      messages: [],
      context: {
        symbols: [],
        files: [],
        dependencies: []
      },
      summary: null,
      createdAt: Date.now()
    };

    this.sessions.set(sessionId, session);
    this.currentSession = sessionId;
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId || this.currentSession);
  }

  addMessage(role, content, metadata = {}) {
    const session = this.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
      ...metadata
    });

    this.checkAndCompress(session);
  }

  checkAndCompress(session) {
    const totalTokens = this.estimateTokens(session.messages);
    
    if (totalTokens > this.maxTokens) {
      this.compressSession(session);
    }
  }

  estimateTokens(messages) {
    return messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4);
    }, 0);
  }

  compressSession(session) {
    if (session.messages.length < 4) {
      return;
    }

    const recentMessages = session.messages.slice(-2);
    const oldMessages = session.messages.slice(0, -2);

    const summary = this.summarizeMessages(oldMessages);
    
    session.messages = [
      {
        role: 'system',
        content: `历史对话摘要:\n${summary}`,
        compressed: true,
        timestamp: Date.now()
      },
      ...recentMessages
    ];

    session.summary = summary;
  }

  summarizeMessages(messages) {
    const topics = new Set();
    const files = new Set();
    const symbols = new Set();

    messages.forEach(msg => {
      const fileMatches = msg.content.match(/[\w\/-]+\.(js|html|css)/g) || [];
      fileMatches.forEach(f => files.add(f));

      const symbolMatches = msg.content.match(/function\s+(\w+)|const\s+(\w+)|class\s+(\w+)/g) || [];
      symbolMatches.forEach(s => symbols.add(s));

      if (msg.content.includes('创建') || msg.content.includes('添加')) {
        topics.add('功能开发');
      }
      if (msg.content.includes('修复') || msg.content.includes('bug')) {
        topics.add('Bug修复');
      }
      if (msg.content.includes('优化')) {
        topics.add('性能优化');
      }
    });

    let summary = '';
    if (topics.size > 0) {
      summary += `主题: ${Array.from(topics).join(', ')}\n`;
    }
    if (files.size > 0) {
      summary += `涉及文件: ${Array.from(files).slice(0, 5).join(', ')}\n`;
    }
    if (symbols.size > 0) {
      summary += `相关符号: ${Array.from(symbols).slice(0, 5).join(', ')}\n`;
    }

    return summary || '已压缩的历史对话';
  }

  setContext(context) {
    const session = this.getSession();
    if (session) {
      session.context = { ...session.context, ...context };
    }
  }

  getContext() {
    const session = this.getSession();
    return session?.context || {};
  }

  buildPrompt(userInput) {
    const session = this.getSession();
    if (!session) {
      return userInput;
    }

    const context = session.context;
    let prompt = userInput;

    if (context.symbols && context.symbols.length > 0) {
      prompt = `上下文符号:\n${this.formatSymbols(context.symbols)}\n\n用户需求:\n${userInput}`;
    }

    if (context.files && context.files.length > 0) {
      const fileContext = context.files
        .map(f => `文件 ${f.path}:\n\`\`\`${f.language}\n${f.content?.substring(0, 500)}\n\`\`\``)
        .join('\n\n');
      prompt = `${fileContext}\n\n${prompt}`;
    }

    return prompt;
  }

  formatSymbols(symbols) {
    return symbols
      .slice(0, 10)
      .map(s => `- ${s.type}: ${s.name || s.tagName}`)
      .join('\n');
  }

  getMessages() {
    const session = this.getSession();
    return session?.messages || [];
  }

  clearSession(sessionId) {
    const id = sessionId || this.currentSession;
    if (id) {
      this.sessions.delete(id);
      if (this.currentSession === id) {
        this.currentSession = null;
      }
    }
  }

  exportSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return null;

    return {
      ...session,
      exportedAt: Date.now()
    };
  }

  importSession(data) {
    const session = {
      ...data,
      importedAt: Date.now()
    };
    this.sessions.set(session.id, session);
    return session;
  }
}

module.exports = ContextManager;
