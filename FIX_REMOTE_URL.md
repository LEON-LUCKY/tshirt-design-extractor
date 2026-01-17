# 🔧 修复 Git 远程地址

## 问题
当前远程地址包含占位符 `YOUR_USERNAME`，需要替换为实际的 GitHub 用户名。

## 当前状态
```
origin  https://github.com/YOUR_USERNAME/tshirt-design-extractor.git
```

## 解决方案

### 方法 1: 如果你还没有在 GitHub 上创建仓库

1. **先在 GitHub 上创建仓库**
   - 访问 https://github.com/new
   - 仓库名输入：`tshirt-design-extractor`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **更新本地远程地址**（将 `YOUR_GITHUB_USERNAME` 替换为你的实际用户名）
   ```bash
   git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor.git
   ```

3. **推送代码**
   ```bash
   git push -u origin master
   ```

### 方法 2: 如果你已经有 GitHub 仓库

1. **找到你的仓库地址**
   - 打开你的 GitHub 仓库页面
   - 点击绿色的 "Code" 按钮
   - 复制 HTTPS 地址（例如：`https://github.com/john-doe/my-project.git`）

2. **更新本地远程地址**
   ```bash
   git remote set-url origin <你复制的地址>
   ```

3. **验证**
   ```bash
   git remote -v
   git fetch origin
   ```

### 方法 3: 重命名现有仓库

如果你想重命名现有的 GitHub 仓库：

1. **在 GitHub 上重命名**
   - 打开你的仓库
   - Settings → Repository name
   - 输入新名字：`tshirt-design-extractor`
   - 点击 Rename

2. **更新本地地址**（将 `YOUR_GITHUB_USERNAME` 替换为你的实际用户名）
   ```bash
   git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor.git
   git remote -v
   git fetch origin
   ```

## 快速命令模板

请将以下命令中的 `YOUR_GITHUB_USERNAME` 替换为你的实际 GitHub 用户名后执行：

```bash
# 1. 更新远程地址
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor.git

# 2. 验证
git remote -v

# 3. 测试连接
git fetch origin

# 4. 推送代码（如果是新仓库）
git push -u origin master
```

## 示例

假设你的 GitHub 用户名是 `john-doe`：

```bash
git remote set-url origin https://github.com/john-doe/tshirt-design-extractor.git
git remote -v
git fetch origin
```

## 需要帮助？

请告诉我：
1. 你的 GitHub 用户名是什么？
2. 你是否已经在 GitHub 上有这个项目的仓库？
3. 如果有，仓库的当前名字是什么？

我会帮你生成正确的命令！
