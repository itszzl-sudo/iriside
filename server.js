require('dotenv').config();
const express = require('express');
const { createServer } = require('vite');
const path = require('path');
const fs = require('fs');
const { AIConnector, DeepSeekProvider, OpenAIProvider } = require('./src/ai-engine/AIConnector');
const CodeGenerator = require('./src/ai-engine/CodeGenerator');
const ContextManager = require('./src/ai-engine/ContextManager');
const ASTParser = require('./src/ast-engine/ASTParser');
const StaticValidator = require('./src/ast-engine/StaticValidator');

async function startServer() {
  const app = express();
  
  // 初始化AI
  const aiConnector = new AIConnector();
  aiConnector.registerProvider('deepseek', new DeepSeekProvider());
  aiConnector.registerProvider('openai', new OpenAIProvider());
  
  const contextManager = new ContextManager();
  const codeGenerator = new CodeGenerator(aiConnector, contextManager);
  const astParser = new ASTParser();
  const staticValidator = new StaticValidator();
  
  // 创建输出目录
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // API路由 - 必须在Vite中间件之前
  app.use('/api', express.json());
  
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, mode } = req.body;
      
      console.log(`[${new Date().toLocaleTimeString()}] 收到请求:`, prompt?.substring(0, 50));
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: '缺少prompt参数'
        });
      }
      
      contextManager.createSession(Date.now().toString());
      
      const result = await codeGenerator.generateFile(prompt, {
        language: 'html',
        provider: process.env.AI_PROVIDER || 'deepseek'
      });
      
      console.log(`[${new Date().toLocaleTimeString()}] 生成成功`);
      
      // 自动保存文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `generated-${timestamp}.html`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, result.code, 'utf-8');
      console.log(`[${new Date().toLocaleTimeString()}] 已保存: ${filename}`);
      
      // 自动验证
      let validation = null;
      try {
        const validationResult = staticValidator.validate(result.code, 'html', filename);
        validation = {
          valid: validationResult.valid,
          errors: validationResult.errors.length,
          warnings: validationResult.warnings.length
        };
        
        if (!validationResult.valid) {
          console.log(`[${new Date().toLocaleTimeString()}] 验证发现 ${validation.errors} 个问题`);
        }
      } catch (valError) {
        console.error('验证失败:', valError.message);
      }
      
      // 解析AST
      let astData = null;
      try {
        const code = result.code;
        const ast = astParser.parse(code, 'html', filename);
        
        const lines = code.split('\n');
        const symbolsWithCode = ast.symbols.map(symbol => {
          const startRow = symbol.startPosition.row;
          const endRow = symbol.endPosition.row;
          const codeSnippet = lines.slice(startRow, endRow + 1).join('\n');
          
          return {
            ...symbol,
            code: codeSnippet
          };
        });
        
        astData = {
          symbols: symbolsWithCode,
          language: 'html',
          totalSymbols: symbolsWithCode.length,
          sourceCode: code
        };
      } catch (parseError) {
        console.error('AST解析失败:', parseError.message);
      }
      
      res.json({
        success: true,
        code: result.code,
        language: result.language,
        message: '代码生成成功',
        file: filename,
        astData,
        validation
      });
      
    } catch (error) {
      console.error('生成错误:', error.message);
      res.status(500).json({
        success: false,
        message: `生成失败: ${error.message}`
      });
    }
  });

  // 直接保存代码路由（Hello World功能）
  app.post('/api/save-direct', async (req, res) => {
    try {
      const { code, filename } = req.body;
      
      if (!code || !filename) {
        return res.status(400).json({
          success: false,
          message: '缺少code或filename参数'
        });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFilename = `hello-${timestamp}-${filename}`;
      const filepath = path.join(outputDir, finalFilename);
      
      fs.writeFileSync(filepath, code, 'utf8');
      console.log(`[${new Date().toLocaleTimeString()}] 已保存:`, finalFilename);
      
      res.json({
        success: true,
        file: finalFilename,
        message: '代码保存成功'
      });
      
    } catch (error) {
      console.error('保存错误:', error.message);
      res.status(500).json({
        success: false,
        message: `保存失败: ${error.message}`
      });
    }
  });

  // AST解析路由
  app.post('/api/parse-ast', async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: '缺少code参数'
        });
      }
      
      let language = 'html';
      if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
        language = 'javascript';
      } else if (code.includes('{') && code.includes(':') && !code.includes('<')) {
        language = 'css';
      }
      
      const ast = astParser.parse(code, language, 'temp');
      
      res.json({
        success: true,
        symbols: ast.symbols,
        language,
        totalSymbols: ast.symbols.length
      });
      
    } catch (error) {
      console.error('AST解析错误:', error.message);
      res.status(500).json({
        success: false,
        message: `解析失败: ${error.message}`
      });
    }
  });

  // 打开预览路由
  app.post('/api/open-preview', async (req, res) => {
    try {
      const { file } = req.body;
      const filepath = path.join(outputDir, file);
      
      if (fs.existsSync(filepath)) {
        const { exec } = require('child_process');
        exec(`start "" "${filepath}"`);
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: '文件不存在' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 静态文件服务 - 提供output目录访问
  app.use('/output', express.static(outputDir));

  // 启动Vite开发服务器
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ AST-IDE服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'deepseek'}`);
    console.log(`📁 输出目录: ${outputDir}`);
    console.log(`\n请在浏览器打开上述地址开始使用\n`);
  });
}

startServer().catch(console.error);
