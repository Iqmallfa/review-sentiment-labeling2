import pandas as pd
from sqlalchemy.orm import Session
from app.data_processing.loader import load_raw_reviews
from app.data_processing.pipeline import sort_and_generate_temp_pk
from app.models.review import Review


def build_validation_export(db: Session) -> pd.DataFrame:
    """
    Export TANPA filter: semua baris asli (4870) ikut keluar, bukan cuma
    yang KONSISTENSI_SENTIMEN == "Tidak" (1100). Baris yang tidak pernah
    masuk proses validasi otomatis kosong di 4 kolom barunya.
    """
    raw_df = load_raw_reviews()
    full_df = sort_and_generate_temp_pk(raw_df)  # SEMUA baris, sudah punya TEMP_PK

    reviews = db.query(Review).all()
    validation_rows = [
        {
            "TEMP_PK": r.temp_pk,
            "HASIL_VALIDASI": r.sentimen_validasi,
            "VALIDATION_IN": r.validation_in,
            "VALIDATION_OUT": r.validation_out,
            "VALIDATED_BY": r.validated_by,
        }
        for r in reviews
    ]
    validation_df = pd.DataFrame(validation_rows)

    merged = full_df.merge(validation_df, on="TEMP_PK", how="left")
    merged = merged.drop(columns=["SORT_INDEX"], errors="ignore")

    return merged