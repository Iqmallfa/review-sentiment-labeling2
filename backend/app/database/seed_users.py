from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import hash_password


def seed_users():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Tabel users sudah berisi data. Seeding dilewati.")
            return

        users = [
            User(username="admin", hashed_password=hash_password("admin123"), role="admin"),
            User(username="validator1", hashed_password=hash_password("validator123"), role="validator"),
        ]
        db.add_all(users)
        db.commit()
        print("Berhasil membuat user: admin (password: admin123), validator1 (password: validator123)")
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()