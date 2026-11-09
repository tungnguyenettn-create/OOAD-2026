import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent

# Thứ tự nạp cấu hình:
# 1. .env ở thư mục gốc dự án  -> dùng chung với Docker Compose (JWT_SECRET_KEY, ...)
# 2. backend/.env.local        -> ghi đè khi chạy local (ví dụ DATABASE_URL cho SQLite)
# Biến môi trường thật của tiến trình luôn được ưu tiên hơn 2 file trên.
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env.local")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "patient_portal")
DB_USER = os.getenv("DB_USER", "patient_app")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# DATABASE_URL cho phép ghi đè toàn bộ chuỗi kết nối (dùng cho local dev với SQLite).
# Nếu không đặt biến này, backend vẫn kết nối MySQL như cấu hình Docker Compose.
DATABASE_URL = os.getenv("DATABASE_URL") or (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
