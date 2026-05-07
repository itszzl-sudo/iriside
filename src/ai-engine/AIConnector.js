require('dotenv').config();
const fs = require('fs');
const path = require('path');

class AIConnector {
  constructor(options = {}) {
    this.providers = new Map();
    this.defaultProvider = options.defaultProvider || 'openai';
    this.apiKeys = {};
    this.loadConfig();
  }

  loadConfig() {
    // 优先从环境变量读取API密钥
    if (process.env.OPENAI_API_KEY) {
      this.apiKeys.openai = process.env.OPENAI_API_KEY;
    }
    if (process.env.DEEPSEEK_API_KEY) {
      this.apiKeys.deepseek = process.env.DEEPSEEK_API_KEY;
    }
    if (process.env.AI_API_KEY) {
      this.apiKeys.custom = process.env.AI_API_KEY;
    }
    
    // 从配置文件读取（作为备用）
    const configPath = path.join(process.cwd(), '.iriside', 'ai-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      // 环境变量优先级更高
      this.apiKeys = { ...config.apiKeys, ...this.apiKeys };
      this.defaultProvider = config.defaultProvider || this.defaultProvider;
    }

    // 从环境变量读取默认provider
    if (process.env.AI_PROVIDER) {
      this.defaultProvider = process.env.AI_PROVIDER;
    }
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }

  async chat(messages, options = {}) {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`AI provider not found: ${providerName}`);
    }

    return await provider.chat(messages, {
      ...options,
      apiKey: this.apiKeys[providerName]
    });
  }

  async generateCode(prompt, context = {}, options = {}) {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, options);
    return this.extractCode(response);
  }

  buildSystemPrompt(context) {
    let prompt = '你是一个专业的代码生成AI助手。根据用户需求生成高质量的代码。\n\n';
    
    if (context.language) {
      prompt += `目标语言: ${context.language}\n`;
    }
    
    if (context.existingCode) {
      prompt += `\n已有代码:\n\`\`\`${context.language || 'javascript'}\n${context.existingCode}\n\`\`\`\n`;
    }
    
    if (context.symbols) {
      prompt += `\n可用符号:\n${context.symbols.map(s => `- ${s.type}: ${s.name}`).join('\n')}\n`;
    }

    prompt += '\n要求:\n1. 生成简洁高效的代码\n2. 遵循最佳实践\n3. 添加必要注释';
    
    return prompt;
  }

  extractCode(response) {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const codes = [];
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      codes.push(match[1].trim());
    }

    return {
      raw: response,
      codes,
      primaryCode: codes[0] || response
    };
  }

  setApiKey(provider, key) {
    this.apiKeys[provider] = key;
  }
}

class DeepSeekProvider {
  async chat(messages, options = {}) {
    const apiKey = options.apiKey;
    
    if (!apiKey) {
      throw new Error('DeepSeek API key not provided');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'deepseek-chat',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class OpenAIProvider {
  async chat(messages, options = {}) {
    const apiKey = options.apiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not provided. Please set OPENAI_API_KEY in .env file');
    }

    const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    return data.choices[0].message.content;
  }
}

class MockProvider {
  async chat(messages, options = {}) {
    const userMessage = messages.find(m => m.role === 'user');
    return `已收到请求: "${userMessage?.content?.substring(0, 50)}..."\n\n生成的代码:\n\`\`\`javascript\nfunction generatedFunction() {\n  // 示例代码\n  console.log('AI生成的内容');\n}\n\`\`\``;
  }
}

module.exports = {
  AIConnector,
  DeepSeekProvider,
  OpenAIProvider,
  MockProvider
};
