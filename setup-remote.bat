@echo off
REM Git 远程地址设置脚本
echo ========================================
echo    Git 远程地址设置向导
echo ========================================
echo.

REM 获取 GitHub 用户名
set /p USERNAME="请输入你的 GitHub 用户名: "

if "%USERNAME%"=="" (
    echo 错误: 用户名不能为空
    pause
    exit /b 1
)

echo.
echo 你输入的用户名是: %USERNAME%
echo.

REM 询问仓库名
echo 请选择仓库名:
echo 1. tshirt-design-extractor (推荐)
echo 2. 使用其他名字
echo.
set /p CHOICE="请选择 (1 或 2): "

if "%CHOICE%"=="1" (
    set REPO_NAME=tshirt-design-extractor
) else (
    set /p REPO_NAME="请输入仓库名: "
)

echo.
echo ========================================
echo 配置信息:
echo   GitHub 用户名: %USERNAME%
echo   仓库名: %REPO_NAME%
echo   完整地址: https://github.com/%USERNAME%/%REPO_NAME%.git
echo ========================================
echo.

set /p CONFIRM="确认以上信息正确吗? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

echo.
echo 正在更新远程地址...
git remote set-url origin "https://github.com/%USERNAME%/%REPO_NAME%.git"

if errorlevel 1 (
    echo [错误] 更新失败
    pause
    exit /b 1
)

echo [成功] 远程地址已更新
echo.

echo 当前远程地址:
git remote -v
echo.

echo 正在测试连接...
git fetch origin

if errorlevel 1 (
    echo.
    echo [警告] 连接失败，可能的原因:
    echo   1. 仓库还不存在 - 请先在 GitHub 上创建仓库
    echo   2. 用户名或仓库名错误
    echo   3. 网络连接问题
    echo.
    echo 如果仓库还不存在，请访问:
    echo https://github.com/new
    echo.
    echo 创建仓库后，运行以下命令推送代码:
    echo git push -u origin master
) else (
    echo.
    echo [成功] 连接成功！
    echo.
    echo 你现在可以推送代码:
    echo git push origin master
)

echo.
pause
