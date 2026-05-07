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

## 技术栈

### 第一季（JavaScript + HTML）
- **AST解析**: tree-sitter、tree-sitter-javascript、tree-sitter-html
- **前端**: Vue3 + Vite
- **桌面**: Electron
- **存储**: better-sqlite3、leveldb
- **AI**: DeepSeek、Qwen、ChatGPT等

### 第二季（扩展语言）
- **TypeScript**: tree-sitter-typescript
- **Vue**: tree-sitter-vue
- **CSS**: tree-sitter-css
- **Rust**: tree-sitter-rust、Tauri
- **虚拟OS**: WebGPU、虚拟文件系统

## 功能特性

### 已实现（第一季）
- [x] 对话框交互界面
- [x] AI代码生成（JavaScript + HTML）
- [x] AST常驻索引
- [x] 增量更新
- [x] Spec/Vibe双模式
- [x] Git自动提交
- [x] 浏览器预览

### 规划中（第二季）
- [ ] TypeScript支持
- [ ] Vue组件支持
- [ ] CSS样式生成
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
- 双模式开发的适用场景
- 技术难点和解决方案
- **为下一代AI IDE提供设计依据**

## 贡献指南

欢迎贡献！本项目作为探索性项目，欢迎：
- 技术讨论和建议
- 功能验证反馈
- 技术方案优化
- 文档完善

## 文档

- [第一季技术规格](./ide.txt) - JavaScript + HTML基础验证
- [第二季技术规格](./idev2.txt) - 多语言和高级功能扩展

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
