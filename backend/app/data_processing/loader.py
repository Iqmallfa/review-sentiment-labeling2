import pandas as pd
from app.core.config import settings


def load_raw_reviews() -> pd.DataFrame:
    """
    Sumber data untuk DEVELOPMENT: membaca dari file CSV.

    Ketika nanti pindah ke Oracle, cukup buat fungsi baru
    (misalnya load_raw_reviews_from_oracle) yang juga mengembalikan
    pandas DataFrame dengan kolom yang sama. Fungsi di pipeline.py
    tidak perlu berubah sama sekali.
    """
    df = pd.read_csv(settings.review_csv_path)
    return df