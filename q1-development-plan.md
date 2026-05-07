# AST-IDE 一季度开发计划

## 项目定位
AI全权管控的Web开发工具（探索性验证项目）

## 核心目标
1. 验证AI全权管控开发流程可行性
2. 验证对话框交互体验
3. 构建AST增量索引核心能力
4. 实现AST+后台服务验证体系（无需编译check）
5. 实现Spec/Vibe双模式开发

## 开发阶段

### 阶段一：底层基础（第1-3周）
- [x] AST解析引擎（tree-sitter + JS/HTML/CSS解析器）
- [x] 增量索引系统（chokidar监听 + 局部刷新）
- [x] 符号存储（SQLite全局符号表 + LevelDB AST缓存）
- [x] 源码管控服务（IDE服务全权管理源码目录）

### 阶段二：验证体系（第4-6周）
- [x] 静态验证（AST语法验证、DOM引用验证、ID唯一性）
- [ ] WebGPU渲染引擎（HTML/CSS渲染、布局计算）
- [x] 后台验证服务（TypeError检测、逻辑完整性、安全风险）
- [x] 内置Web规范库（HTML5/CSS3/ES6+规范）

### 阶段三：AI集成（第7-9周）
- [x] AI模型对接（本地模型 + 远程API）
- [x] 精准代码切片（AST索引 + 符号级片段提取）
- [x] 上下文管理（会话压缩 + AST辅助上下文）
- [x] 代码生成与合并（AI生成 + AST合并）

### 阶段四：交互界面（第10-12周）
- [x] 对话框交互（Vue3 + Electron）
- [x] Spec/Vibe模式切换
- [x] AST树只读查看
- [x] Git集成（isomorphic-git自动提交）

## 核心技术栈
- **AST层**：tree-sitter、better-sqlite3、leveldb、chokidar
- **渲染层**：自研WebGPU引擎（HTML/CSS/JS渲染）
- **验证层**：Node.js沙箱、内置Web规范
- **AI层**：本地/远程模型API、上下文压缩
- **UI层**：Vue3、Vite、Electron

## 验证指标
- 静态验证覆盖率：100%（语法）、95%+（语义）
- 动态验证覆盖率：95-98%
- 验证速度：< 700ms
- 置信度：95-98%
- 用户等待：< 1秒

## 支持语言
- JavaScript (ES6+)
- HTML
- CSS

## 交付成果
1. AST增量索引核心能力
2. WebGPU渲染引擎原型
3. AST+后台服务验证体系
4. 对话框交互界面
5. Spec/Vibe双模式
6. 技术验证数据和踩坑经验
