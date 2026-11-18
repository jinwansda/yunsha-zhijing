@echo off
title 莨珠记 - 云纱智境 后端
cd /d "%~dp0backend"

echo ==========================================
echo    莨珠记 - 云纱智境 后端服务启动器
echo ==========================================
echo.

rem ============================================================
rem  第 1 步：自动挑一个"真能跑起来"的 Python
rem  电脑上可能装了多个 Python：有的版本不存在，有的装了包却因为
rem  安全策略加载不了编译库。这里逐个真跑一句代码验证，谁能用就用谁。
rem ============================================================
set "PYCMD="
for %%C in ("py -3.13" "py -3.12" "py -3.11" "py -3.10" "python" "py -3" "py") do (
  call :pick %%~C
)
if not defined PYCMD goto nopython

echo [2/3] 已选定的 Python：
%PYCMD% -c "import sys;print('      路径：'+sys.executable);print('      版本：'+sys.version.split()[0])"
echo      依赖齐全 OK
echo.
echo      小提示：安装时若出现 "Scripts is not on PATH" 的黄色警告，
echo              可以忽略，不影响启动。

rem ============================================================
rem  第 2 步：启动后端
rem ============================================================
echo.
echo [3/3] 启动后端，请不要关闭本窗口（按 Ctrl+C 可停止）
echo ------------------------------------------
echo   网页地址： http://127.0.0.1:8000
echo   接口文档： http://127.0.0.1:8000/docs
echo ------------------------------------------
echo.

%PYCMD% run.py

echo.
if errorlevel 1 (
  echo ------------------------------------------
  echo 后端没能正常启动。请把本窗口的报错内容截图发给老师或同学。
  echo ------------------------------------------
) else (
  echo ------------------------------------------
  echo 后端已退出。要重新启动，再双击一次本文件即可。
  echo ------------------------------------------
)
echo.
pause
exit /b 0

rem ============================================================
rem  子程序：验证某个 Python 命令能不能真正执行代码
rem  用"打印哨兵 + findstr 查找"判断，因为新版 py 启动器
rem  在版本不存在时也会返回 0，不能只看 errorlevel。
rem ============================================================
:pick
if defined PYCMD goto :eof
%* -c "print('OKPY_SENTINEL')" 2>nul | findstr /c:"OKPY_SENTINEL" >nul
if errorlevel 1 goto :eof

%* -c "import fastapi,uvicorn,pydantic_core;print('OKDEPS_SENTINEL')" 2>nul | findstr /c:"OKDEPS_SENTINEL" >nul
if not errorlevel 1 (
  set "PYCMD=%*"
  goto :eof
)

echo [1/3] 正在为 %* 安装依赖，第一次要下载几分钟，请耐心等待...
echo.
%* -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 (
  echo.
  echo       直连下载失败，改用清华镜像重试...
  %* -m pip install --disable-pip-version-check -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
)
echo.
echo       安装完成，等待 3 秒做安全校验后自检...
timeout /t 3 /nobreak >nul
%* -c "import fastapi,uvicorn,pydantic_core;print('OKDEPS_SENTINEL')" 2>nul | findstr /c:"OKDEPS_SENTINEL" >nul
if not errorlevel 1 set "PYCMD=%*"
goto :eof

rem ============================================================
rem  没有任何可用的 Python
rem ============================================================
:nopython
echo [错误] 没有找到能用的 Python。
echo.
echo 请按下面做（很关键，一步一步来）：
echo   1) 打开 https://www.python.org/downloads/windows/
echo   2) 下载 "Windows installer (64-bit)"，双击安装
echo   3) 安装第一屏最下面，务必勾选  [v] Add python.exe to PATH
echo   4) 装完重启电脑，再双击本文件
echo.
echo 如果你的 Python 是从"微软应用商店"装的，建议卸载后改用上面的
echo 官网安装包：商店版常被 Windows 安全策略拦截，依赖装上了也跑不起来。
echo.
pause
exit /b 1
