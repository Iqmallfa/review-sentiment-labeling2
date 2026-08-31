import pandas as pd
from app.database.session import SessionLocal, engine, Base
from app.models.review import Review
from app.models.user import User
from app.models.review_history import ReviewValidationHistory  # BARU: supaya tabelnya ikut dibuat
from app.data_processing.loader import load_raw_reviews
from app.data_processing.pipeline import preprocess
from app.core.config import settings


def seed_reviews():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_count = db.query(Review).count()
        if existing_count > 0:
            print(f"Tabel reviews sudah berisi {existing_count} baris. Seeding dilewati.")
            return

        raw_df = load_raw_reviews()
        filtered_df = preprocess(raw_df)

        # Batasi jumlah data jika SEED_LIMIT di-set (> 0)
        if settings.seed_limit > 0:
            filtered_df = filtered_df.head(settings.seed_limit)
            print(f"SEED_LIMIT aktif: hanya mengambil {settings.seed_limit} baris pertama.")

        for _, row in filtered_df.iterrows():
            review = Review(
                temp_pk=row["TEMP_PK"],
                sort_index=int(row["SORT_INDEX"]),
                tanggal_review=row["TANGGAL_REVIEW"] if pd.notna(row["TANGGAL_REVIEW"]) else None,
                isi_ulasan=row["ISI_ULASAN"] if pd.notna(row["ISI_ULASAN"]) else None,
                negatif=row["NEGATIF"] if pd.notna(row["NEGATIF"]) else None,
                sentimen_model63=row["SENTIMEN_MODEL63"] if pd.notna(row["SENTIMEN_MODEL63"]) else None,
                konsistensi_sentimen=row["KONSISTENSI_SENTIMEN"],
            )
            db.add(review)

        db.commit()
        print(f"Berhasil menyimpan {len(filtered_df)} baris ke database.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_reviews()