import sys
from database import SessionLocal, engine
from models import Base, User, Doctor, Department
from auth import hash_password

INITIAL_DEPARTMENTS = [
    {
        "name": "Khoa Tim mạch",
        "specialization": "Tim mạch",
        "description": "Chẩn đoán và điều trị các bệnh lý tim mạch và mạch máu",
    },
    {
        "name": "Khoa Thần kinh",
        "specialization": "Thần kinh",
        "description": "Khám và điều trị các rối loạn hệ thần kinh",
    },
    {
        "name": "Khoa Nội",
        "specialization": "Nội tổng quát",
        "description": "Khám và điều trị các bệnh nội khoa tổng hợp",
    },
    {
        "name": "Khoa Nhi",
        "specialization": "Nhi khoa",
        "description": "Chăm sóc và điều trị sức khỏe trẻ em",
    },
    {
        "name": "Khoa Răng Hàm Mặt",
        "specialization": "Răng Hàm Mặt",
        "description": "Chăm sóc và điều trị các vấn đề về răng miệng và hàm mặt",
    },
]

INITIAL_ADMINS = [
    {
        "username": "admin",
        "email": "admin@hospital.com",
        "password": "AdminPassword123!",
    },
    {
        "username": "sysadmin",
        "email": "sysadmin@hospital.com",
        "password": "AdminPassword123!",
    },
]

INITIAL_DOCTORS = [
    {
        "username": "dr.nguyen",
        "email": "dr.nguyen@hospital.com",
        "password": "DoctorPassword123!",
        "full_name": "BS. Nguyễn Văn An",
        "license_number": "DOC-VN-001",
        "phone": "0912345671",
        "department_name": "Khoa Tim mạch",
    },
    {
        "username": "dr.tran",
        "email": "dr.tran@hospital.com",
        "password": "DoctorPassword123!",
        "full_name": "BS. Trần Thị Bình",
        "license_number": "DOC-VN-002",
        "phone": "0912345672",
        "department_name": "Khoa Thần kinh",
    },
    {
        "username": "dr.le",
        "email": "dr.le@hospital.com",
        "password": "DoctorPassword123!",
        "full_name": "BS. Lê Hoàng Cường",
        "license_number": "DOC-VN-003",
        "phone": "0912345673",
        "department_name": "Khoa Nội",
    },
    {
        "username": "dr.pham",
        "email": "dr.pham@hospital.com",
        "password": "DoctorPassword123!",
        "full_name": "BS. Phạm Minh Đức",
        "license_number": "DOC-VN-004",
        "phone": "0912345674",
        "department_name": "Khoa Nhi",
    },
    {
        "username": "dr.hoang",
        "email": "dr.hoang@hospital.com",
        "password": "DoctorPassword123!",
        "full_name": "BS. Hoàng Ngọc Dung",
        "license_number": "DOC-VN-005",
        "phone": "0912345675",
        "department_name": "Khoa Răng Hàm Mặt",
    },
]


def seed_departments(db):
    dept_map = {}
    print("🌱 Seeding departments...")
    for item in INITIAL_DEPARTMENTS:
        dept = db.query(Department).filter(Department.name == item["name"]).first()
        if not dept:
            dept = Department(
                name=item["name"],
                specialization=item["specialization"],
                description=item["description"],
            )
            db.add(dept)
            db.flush()
            print(f"  + Created department: {dept.name}")
        else:
            print(f"  ~ Department already exists: {dept.name}")
        dept_map[dept.name] = dept
    return dept_map


def seed_admins(db):
    print("🌱 Seeding admins...")
    for item in INITIAL_ADMINS:
        existing = (
            db.query(User)
            .filter((User.username == item["username"]) | (User.email == item["email"]))
            .first()
        )
        if not existing:
            user = User(
                username=item["username"],
                email=item["email"],
                password_hash=hash_password(item["password"]),
                role="admin",
                is_active=1,
            )
            db.add(user)
            print(f"  + Created admin: {user.username} (Pass: {item['password']})")
        else:
            print(f"  ~ Admin already exists: {item['username']}")


def seed_doctors(db, dept_map):
    print("🌱 Seeding doctors...")
    for item in INITIAL_DOCTORS:
        user_exist = (
            db.query(User)
            .filter((User.username == item["username"]) | (User.email == item["email"]))
            .first()
        )
        if user_exist:
            print(f"  ~ Doctor user already exists: {item['username']}")
            continue

        dept = dept_map.get(item["department_name"])

        user = User(
            username=item["username"],
            email=item["email"],
            password_hash=hash_password(item["password"]),
            role="doctor",
            is_active=1,
        )
        db.add(user)
        db.flush()

        doctor = Doctor(
            user_id=user.id,
            full_name=item["full_name"],
            specialization=dept.specialization if dept else None,
            license_number=item["license_number"],
            phone=item["phone"],
            department=dept.name if dept else item["department_name"],
            department_id=dept.id if dept else None,
        )
        db.add(doctor)
        print(f"  + Created doctor: {doctor.full_name} ({item['username']} / {item['password']}) -> {item['department_name']}")


def seed_data():
    # 3. Tạo toàn bộ các bảng trong MySQL nếu chưa tồn tại
    print("🛠️ Checking and creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        dept_map = seed_departments(db)
        seed_admins(db)
        seed_doctors(db, dept_map)
        db.commit()
        print("✅ Seeding completed successfully!")
    except Exception as exc:
        db.rollback()
        print(f"❌ Seeding failed: {exc}", file=sys.stderr)
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
