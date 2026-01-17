#!/bin/bash

# 项目重命名脚本
# 使用方法: ./rename-repo.sh YOUR_GITHUB_USERNAME

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供你的 GitHub 用户名${NC}"
    echo "使用方法: ./rename-repo.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

USERNAME=$1
NEW_REPO_NAME="tshirt-design-extractor"

echo -e "${YELLOW}=== 项目重命名脚本 ===${NC}"
echo ""
echo "GitHub 用户名: $USERNAME"
echo "新仓库名: $NEW_REPO_NAME"
echo ""

# 步骤 1: 检查当前远程地址
echo -e "${YELLOW}步骤 1: 检查当前远程地址${NC}"
git remote -v
echo ""

# 步骤 2: 更新远程地址
echo -e "${YELLOW}步骤 2: 更新远程地址${NC}"
git remote set-url origin "https://github.com/$USERNAME/$NEW_REPO_NAME.git"
echo -e "${GREEN}✓ 远程地址已更新${NC}"
echo ""

# 步骤 3: 验证更新
echo -e "${YELLOW}步骤 3: 验证更新${NC}"
git remote -v
echo ""

# 步骤 4: 测试连接
echo -e "${YELLOW}步骤 4: 测试连接${NC}"
if git fetch origin; then
    echo -e "${GREEN}✓ 连接成功！${NC}"
else
    echo -e "${RED}✗ 连接失败，请检查：${NC}"
    echo "  1. 是否已在 GitHub 上重命名仓库"
    echo "  2. GitHub 用户名是否正确"
    echo "  3. 网络连接是否正常"
    exit 1
fi
echo ""

# 步骤 5: 提交更改
echo -e "${YELLOW}步骤 5: 提交更改${NC}"
if git diff --quiet && git diff --cached --quiet; then
    echo "没有需要提交的更改"
else
    echo "发现未提交的更改，是否提交？(y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        git add package.json README.md INSTALL.md
        git commit -m "chore: 更新项目名为 $NEW_REPO_NAME"
        git push origin main || git push origin master
        echo -e "${GREEN}✓ 更改已提交并推送${NC}"
    fi
fi
echo ""

echo -e "${GREEN}=== 重命名完成！ ===${NC}"
echo ""
echo "新仓库地址: https://github.com/$USERNAME/$NEW_REPO_NAME"
echo ""
echo "后续步骤："
echo "1. 访问新的 GitHub 仓库地址验证"
echo "2. 更新 CI/CD 配置（如果有）"
echo "3. 更新部署平台配置（如果有）"
echo "4. 通知团队成员更新他们的本地仓库"
echo ""
echo "详细信息请查看 RENAME_PROJECT.md"
