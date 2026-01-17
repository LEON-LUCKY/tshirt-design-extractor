# 更新 Git 远程仓库地址

在 GitHub 上修改仓库名后，需要更新本地的远程仓库地址。

## 方法 1: 使用命令行（推荐）

```bash
# 1. 查看当前远程仓库地址
git remote -v

# 2. 更新远程仓库地址（将 YOUR_USERNAME 和 tshirt-design-extractor 替换为实际值）
git remote set-url origin https://github.com/YOUR_USERNAME/tshirt-design-extractor.git

# 3. 验证更新是否成功
git remote -v

# 4. 测试连接
git fetch origin
```

## 方法 2: 使用 SSH（如果你使用 SSH）

```bash
# 更新为 SSH 地址
git remote set-url origin git@github.com:YOUR_USERNAME/tshirt-design-extractor.git

# 验证
git remote -v
```

## 方法 3: 手动编辑配置文件

1. 打开 `.git/config` 文件
2. 找到 `[remote "origin"]` 部分
3. 修改 `url` 为新的仓库地址：
   ```
   [remote "origin"]
       url = https://github.com/YOUR_USERNAME/tshirt-design-extractor.git
       fetch = +refs/heads/*:refs/remotes/origin/*
   ```

## 验证步骤

```bash
# 拉取最新代码（测试连接）
git pull origin main

# 或者推送代码
git push origin main
```

## 注意事项

- 修改仓库名后，旧的 URL 会自动重定向到新 URL（GitHub 会保留一段时间）
- 但建议尽快更新本地配置，避免将来出现问题
- 如果有多个本地克隆，每个都需要更新
- 如果有 CI/CD 配置，也需要更新相应的仓库地址
