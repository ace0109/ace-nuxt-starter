# Ace Nuxt 4 Starter

一个现代化的 Nuxt 4 全栈开发模板，集成了最新的技术栈和最佳实践。

## 🚀 特性

- **Nuxt 4** - 基于 Vue 3 的最新版本
- **TypeScript** - 完整的类型支持
- **Nuxt UI** - 精美的 UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架
- **国际化** - 内置多语言支持 (i18n)
- **API 封装** - 简化的前后端通信方案
- **SSR 优化** - 服务端渲染，SEO 友好
- **开发工具** - ESLint、Prettier、Commitlint

## 📦 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制环境变量示例文件并配置：

```bash
cp .env.example .env
```

主要配置项：
```env
# API 配置
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
NUXT_PUBLIC_API_PREFIX=api

# 服务端口
PORT=3333
```

### 开发运行

```bash
pnpm dev
```

访问 http://localhost:3333

### 生产构建

```bash
# 构建
pnpm build

# 预览
pnpm preview
```

## 🏗️ 项目结构

```
ace-nuxt4/
├── app/                  # 应用目录
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面路由
│   ├── plugins/          # Nuxt 插件
│   └── locales/          # 国际化文件
├── server/               # 服务端目录
│   ├── api/              # API 路由
│   └── utils/            # 服务端工具
├── public/               # 静态资源
└── nuxt.config.ts        # Nuxt 配置
```

## 🔧 核心功能

### API 集成

项目提供了简化的 API 调用方案：

- **客户端**: 使用 `useAPI` 和 `useLazyAPI` 进行数据请求
- **服务端**: 统一的 API 代理和错误处理

示例页面：
- `/api-simple` - 基础 API 使用示例
- `/api-example` - 完整功能展示

### 国际化

内置中英文支持，可通过页面右上角切换语言。

### UI 组件

集成 Nuxt UI 组件库，提供丰富的预设组件和主题支持。

## 📝 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 使用 Conventional Commits 提交规范
- 组件使用 `<script setup>` 语法

## 🚢 部署

### Docker 部署

```bash
docker build -t ace-nuxt4 .
docker run -p 3000:3000 ace-nuxt4
```

### PM2 部署

```bash
pnpm build
pm2 start .output/server/index.mjs
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Built with ❤️ using Nuxt 4