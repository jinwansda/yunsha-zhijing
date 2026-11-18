# 莨珠记·云纱智境 —— 容器化部署（SnapDeploy / 通用 Docker 平台均可使用）
# 后端 FastAPI 同时托管前端静态资源（js / css / assets / index.html），同源访问。
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 先单独复制依赖清单，充分利用 Docker 构建缓存
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# 复制整站源码与前端静态资源
COPY . .

# 后端源码目录（main.py / rag.py / realtime.py / run.py）
WORKDIR /app/backend

EXPOSE 8000

# 平台会注入 PORT 环境变量；应用必须绑 0.0.0.0。免费小规格用单 worker。
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
