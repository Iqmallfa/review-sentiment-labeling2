from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Review Sentiment Labelling API"
    environment: str = "development"

    review_csv_path: str = "data/raw/review_cleaned.csv"
    database_url: str = "sqlite:///./data/app.db"

    secret_key: str = "dev-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    # BARU: daftar origin yang boleh akses backend, dipisah koma.
    # Development: cuma localhost. Production: tambah domain Vercel.
    cors_origins: str = "http://localhost:3000"

    # Batasi jumlah data yang di-seed ke DB. 0 = tidak ada batasan (pakai semua data).
    seed_limit: int = 0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# from pydantic_settings import BaseSettings, SettingsConfigDict


# class Settings(BaseSettings):
#     """
#     Semua pengaturan aplikasi dibaca dari file .env di sini.
#     Jangan pernah menulis nilai rahasia langsung di kode Python.
#     """

#     app_name: str = "Review Sentiment Labelling API"
#     environment: str = "development"

#     # Lokasi file CSV untuk development.
#     # Nanti saat pindah ke Oracle, setting ini tidak lagi dipakai oleh pipeline,
#     # hanya dipakai oleh loader.py versi CSV.
#     review_csv_path: str = "data/raw/review_cleaned.csv"

#     # DEVELOPMENT: pakai SQLite lokal.
#     # PRODUCTION (TODO / NEED INFORMATION): nanti diganti ke Oracle, contoh formatnya:
#     #   oracle+oracledb://<username>:<password>@<host>:<port>/?service_name=<service_name>
#     # Kredensial Oracle belum tersedia, jadi belum bisa diisi sekarang.
#     database_url: str = "sqlite:///./data/app.db"

#     # PENTING: nilai default ini HANYA untuk development.
#     # Sebelum deployment, wajib diganti dengan nilai acak yang rahasia di .env.
#     secret_key: str = "dev-secret-key-change-this"
#     jwt_algorithm: str = "HS256"
#     access_token_expire_minutes: int = 480  # 8 jam
#     model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# # Dibuat sekali, dipakai berkali-kali di seluruh aplikasi (import settings)
# settings = Settings()