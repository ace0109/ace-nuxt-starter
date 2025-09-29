# 🚀 Ace Nuxt 4 Starter

基于 Nuxt 4 的现代化全栈 Web 应用启动模板，集成了最佳实践和开发工具。

## ✨ 特性

- 🔥 **Nuxt 4** - 最新版本的 Vue.js 全栈框架
- 🎨 **Nuxt UI** - 基于 Tailwind CSS 的组件库
- 📝 **TypeScript** - 类型安全的开发体验
- 🎯 **ESLint** - 代码质量检查和自动格式化
- 📦 **pnpm** - 快速、节省磁盘空间的包管理器
- 🏷️ **Standard Version** - 自动化版本管理和 changelog 生成
- 🌐 **多页面结构** - 博客、项目展示等页面

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Nuxt 4
- **样式方案**: Tailwind CSS + Nuxt UI
- **开发语言**: TypeScript
- **包管理器**: pnpm
- **代码规范**: ESLint
- **版本管理**: Standard Version

## 📁 项目结构

```
ace-nuxt4/
├── app/
│   ├── components/     # 公共组件
│   ├── pages/         # 页面路由
│   │   ├── blog/      # 博客相关页面
│   │   └── projects/  # 项目展示页面
│   ├── assets/        # 静态资源
│   └── app.vue        # 根组件
├── public/            # 公共静态文件
├── .vscode/           # VS Code 配置
└── ...
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发服务器

启动开发服务器 `http://localhost:3000`:

```bash
pnpm dev
```

### 代码检查

```bash
# 检查代码质量
pnpm lint

# 自动修复代码格式
pnpm lint:fix
```

## 📦 构建和部署

### 构建生产版本

```bash
pnpm build
```

### 本地预览

```bash
pnpm preview
```

## 🏷️ 版本管理

本项目使用 [Standard Version](https://github.com/conventional-changelog/standard-version) 进行自动化版本管理。

### 发布新版本

```bash
# 自动升级补丁版本 (0.1.0 -> 0.1.1)
pnpm release

# 升级小版本 (0.1.0 -> 0.2.0)
pnpm release:minor

# 升级大版本 (0.1.0 -> 1.0.0)
pnpm release:major
```

### 提交规范

请使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 📖 更多资源

- [Nuxt 文档](https://nuxt.com/docs)
- [Nuxt UI 文档](https://ui.nuxt.com/)
- [Vue 3 文档](https://vuejs.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)

## 📄 许可证

[MIT License](LICENSE)

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
