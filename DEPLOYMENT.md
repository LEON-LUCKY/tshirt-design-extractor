# 🚀 部署指南 - T恤图案提取工具

## 免费部署方案

本项目是一个 Vue.js 前端应用，可以部署到免费的静态网站托管服务。

---

## 方案 1: Vercel 部署（最推荐）⭐

### 为什么选择 Vercel？

- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署（推送代码自动更新）
- ✅ 支持环境变量
- ✅ 零配置，开箱即用

### 部署步骤

#### 1. 准备工作

确保你的代码已经推送到 GitHub：

```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin master
```

#### 2. 注册 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub

#### 3. 导入项目

1. 登录后，点击 "Add New..." → "Project"
2. 选择你的 GitHub 仓库 `tshirt-design-extractor`
3. 点击 "Import"

#### 4. 配置项目

Vercel 会自动检测到这是一个 Vue.js 项目。

**构建设置**（通常自动配置，无需修改）：
- Framework Preset: `Vue.js`
- Build Command: `npm run build`
- Output Directory: `dist`

#### 5. 配置环境变量

**重要**：需要添加 Remove.bg API 密钥

1. 在项目设置页面，找到 "Environment Variables"
2. 添加以下环境变量：

```
VUE_APP_REMOVE_BG_API_KEY = jTJvBundp3dugXgiZyJPp82E
VUE_APP_REMOVE_BG_API_ENDPOINT = /api/remove-bg/v1.0/removebg
VUE_APP_ENABLE_PATTERN_EXTRACTION = true
VUE_APP_PATTERN_PADDING = 20
```

3. 点击 "Save"

#### 6. 部署

1. 点击 "Deploy"
2. 等待 1-2 分钟
3. 部署完成！

#### 7. 访问你的网站

部署成功后，Vercel 会给你一个网址，类似：
```
https://tshirt-design-extractor.vercel.app
```

你可以：
- 分享这个网址给任何人
- 绑定自己的域名（可选）

### 自动部署

以后每次你推送代码到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "更新功能"
git push origin master
```

几分钟后，网站自动更新！

---

## 方案 2: Netlify 部署

### 部署步骤

#### 1. 注册 Netlify

1. 访问 https://www.netlify.com
2. 点击 "Sign up"
3. 选择 "GitHub" 登录

#### 2. 导入项目

1. 点击 "Add new site" → "Import an existing project"
2. 选择 "GitHub"
3. 选择你的仓库 `tshirt-design-extractor`

#### 3. 配置构建设置

- Build command: `npm run build`
- Publish directory: `dist`

#### 4. 配置环境变量

在 "Site settings" → "Environment variables" 中添加：

```
VUE_APP_REMOVE_BG_API_KEY = jTJvBundp3dugXgiZyJPp82E
VUE_APP_REMOVE_BG_API_ENDPOINT = /api/remove-bg/v1.0/removebg
VUE_APP_ENABLE_PATTERN_EXTRACTION = true
VUE_APP_PATTERN_PADDING = 20
```

#### 5. 部署

点击 "Deploy site"，等待部署完成。

你会得到一个网址，类似：
```
https://tshirt-design-extractor.netlify.app
```

---

## 方案 3: GitHub Pages 部署

### 部署步骤

#### 1. 安装 gh-pages

```bash
npm install --save-dev gh-pages
```

#### 2. 修改 package.json

添加部署脚本：

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. 修改 vue.config.js

添加 publicPath：

```javascript
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tshirt-design-extractor/'
    : '/'
}
```

#### 4. 部署

```bash
npm run deploy
```

#### 5. 启用 GitHub Pages

1. 访问你的 GitHub 仓库
2. 进入 Settings → Pages
3. Source 选择 `gh-pages` 分支
4. 点击 Save

你的网站会在：
```
https://LEON-LUCKY.github.io/tshirt-design-extractor/
```

**注意**：GitHub Pages 不支持环境变量，API 密钥会暴露在代码中，不推荐用于生产环境。

---

## 🔒 安全注意事项

### API 密钥保护

**问题**：前端应用中的 API 密钥会暴露给用户

**解决方案**：

#### 方案 A: 使用后端代理（推荐）

创建一个简单的后端服务来代理 API 调用：

1. 使用 Vercel Serverless Functions
2. 使用 Netlify Functions
3. 使用 Cloudflare Workers

#### 方案 B: 限制 API 密钥权限

在 Remove.bg 账号中：
1. 设置每日调用限制
2. 监控 API 使用量
3. 定期更换密钥

#### 方案 C: 添加用户认证

要求用户登录后才能使用，限制滥用。

---

## 📊 部署后的监控

### Vercel Analytics

Vercel 提供免费的访问统计：
1. 进入项目设置
2. 启用 "Analytics"
3. 查看访问量、性能等数据

### 自定义域名

如果你有自己的域名：

1. 在 Vercel/Netlify 项目设置中
2. 找到 "Domains"
3. 添加你的域名
4. 按照提示配置 DNS

---

## 🐛 常见问题

### Q1: 部署后 API 调用失败

**原因**：环境变量未配置

**解决**：
1. 检查 Vercel/Netlify 的环境变量设置
2. 确保变量名正确（必须以 `VUE_APP_` 开头）
3. 重新部署

### Q2: 部署后页面空白

**原因**：路由配置问题

**解决**：
1. 检查 `vue.config.js` 中的 `publicPath`
2. 确保构建成功
3. 查看浏览器控制台错误

### Q3: CORS 错误

**原因**：代理配置在生产环境不生效

**解决**：
1. 开发环境使用代理
2. 生产环境需要后端代理或 Serverless Functions

### Q4: 部署很慢

**原因**：依赖安装时间长

**解决**：
1. 使用 Vercel（通常更快）
2. 清理 `node_modules` 后重新部署
3. 检查网络连接

---

## 📈 性能优化

### 1. 启用 Gzip 压缩

Vercel 和 Netlify 默认启用，无需配置。

### 2. 图片优化

使用 WebP 格式，减小图片大小。

### 3. 代码分割

Vue CLI 默认启用，无需额外配置。

### 4. CDN 加速

Vercel 和 Netlify 自动使用全球 CDN。

---

## 🎉 部署完成检查清单

- [ ] 代码已推送到 GitHub
- [ ] 在 Vercel/Netlify 创建项目
- [ ] 配置环境变量
- [ ] 部署成功
- [ ] 访问网站正常
- [ ] 上传图片功能正常
- [ ] API 调用成功
- [ ] 下载功能正常
- [ ] 分享网址给朋友测试

---

## 📞 需要帮助？

如果部署过程中遇到问题：

1. 查看 Vercel/Netlify 的部署日志
2. 检查浏览器控制台错误
3. 查看本项目的 GitHub Issues
4. 联系 Vercel/Netlify 支持

---

**推荐**：使用 Vercel，最简单、最快、最稳定！

部署愉快！🚀
