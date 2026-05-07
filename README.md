# AST-IDE

> 基于常驻AST增量索引的AI集成开发环境 - 探索性前瞻性研究项目

## 项目简介

AST-IDE是一个**探索性前瞻性研究项目**，旨在为下一代AI IDE踩坑和技术验证。本项目非生产级IDE，核心目标是验证AI全权管控、对话框交互、AST索引等创新技术方案的可行性。

## 项目目的

### 核心目标
1. **验证AI全权管控可行性** - 探索AI主导开发的交互模式
2. **验证对话框交互体验** - 测试纯对话式开发的用户接受度
3. **验证AST索引核心能力** - 为精准上下文提取积累经验
4. **验证Spec/Vibe双模式** - 探索规格驱动和氛围驱动的开发流程
5. **技术踩坑** - 为下一代AI IDE规避技术风险

### 探索价值
- **非生产级IDE** - 本项目是技术验证和探索，不追求生产可用性
- **交互创新** - 验证去除代码编辑器、仅对话框交互的可行性
- **AI能力边界** - 探索AI生成代码的质量边界和限制
- **技术选型** - 为下一代AI IDE提供技术选型依据
- **用户体验** - 收集对话式开发的一手反馈

## 核心原则

- ✅ 源码目录由IDE服务全权管控
- ✅ 去除人工修改代码能力
- ✅ 交互界面只有对话框
- ✅ AI负责所有代码生成和修改
- ✅ 无需用户手动编译和check
- ✅ 增强后台验证能力（覆盖率95-98%）

## 技术栈

### 第一季（JavaScript + HTML + CSS）
- **AST解析**: tree-sitter、tree-sitter-javascript、tree-sitter-html、tree-sitter-css
- **自研WebGPU渲染引擎**：HTML+CSS+JavaScript渲染验证（启动<50ms，内存5-20MB）
- **CSSOM内置**：完整CSS对象模型，层叠、布局、响应式、动画验证
- **IDE内置Web规范**：完整HTML5、CSS3、ES6+、Web API规范
- **增强后台服务**：逻辑完整性检测、TypeError深度检测、未执行路径验证
- **AI辅助验证**：隐藏问题识别、测试用例生成、自然语言解释
- **前端**: Vue3 + Vite
- **桌面**: Electron
- **存储**: better-sqlite3、leveldb
- **AI**: DeepSeek、Qwen、ChatGPT等

### 验证能力（第一季）
- **静态验证**：HTML、CSS、JavaScript语法、DOM引用、CSS选择器（100%覆盖，<50ms）
- **渲染引擎验证**：CSS层叠、布局、响应式、动画（95-98%覆盖，<200ms）
- **动态验证**：逻辑完整性、TypeError、未执行路径（95-98%覆盖，<100ms）
- **AI验证**：隐藏问题、性能隐患、安全风险（额外5-10%，<600ms）
- **Web规范验证**：内置规范库验证（98%+覆盖，<10ms）
- **总体验证覆盖率**：95-98%
- **验证速度**：< 700ms（快速）/ < 1000ms（深度）
- **自动化率**：85-95%
- **无外部依赖**：完全自主验证环境

### 第二季（扩展语言）
- **TypeScript**: tree-sitter-typescript
- **Vue**: tree-sitter-vue
- **CSS**: tree-sitter-css
- **Rust**: tree-sitter-rust、Tauri
- **虚拟OS**: WebGPU、虚拟文件系统

## 功能特性

### 已实现（第一季）
- [x] AST解析引擎（tree-sitter + JS/HTML/CSS解析器）
- [x] 符号提取（函数、类、变量、DOM元素、CSS选择器）
- [x] AST缓存和符号表管理
- [x] 增量索引系统（chokidar文件监听）
- [x] 符号存储（SQLite + LevelDB）
- [x] 源码管控服务
- [x] 静态验证（语法、ID唯一性、DOM引用）
- [x] 后台验证服务（TypeError、安全检测、逻辑完整性）
- [x] 内置Web规范库（HTML5/CSS3/ES6+）
- [x] AI模型对接（DeepSeek/OpenAI/Mock）
- [x] 上下文管理（会话压缩）
- [x] 代码生成器
- [x] 代码切片器（精准提取）
- [x] 代码合并器（AST合并）
- [x] 对话框交互界面（Vue3）
- [x] Spec/Vibe模式切换
- [x] AST树只读查看
- [x] Git集成（自动提交）
- [ ] Electron桌面应用
- [ ] 完整Web页面渲染验证
- [ ] 自研WebGPU渲染引擎（启动<50ms）
- [ ] CSSOM完整支持
- [ ] CSS层叠、布局、响应式、动画验证
- [ ] 无浏览器依赖

### 规划中（第二季）
- [ ] TypeScript支持
- [ ] Vue组件支持
- [ ] Rust语言支持
- [ ] 虚拟操作系统
- [ ] 项目派生
- [ ] Rust核心重写
- [ ] Tauri迁移

## 项目结构

```
iris-ast-ide/
├── ide.txt           # 第一季技术规格
├── idev2.txt         # 第二季技术规格
├── README.md         # 项目说明
├── LICENSE           # MIT协议
└── src/              # 源代码（待开发）
    ├── core/         # AST核心
    ├── service/      # IDE服务
    ├── ui/           # 对话框UI
    └── ai/           # AI能力
```

## 开发计划

### 第一季（1.5-2个月）
- [ ] 对话框基础UI
- [ ] AST索引系统
- [ ] IDE服务（源码管控）
- [ ] AI能力集成
- [ ] JavaScript + HTML支持

### 第二季（8-12个月）
- [ ] TypeScript/Vue/CSS支持
- [ ] Rust语言支持
- [ ] 虚拟操作系统
- [ ] 项目派生
- [ ] Rust核心重写
- [ ] 性能优化

## 快速开始

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 安装（待开发）
```bash
git clone https://github.com/your-org/iris-ast-ide.git
cd iris-ast-ide
pnpm install
pnpm dev
```

## 适用场景

### ✅ 适合
- Node.js脚本开发
- 简单HTML页面
- 纯JavaScript库/工具
- 学习和教学项目
- 快速原型验证

### ❌ 不适合
- 大型前端应用
- 需要类型安全的项目（第一季）
- 组件化UI开发（第一季）
- 需要样式的Web应用（第一季）

## 探索成果

本项目预期收获：
- AI全权管控的风险点和优势
- 对话交互的最佳实践
- AST索引的性能和准确度数据
- **增强后台验证体系的有效性证明**
- **无需编译check的可行性证明（95-98%覆盖率）**
- **验证速度提升证明（快15倍）**
- 双模式开发的适用场景
- 技术难点和解决方案
- **为下一代AI IDE提供完整设计依据**

## 贡献指南

欢迎贡献！本项目作为探索性项目，欢迎：
- 技术讨论和建议
- 功能验证反馈
- 技术方案优化
- 文档完善

## 文档

- [第一季技术规格](./ide.txt) - JavaScript + HTML + CSS完整验证
- [第二季技术规格](./idev2.txt) - 多语言和高级功能扩展
- [对比分析（中文）](./COMPARISON_CN.md) - AST-IDE第一季 vs 现有AI IDE详细对比
- [Comparison (English)](./COMPARISON_EN.md) - AST-IDE Season 1 vs Existing AI IDEs

## 协议

[MIT License](./LICENSE)

## 免责声明

本项目为**探索性研究项目**，不保证：
- 生产环境可用性
- 功能完整性
- 稳定性和性能
- 长期维护

使用本项目即表示您了解其探索性质。

## 致谢

感谢所有为下一代AI IDE探索做出贡献的开发者！

---

**注意**: 这是一个踩坑项目，为下一代AI IDE积累经验。如果您需要生产级IDE，请使用成熟的IDE工具。
