# 🔄 项目重命名完整指南

本指南将帮助你将项目从 `my-project` 重命名为 `tshirt-design-extractor`（或其他名字）。

## 📝 推荐的项目名

基于项目功能，推荐以下名字：

1. ✅ **tshirt-design-extractor** - 简洁明了（推荐）
2. **design-extractor** - 更通用
3. **tshirt-pattern-extractor** - 强调图案提取
4. **smart-design-extractor** - 突出智能特性
5. **bg-remove-tshirt** - 强调背景移除功能

## 🎯 完整步骤

### 步骤 1: 在 GitHub 上修改仓库名

1. 打开你的 GitHub 仓库页面
2. 点击右上角的 **Settings**（设置）标签
3. 在页面顶部找到 **Repository name** 字段
4. 输入新名字：`tshirt-design-extractor`
5. 点击 **Rename** 按钮
6. GitHub 会显示确认消息

**注意**: GitHub 会自动设置从旧 URL 到新 URL 的重定向。

### 步骤 2: 更新本地 Git 远程地址

在命令行中执行以下命令：

```bash
# 查看当前远程地址
git remote -v

# 更新远程地址（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote set-url origin https://github.com/YOUR_USERNAME/tshirt-design-extractor.git

# 验证更新
git remote -v

# 测试连接
git fetch origin
```

**如果使用 SSH**:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/tshirt-design-extractor.git
```

### 步骤 3: 更新本地项目文件

本地项目的 `package.json` 已经更新为新名字。如果需要手动修改：

```json
{
  "name": "tshirt-design-extractor",
  "description": "一个基于Vue.js的Web应用，用于自动提取T恤产品照片中的图案设计",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/tshirt-design-extractor.git"
  }
}
```

### 步骤 4: 提交更改

```bash
# 添加修改的文件
git add package.json README.md INSTALL.md

# 提交更改
git commit -m "chore: 更新项目名为 tshirt-design-extractor"

# 推送到 GitHub
git push origin main
```

**注意**: 如果你的主分支是 `master` 而不是 `main`，请使用 `git push origin master`。

### 步骤 5: 验证更改

1. 访问新的 GitHub 仓库地址：
   ```
   https://github.com/YOUR_USERNAME/tshirt-design-extractor
   ```

2. 确认所有文件都已更新

3. 测试克隆新仓库：
   ```bash
   cd ..
   git clone https://github.com/YOUR_USERNAME/tshirt-design-extractor.git test-clone
   cd test-clone
   npm install
   npm run serve
   ```

## 📋 需要更新的其他地方

### 1. CI/CD 配置

如果你使用了 CI/CD 服务（如 GitHub Actions、Travis CI 等），需要更新：

- GitHub Actions: `.github/workflows/*.yml` 文件中的仓库引用
- Travis CI: `.travis.yml` 文件
- CircleCI: `.circleci/config.yml` 文件

### 2. 部署平台

如果已经部署到以下平台，需要更新：

**Netlify**:
1. 登录 Netlify
2. 进入站点设置
3. 在 "Build & deploy" → "Repository" 中更新仓库地址

**Vercel**:
1. 登录 Vercel
2. 进入项目设置
3. 在 "Git" 部分更新仓库连接

**Heroku**:
```bash
heroku git:remote -a your-app-name
git remote set-url heroku https://git.heroku.com/your-app-name.git
```

### 3. 文档链接

检查并更新以下文件中的链接：

- ✅ `README.md` - 已更新
- ✅ `INSTALL.md` - 已更新
- ✅ `package.json` - 已更新
- 其他可能包含仓库链接的文档

### 4. 团队成员

通知团队成员更新他们本地的远程地址：

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/tshirt-design-extractor.git
```

## ✅ 检查清单

完成以下所有步骤后，项目重命名就完成了：

- [ ] 在 GitHub 上重命名仓库
- [ ] 更新本地 Git 远程地址
- [ ] 更新 `package.json` 中的项目名
- [ ] 更新 `README.md` 中的引用
- [ ] 更新 `INSTALL.md` 中的引用
- [ ] 提交并推送更改
- [ ] 验证新仓库地址可以访问
- [ ] 通知团队成员（如果有）
- [ ] 更新 CI/CD 配置（如果有）
- [ ] 更新部署平台配置（如果有）

## 🎉 完成！

项目重命名完成后，你可以：

1. 删除这个指南文件（可选）：
   ```bash
   git rm RENAME_PROJECT.md update-repo-name.md
   git commit -m "docs: 删除重命名指南"
   git push origin main
   ```

2. 继续开发你的项目！

## 💡 提示

- GitHub 会保留旧 URL 的重定向一段时间，但建议尽快更新所有引用
- 如果有多个本地克隆，每个都需要更新远程地址
- 书签、文档中的链接也需要手动更新
- 考虑在旧仓库名的 README 中添加重定向说明（如果有人还在使用旧链接）

## 🆘 遇到问题？

如果遇到问题，可以：

1. 检查 Git 远程地址：`git remote -v`
2. 查看 Git 配置：`git config --list`
3. 重新克隆仓库作为备份
4. 参考 [GitHub 官方文档](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
