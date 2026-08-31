from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import auth, reviews, admin
from app.database.seed_users import seed_users
from app.data_processing.seed import seed_reviews

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reviews.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    """Otomatis buat user & seed data review setiap server nyala (aman diulang)."""
    seed_users()
    seed_reviews()


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend is running",
        "environment": settings.environment,
    }

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.core.config import settings
# from app.routes import auth, reviews, admin

# app = FastAPI(title=settings.app_name)
# # Izinkan frontend (origin berbeda) mengakses backend ini.
# # Tanpa ini, browser akan memblokir semua request dari frontend.
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.include_router(auth.router) 
# app.include_router(reviews.router)
# app.include_router(admin.router)


# @app.get("/health")
# def health_check():
#     """Endpoint sederhana untuk memastikan server hidup."""
#     return {    
#         "status": "ok",
#         "message": "Backend is running",
#         "environment": settings.environment,
#     }