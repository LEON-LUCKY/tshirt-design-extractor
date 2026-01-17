# 安装指南

本文档提供详细的安装和配置说明，帮助其他开发者快速设置和运行本项目。

## 📋 前置要求

- **Node.js**: v14.x 或更高版本（推荐 v20.x）
- **npm**: v6.x 或更高版本
- **操作系统**: Windows、macOS 或 Linux

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/tshirt-design-extractor.git
cd tshirt-design-extractor
```

**注意**: 请将 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

### 2. 安装依赖

```bash
npm install
```

**注意**: 如果遇到依赖冲突错误，请确保使用的是兼容的 Node.js 版本（推荐 v20.x）。

### 3. 配置环境变量

1. 复制 `.env.example` 文件并重命名为 `.env`：

```bash
# Windows (CMD)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Remove.bg API 密钥：

```env
VUE_APP_REMOVE_BG_API_KEY=your_actual_api_key_here
```

#### 如何获取 Remove.bg API 密钥

1. 访问 [Remove.bg API](https://www.remove.bg/api)
2. 注册账号或登录
3. 在 API 页面获取你的 API 密钥
4. 免费账号每月有 50 次免费调用额度

### 4. 启动开发服务器

```bash
npm run serve
```

应用将在 `http://localhost:8080` 启动（如果端口被占用，会自动使用其他端口）。

### 5. 运行测试（可选）

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 查看测试覆盖率
npm run test:coverage
```

## 🔧 常见问题

### 问题 1: 依赖安装失败

**错误信息**:
```
npm error ERESOLVE could not resolve
npm error peer babel-jest@"29.x" from @vue/vue2-jest@29.2.6
```

**解决方案**:

这是因为 Jest 版本不兼容。项目已经配置为使用 Jest v29，确保 `package.json` 中的版本如下：

```json
{
  "devDependencies": {
    "babel-jest": "^29.7.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

如果仍有问题，尝试：

```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 2: 端口被占用

**错误信息**:
```
Port 8080 is already in use
```

**解决方案**:

Vue CLI 会自动使用下一个可用端口。如果需要指定端口，可以在 `vue.config.js` 中配置：

```javascript
module.exports = {
  devServer: {
    port: 8081 // 指定端口
  }
}
```

### 问题 3: API 调用失败

**错误信息**:
```
API key invalid or quota exceeded
```

**解决方案**:

1. 检查 `.env` 文件中的 API 密钥是否正确
2. 确认 API 配额是否用完（免费账号每月 50 次）
3. 重启开发服务器以加载新的环境变量

### 问题 4: 测试失败

**解决方案**:

确保所有依赖都已正确安装：

```bash
npm install
npm run test
```

如果特定测试失败，可以单独运行：

```bash
npm run test:unit -- tests/unit/specific-test.spec.js
```

## 📦 生产构建

构建生产版本：

```bash
npm run build
```

构建文件将输出到 `dist/` 目录，可以部署到任何静态文件服务器。

## 🌐 部署

### 部署到 Netlify

1. 在 Netlify 中导入项目
2. 设置构建命令: `npm run build`
3. 设置发布目录: `dist`
4. 在环境变量中添加 `VUE_APP_REMOVE_BG_API_KEY`

### 部署到 Vercel

1. 在 Vercel 中导入项目
2. 框架预设选择 `Vue.js`
3. 在环境变量中添加 `VUE_APP_REMOVE_BG_API_KEY`

## 📝 开发指南

### 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # Vue 组件
├── services/        # 业务逻辑服务
├── utils/           # 工具函数
├── constants.js     # 常量定义
├── App.vue          # 主应用组件
└── main.js          # 应用入口

tests/
├── unit/            # 单元测试
├── properties/      # 属性测试
└── integration/     # 集成测试
```

### 代码规范

运行 ESLint 检查：

```bash
npm run lint
```

### 添加新功能

1. 在 `src/components/` 创建新组件
2. 在 `src/services/` 添加业务逻辑
3. 编写对应的测试文件
4. 运行测试确保通过

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📮 支持

如有问题，请提交 Issue 或查看 [README.md](./README.md) 获取更多信息。
