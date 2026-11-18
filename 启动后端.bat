@echo off
chcp 65001 >nul
title 莨珠记·云纱智境 后端启动
cd /d "%~dp0backend"

echo ==========================================
echo    莨珠记·云纱智境 后端服务
echo ==========================================
echo.

REM 检查 Python
where python >nul 2>nul
if errorlevel 1 (
    echo [错误] 未找到 Python！
    echo.
    echo 解决办法：
    echo   1. 打开 https://www.python.org/downloads/
    echo   2. 下载 Windows installer (64-bit)
    echo   3. 安装时务必勾选 "Add python.exe to PATH"
    echo   4. 装完重新双击本文件
    echo.
    pause
    exit /b 1
)

echo [1/2] 找到 Python:
python --version
echo.

REM 检查依赖
python -c "import fastapi, uvicorn, httpx" >nul 2>nul
if errorlevel 1 (
    echo [2/2] 正在安装依赖，请稍等...
    python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    echo.
) else (
    echo [2/2] 依赖已就绪
)

echo.
echo ==========================================
echo   服务启动中，不要关闭本窗口！
echo   网页地址: http://127.0.0.1:8000
echo   接口文档: http://127.0.0.1:8000/docs
echo ==========================================
echo.

python run.py

echo.
echo 服务已停止。
pause
