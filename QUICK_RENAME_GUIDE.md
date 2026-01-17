# 🚀 快速重命名指南

## 推荐项目名
**tshirt-design-extractor** ✅

## 3 步完成重命名

### 1️⃣ 在 GitHub 上重命名
1. 打开仓库 → **Settings** → **Repository name**
2. 输入新名字：`tshirt-design-extractor`
3. 点击 **Rename**

### 2️⃣ 更新本地远程地址

**Windows (PowerShell/CMD)**:
```bash
# 方法 1: 使用脚本（推荐）
rename-repo.bat YOUR_GITHUB_USERNAME

# 方法 2: 手动执行
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor.git
git remote -v
git fetch origin
```

**macOS/Linux**:
```bash
# 方法 1: 使用脚本（推荐）
chmod +x rename-repo.sh
./rename-repo.sh YOUR_GITHUB_USERNAME

# 方法 2: 手动执行
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor.git
git remote -v
git fetch origin
```

### 3️⃣ 提交更改
```bash
git add package.json README.md INSTALL.md
git commit -m "chore: 更新项目名为 tshirt-design-extractor"
git push origin main
```

## ✅ 完成！

新仓库地址：`https://github.com/YOUR_GITHUB_USERNAME/tshirt-design-extractor`

---

**需要详细说明？** 查看 [RENAME_PROJECT.md](./RENAME_PROJECT.md)
