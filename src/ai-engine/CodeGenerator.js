const ASTParser = require('../ast-engine/ASTParser');

class CodeGenerator {
  constructor(aiConnector, contextManager) {
    this.aiConnector = aiConnector;
    this.contextManager = contextManager;
    this.parser = new ASTParser();
  }

  async generateFile(prompt, options = {}) {
    const language = options.language || 'javascript';
    const context = this.contextManager.getContext();

    const systemPrompt = this.buildSystemPrompt(language, context);
    const userPrompt = this.buildUserPrompt(prompt, options);

    const response = await this.aiConnector.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], options);

    const code = this.extractCode(response, language);

    return {
      code,
      language,
      description: prompt,
      raw: response,
      validation: this.parser.parse(code, language, 'generated')
    };
  }

  async modifyCode(filePath, currentCode, modification, options = {}) {
    const language = options.language || 'javascript';

    const prompt = `当前代码:\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\n修改要求:\n${modification}`;

    const response = await this.aiConnector.chat([
      { 
        role: 'system', 
        content: '你是一个专业的代码修改助手。根据用户的要求修改代码，保持代码质量和一致性。' 
      },
      { role: 'user', content: prompt }
    ], options);

    const modifiedCode = this.extractCode(response, language);

    return {
      originalCode: currentCode,
      modifiedCode,
      modification,
      diff: this.generateDiff(currentCode, modifiedCode),
      validation: this.parser.parse(modifiedCode, language, filePath)
    };
  }

  async generateFunction(name, description, options = {}) {
    const language = options.language || 'javascript';

    const prompt = `生成一个名为"${name}"的函数。\n功能描述: ${description}\n参数: ${options.params || '根据需要定义'}\n返回值: ${options.returnType || '根据需要定义'}`;

    const code = await this.generateFile(prompt, { ...options, language });

    return {
      name,
      description,
      code: code.code,
      params: options.params,
      returnType: options.returnType
    };
  }

  async generateClass(name, description, options = {}) {
    const language = options.language || 'javascript';

    const prompt = `生成一个名为"${name}"的类。\n功能描述: ${description}\n属性: ${options.properties?.join(', ') || '根据需要定义'}\n方法: ${options.methods?.join(', ') || '根据需要定义'}`;

    return await this.generateFile(prompt, { ...options, language });
  }

  async generateHTML(structure, options = {}) {
    const prompt = `生成HTML页面。\n页面结构: ${JSON.stringify(structure, null, 2)}\n${options.styled ? '需要样式' : ''}`;

    return await this.generateFile(prompt, { ...options, language: 'html' });
  }

  async generateCSS(selectors, options = {}) {
    const prompt = `生成CSS样式。\n样式规则: ${JSON.stringify(selectors, null, 2)}`;

    return await this.generateFile(prompt, { ...options, language: 'css' });
  }

  buildSystemPrompt(language, context) {
    const prompts = {
      javascript: '你是一个专业的JavaScript代码生成助手。生成符合ES6+标准的现代JavaScript代码。',
      html: '你是一个专业的HTML代码生成助手。生成语义化的HTML5代码。',
      css: '你是一个专业的CSS代码生成助手。生成现代、响应式的CSS3样式。'
    };

    let prompt = prompts[language] || prompts.javascript;

    if (context.symbols && context.symbols.length > 0) {
      prompt += `\n\n可用上下文符号:\n${context.symbols.slice(0, 10).map(s => `- ${s.type}: ${s.name}`).join('\n')}`;
    }

    prompt += '\n\n要求:\n1. 代码简洁高效\n2. 遵循最佳实践\n3. 添加必要注释\n4. 考虑错误处理';

    return prompt;
  }

  buildUserPrompt(prompt, options) {
    let userPrompt = prompt;

    if (options.context) {
      userPrompt = `上下文:\n${options.context}\n\n需求:\n${prompt}`;
    }

    if (options.examples) {
      userPrompt += `\n\n参考示例:\n${options.examples}`;
    }

    return userPrompt;
  }

  extractCode(response, language) {
    const codeBlockRegex = new RegExp('```' + language + '*\\n([\\s\\S]*?)```', 'g');
    const matches = response.match(codeBlockRegex);

    if (matches && matches.length > 0) {
      const code = matches[0].replace(/```\w*\n/, '').replace(/```$/, '');
      return code.trim();
    }

    const genericRegex = /```\w*\n([\s\S]*?)```/g;
    const genericMatch = response.match(genericRegex);

    if (genericMatch && genericMatch.length > 0) {
      const code = genericMatch[0].replace(/```\w*\n/, '').replace(/```$/, '');
      return code.trim();
    }

    return response;
  }

  generateDiff(oldCode, newCode) {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const diff = [];

    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        diff.push({ type: 'add', line: i + 1, content: newLine });
      } else if (newLine === undefined) {
        diff.push({ type: 'remove', line: i + 1, content: oldLine });
      } else if (oldLine !== newLine) {
        diff.push({ type: 'change', line: i + 1, old: oldLine, new: newLine });
      }
    }

    return diff;
  }
}

module.exports = CodeGenerator;
