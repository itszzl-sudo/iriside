require('dotenv').config();
const express = require('express');
const { createServer } = require('vite');
const path = require('path');
const { AIConnector, DeepSeekProvider, OpenAIProvider } = require('./src/ai-engine/AIConnector');
const CodeGenerator = require('./src/ai-engine/CodeGenerator');
const ContextManager = require('./src/ai-engine/ContextManager');

async function startServer() {
  const app = express();
  app.use(express.json());

  // 初始化AI
  const aiConnector = new AIConnector();
  aiConnector.registerProvider('deepseek', new DeepSeekProvider());
  aiConnector.registerProvider('openai', new OpenAIProvider());
  
  const contextManager = new ContextManager();
  const codeGenerator = new CodeGenerator(aiConnector, contextManager);

  // API路由
  app.post('/api/generate', async (req, res) => {
    try {
      const { prompt, mode } = req.body;
      
      console.log(`[${new Date().toLocaleTimeString()}] 收到请求: ${prompt.substring(0, 50)}...`);
      
      contextManager.createSession(Date.now().toString());
      
      const result = await codeGenerator.generateFile(prompt, {
        language: 'html',
        provider: process.env.AI_PROVIDER || 'deepseek'
      });
      
      console.log(`[${new Date().toLocaleTimeString()}] 生成成功`);
      
      res.json({
        success: true,
        code: result.code,
        language: result.language,
        message: '代码生成成功'
      });
      
    } catch (error) {
      console.error('生成错误:', error.message);
      res.status(500).json({
        success: false,
        message: `生成失败: ${error.message}`
      });
    }
  });

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
    console.log(`\n请在浏览器打开上述地址开始使用\n`);
  });
}

startServer().catch(console.error);
