# 📦 GitHub Pages 部署指南

## ✅ 构建已完成

你的项目已经成功构建！`dist` 目录包含了所有需要部署的文件。

---

## 🚀 部署步骤

### 方法 1: 使用命令行部署（推荐）

在项目目录下运行：

```bash
npm run deploy
```

**注意**：这个命令可能需要 2-3 分钟，请耐心等待。

如果出现超时，可以再次运行：

```bash
npx gh-pages -d dist
```

### 方法 2: 手动部署

如果命令行部署失败，可以手动操作：

#### 步骤 1: 初始化 gh-pages 分支

```bash
# 进入 dist 目录
cd dist

# 初始化 git
git init

# 添加所有文件
git add -A

# 提交
git commit -m "Deploy to GitHub Pages"

# 添加远程仓库
git remote add origin https://github.com/LEON-LUCKY/tshirt-design-extractor.git

# 推送到 gh-pages 分支
git push -f origin master:gh-pages

# 返回项目根目录
cd ..
```

#### 步骤 2: 启用 GitHub Pages

1. 访问你的 GitHub 仓库：
   ```
   https://github.com/LEON-LUCKY/tshirt-design-extractor
   ```

2. 点击 **Settings**（设置）

3. 在左侧菜单找到 **Pages**

4. 在 **Source** 部分：
   - Branch: 选择 `gh-pages`
   - Folder: 选择 `/ (root)`
   - 点击 **Save**

5. 等待 1-2 分钟，页面会显示：
   ```
   Your site is live at https://LEON-LUCKY.github.io/tshirt-design-extractor/
   ```

---

## 🌐 访问你的网站

部署成功后，你的网站地址是：

```
https://LEON-LUCKY.github.io/tshirt-design-extractor/
```

分享这个网址，任何人都可以访问！

---

## 🔄 更新网站

以后每次修改代码后，只需运行：

```bash
npm run deploy
```

网站会自动更新！

---

## ⚠️ 重要提示

### API 密钥安全

**注意**：GitHub Pages 是静态托管，无法使用环境变量。你的 API 密钥会暴露在代码中。

**建议**：
1. 这个部署只用于测试和演示
2. 监控 Remove.bg API 使用量
3. 如果被滥用，及时更换 API 密钥
4. 长期使用建议部署到 Netlify 或 Vercel

### 代理不可用

GitHub Pages 不支持服务器端代理，所以：
- 开发环境的代理配置不会生效
- API 调用会直接从浏览器发送到 Remove.bg
- 可能会遇到 CORS 问题

**解决方案**：
修改 API 调用方式，直接调用 Remove.bg API（已在代码中配置）。

---

## 🐛 常见问题

### Q1: 网站显示 404

**原因**：GitHub Pages 还没有生效

**解决**：
1. 等待 2-3 分钟
2. 检查 Settings → Pages 是否正确配置
3. 确认 gh-pages 分支已创建

### Q2: 网站样式错乱

**原因**：publicPath 配置问题

**解决**：
确认 `vue.config.js` 中的 publicPath 设置正确：
```javascript
publicPath: '/tshirt-design-extractor/'
```

### Q3: API 调用失败

**原因**：CORS 或 API 密钥问题

**解决**：
1. 检查浏览器控制台错误
2. 确认 API 密钥在 `.env` 文件中
3. 重新构建：`npm run build`
4. 重新部署：`npm run deploy`

### Q4: 部署命令卡住

**原因**：网络问题或文件太多

**解决**：
1. 等待 3-5 分钟
2. 如果还是卡住，按 Ctrl+C 停止
3. 使用手动部署方法（方法 2）

---

## 📊 检查部署状态

### 查看 GitHub Actions

1. 访问你的仓库
2. 点击 **Actions** 标签
3. 查看部署状态

### 查看 gh-pages 分支

1. 在仓库页面，点击分支下拉菜单
2. 选择 `gh-pages` 分支
3. 确认文件已上传

---

## 🎉 部署成功！

如果一切顺利，你的网站现在已经上线了！

**网站地址**：
```
https://LEON-LUCKY.github.io/tshirt-design-extractor/
```

**下一步**：
1. 测试所有功能
2. 分享给朋友
3. 收集反馈
4. 持续改进

---

## 💡 升级到更好的托管

如果你想要更好的体验：

1. **Netlify**（推荐）
   - 支持环境变量
   - 更快的部署
   - 更好的安全性

2. **Vercel**
   - 等待验证通过后使用
   - 功能最强大

3. **Cloudflare Pages**
   - 全球 CDN
   - 免费 SSL

查看 `DEPLOYMENT.md` 了解详细步骤。

---

需要帮助？查看项目的其他文档或提交 Issue！
