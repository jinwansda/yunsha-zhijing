"""云纱智境后端启动脚本（零基础也能直接双击 start_backend.bat 运行）

特点：
1. 自动读取同目录 .env 里的配置注入环境变量（不依赖 python-dotenv）；
2. 未配置 LLM_API_KEY 也能正常启动，/api/ask 会自动降级为本地知识检索；
3. 端口被占用、缺少依赖、被杀毒/安全策略拦截时，都打印中文提示而不是英文堆栈；
4. 默认关闭热重载（reload），避免 Windows 下 uvicorn 子进程启动失败；
   需要开发时热重载可设环境变量 RELOAD=1。
"""
import importlib
import os
import socket
import sys
import time
from pathlib import Path

HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", "8000"))

DLL_BLOCK_HINT = """
  [失败] Windows 的安全策略（智能应用控制 / 应用控制策略）拦截了依赖库的 .dll 文件。
         这不是你操作错了，常见于首次安装刚下载完的包。

  按顺序试这三招（一般第 1 招就好）：
   1) 直接再双击一次 start_backend.bat（多数情况下第二次就正常了）；
   2) 打开 Windows 设置 → 隐私和安全性 → Windows 安全中心 →
      「应用和浏览器控制」→「智能应用控制」→ 设为「关闭」，重启电脑；
   3) 如果还是不行，卸载当前的 Python，改用官网安装包：
      https://www.python.org/downloads/windows/  （安装时勾选 Add python.exe to PATH）
      然后重新双击 start_backend.bat。
"""


def load_env():
    """把 .env 里的 KEY=VALUE 读进环境变量（已存在的系统变量优先）"""
    env_file = Path(__file__).with_name(".env")
    if not env_file.exists():
        return
    try:
        text = env_file.read_text(encoding="utf-8-sig")
    except Exception:
        return
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k and not os.getenv(k):
            os.environ[k] = v


def port_in_use(port):
    """检测端口是否已被别的程序占用"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            s.bind((HOST, port))
            return False
        except OSError:
            return True


def _purge_modules():
    """清理导入失败的半成品模块，保证重试是干净的"""
    for name in list(sys.modules):
        if name.split(".")[0] in ("main", "rag", "realtime", "db", "pydantic", "pydantic_core", "fastapi"):
            sys.modules.pop(name, None)


def load_app():
    """导入 FastAPI 应用；遇到安全策略拦截时自动重试一次"""
    try:
        from main import app
        return app
    except ImportError as e:
        msg = str(e)
        if "DLL load failed" not in msg and "应用程序控制策略" not in msg:
            raise
        print("  依赖库被系统安全策略临时拦截，3 秒后自动重试一次 ...")
        time.sleep(3)
        _purge_modules()
        importlib.invalidate_caches()
        from main import app  # 第二次仍失败就交给外层处理
        return app


def main():
    # 保证能 import 到同目录的 main.py / rag.py
    here = Path(__file__).resolve().parent
    if str(here) not in sys.path:
        sys.path.insert(0, str(here))
    os.chdir(here)

    load_env()

    try:
        import uvicorn
        from rag import LLM_API_KEY, LLM_MODEL
    except ModuleNotFoundError as e:
        print()
        print("  [错误] 缺少依赖包：" + str(e))
        print("  解决办法：双击项目根目录的 start_backend.bat（它会自动安装）")
        print("  或在本文件夹打开命令行执行：")
        print("      python -m pip install -r requirements.txt")
        print()
        input("  按回车键退出...")
        return 1

    print("=" * 58)
    print("  莨珠记 · 云纱智境 后端服务")
    print("  网页地址    http://127.0.0.1:%d" % PORT)
    print("  接口文档    http://127.0.0.1:%d/docs" % PORT)
    print("  WebSocket   ws://127.0.0.1:%d/ws/ue/{session_id}?role=h5" % PORT)
    print("  大模型      " + ("已启用  " + LLM_MODEL if LLM_API_KEY
                              else "未配置密钥（自动降级为本地知识检索，功能照常可用）"))
    print("  运行环境    Python %s" % sys.version.split()[0])
    print("=" * 58)

    if not LLM_API_KEY:
        print("  提示：想用真·大模型回答，把 API Key 填到 backend/.env 的 LLM_API_KEY= 后面即可。")
        print()

    if port_in_use(PORT):
        print("  [错误] 端口 %d 已被占用，可能是上一次的后端还开着。" % PORT)
        print("  解决办法：关掉那个黑窗口，或任务管理器结束 python.exe，然后重新双击 start_backend.bat")
        print()
        input("  按回车键退出...")
        return 1

    # 先把应用导进来（失败就在这里给出人话提示），再宣告启动成功
    try:
        app = load_app()
    except Exception as e:
        text = str(e)
        if "DLL load failed" in text or "应用程序控制策略" in text:
            print(DLL_BLOCK_HINT)
        elif isinstance(e, ModuleNotFoundError):
            print("\n  [错误] 缺少依赖包：" + text)
            print("  请重新双击 start_backend.bat，让它自动安装依赖。\n")
        else:
            print("\n  [错误] 启动失败：%s: %s" % (type(e).__name__, text))
            print("  请把本窗口的报错截图发给老师。\n")
        input("  按回车键退出...")
        return 1

    print("  服务已启动，请不要关闭本窗口。按 Ctrl+C 可停止。")
    print()

    reload_flag = os.getenv("RELOAD", "0") == "1"
    try:
        if reload_flag:
            uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
        else:
            uvicorn.run(app, host=HOST, port=PORT, log_level="info")
    except KeyboardInterrupt:
        print("\n  后端已停止。")
    except OSError as e:
        print("\n  [错误] 启动失败：" + str(e))
        print("  如果是端口被占用，可换个端口：set PORT=8001 后再运行")
        input("  按回车键退出...")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
