require('dotenv').config();
const express = require('express');
const { createServer } = require('vite');
const path = require('path');
const { AIConnector, DeepSeekProvider, OpenAIProvider } = require('./src/ai-engine/AIConnector');
const CodeGenerator = require('./src/ai-engine/CodeGenerator');
const ContextManager = require('./src/ai-engine/ContextManager');
const ASTParser = require('./src/ast-engine/ASTParser');

async function startServer() {
  const app = express();
  
  // 初始化AI
  const aiConnector = new AIConnector();
  aiConnector.registerProvider('deepseek', new DeepSeekProvider());
  aiConnector.registerProvider('openai', new OpenAIProvider());
  
  const contextManager = new ContextManager();
  const codeGenerator = new CodeGenerator(aiConnector, contextManager);
  const astParser = new ASTParser();

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
      
      console.log(`[${new Date().toLocaleTimeString()}] 生成成功，解析AST...`);
      
      // 解析生成的代码为AST
      let astData = null;
      try {
        const code = result.code;
        const ast = astParser.parse(code, 'html', 'generated.html');
        astData = {
          symbols: ast.symbols,
          language: 'html',
          totalSymbols: ast.symbols.length
        };
        console.log(`[${new Date().toLocaleTimeString()}] AST解析成功，${ast.symbols.length}个符号`);
      } catch (parseError) {
        console.error('AST解析失败:', parseError.message);
      }
      
      res.json({
        success: true,
        code: result.code,
        language: result.language,
        message: '代码生成成功',
        astData
      });
      
    } catch (error) {
      console.error('生成错误:', error.message);
      res.status(500).json({
        success: false,
        message: `生成失败: ${error.message}`
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
      
      // 检测语言
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

  // 启动Vite开发服务器
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Vite中间件放在API路由之后
  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ AST-IDE服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'deepseek'}`);
    console.log(`\n请在浏览器打开上述地址开始使用\n`);
  });
}

startServer().catch(console.error);
