@echo off
REM 项目重命名脚本 (Windows)
REM 使用方法: rename-repo.bat YOUR_GITHUB_USERNAME

setlocal enabledelayedexpansion

REM 检查参数
if "%~1"=="" (
    echo 错误: 请提供你的 GitHub 用户名
    echo 使用方法: rename-repo.bat YOUR_GITHUB_USERNAME
    exit /b 1
)

set USERNAME=%~1
set NEW_REPO_NAME=tshirt-design-extractor

echo === 项目重命名脚本 ===
echo.
echo GitHub 用户名: %USERNAME%
echo 新仓库名: %NEW_REPO_NAME%
echo.

REM 步骤 1: 检查当前远程地址
echo 步骤 1: 检查当前远程地址
git remote -v
echo.

REM 步骤 2: 更新远程地址
echo 步骤 2: 更新远程地址
git remote set-url origin "https://github.com/%USERNAME%/%NEW_REPO_NAME%.git"
echo [OK] 远程地址已更新
echo.

REM 步骤 3: 验证更新
echo 步骤 3: 验证更新
git remote -v
echo.

REM 步骤 4: 测试连接
echo 步骤 4: 测试连接
git fetch origin
if errorlevel 1 (
    echo [ERROR] 连接失败，请检查：
    echo   1. 是否已在 GitHub 上重命名仓库
    echo   2. GitHub 用户名是否正确
    echo   3. 网络连接是否正常
    exit /b 1
)
echo [OK] 连接成功！
echo.

REM 步骤 5: 提交更改
echo 步骤 5: 提交更改
git status --short
if errorlevel 1 (
    echo 没有需要提交的更改
) else (
    echo 发现未提交的更改，是否提交？(Y/N)
    set /p response=
    if /i "!response!"=="Y" (
        git add package.json README.md INSTALL.md
        git commit -m "chore: 更新项目名为 %NEW_REPO_NAME%"
        git push origin main
        if errorlevel 1 (
            git push origin master
        )
        echo [OK] 更改已提交并推送
    )
)
echo.

echo === 重命名完成！ ===
echo.
echo 新仓库地址: https://github.com/%USERNAME%/%NEW_REPO_NAME%
echo.
echo 后续步骤：
echo 1. 访问新的 GitHub 仓库地址验证
echo 2. 更新 CI/CD 配置（如果有）
echo 3. 更新部署平台配置（如果有）
echo 4. 通知团队成员更新他们的本地仓库
echo.
echo 详细信息请查看 RENAME_PROJECT.md
echo.
pause
