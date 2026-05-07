# AST-IDE 使用指南

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动Vite开发服务器
npm run dev

# 或启动Electron应用（需要安装concurrently和wait-on）
npm run electron:dev
```

### 生产构建

```bash
# 构建前端
npm run build

# 构建Electron应用
npm run electron:build
```

## 功能说明

### 1. 对话框交互

- 输入需求或问题，AI自动生成代码
- 查看生成结果和验证信息
- 接受/拒绝生成的代码

### 2. Spec/Vibe模式

- **Vibe模式**：氛围驱动，自然语言交互
- **Spec模式**：规格驱动，结构化开发

### 3. AST树查看

- 点击"查看AST"按钮查看代码结构
- 展开节点查看详细信息
- 显示符号类型、名称、位置

### 4. Git集成

- 自动提交代码变更
- 查看提交历史
- 文件差异对比

## 配置

### AI模型配置

创建 `.iriside/ai-config.json`：

```json
{
  "defaultProvider": "deepseek",
  "apiKeys": {
    "deepseek": "your-api-key",
    "openai": "your-api-key"
  }
}
```

### 项目配置

在 `.iriside/config.json` 中配置：

```json
{
  "projectPath": "/path/to/project",
  "watch": true,
  "autoCommit": true
}
```

## 核心模块

### AST引擎

```javascript
const { ASTParser } = require('iriside');

const parser = new ASTParser();
const ast = parser.parse(code, 'javascript', 'test.js');
console.log(ast.symbols);
```

### 增量索引

```javascript
const { IncrementalIndexer } = require('iriside');

const indexer = new IncrementalIndexer();
await indexer.scanDirectory('/project/path');
indexer.watch('/project/path');
```

### 代码生成

```javascript
const { AIConnector, CodeGenerator, MockProvider } = require('iriside');

const ai = new AIConnector();
ai.registerProvider('mock', new MockProvider());

const generator = new CodeGenerator(ai);
const result = await generator.generateFunction('add', '计算两数之和');
```

## 架构说明

```
iriside/
├── src/
│   ├── ast-engine/      # AST解析和索引
│   ├── ai-engine/       # AI集成
│   ├── ui/              # Vue3界面
│   │   ├── components/  # UI组件
│   │   └── views/       # 视图
│   └── index.js         # 主入口
├── electron/            # Electron主进程
├── test-project/        # 测试项目
└── .iriside/            # 配置和数据
```

## 技术栈

- **AST**: tree-sitter, better-sqlite3, leveldb
- **AI**: DeepSeek, OpenAI API
- **UI**: Vue3, Vite
- **Desktop**: Electron
- **Git**: isomorphic-git

## 下一步

- 实现WebGPU渲染引擎
- 完善后台验证服务
- 添加Web规范库
- 优化性能和用户体验
