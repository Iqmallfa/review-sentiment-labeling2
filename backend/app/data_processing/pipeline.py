import pandas as pd


def sort_by_review_date(df: pd.DataFrame) -> pd.DataFrame:
    return df.sort_values(
        by="TANGGAL_REVIEW",
        na_position="last",
        kind="mergesort",
    ).reset_index(drop=True)


def generate_temp_pk(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    indices = range(1, len(df) + 1)
    df["TEMP_PK"] = [f"Dummy-{i}" for i in indices]
    df["SORT_INDEX"] = list(indices)
    return df


def filter_inconsistent_sentiment(df: pd.DataFrame) -> pd.DataFrame:
    return df[df["KONSISTENSI_SENTIMEN"] == "Tidak"].reset_index(drop=True)


def sort_and_generate_temp_pk(df: pd.DataFrame) -> pd.DataFrame:
    """
    BARU: LOAD -> SORT -> TEMP_PK, TANPA filter.
    Dipakai khusus untuk export, supaya SEMUA baris (termasuk yang
    KONSISTENSI_SENTIMEN == "Ya") tetap muncul di file hasil akhir.
    """
    df = sort_by_review_date(df)
    df = generate_temp_pk(df)
    return df


def preprocess(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Pipeline LENGKAP (dengan filter) - dipakai untuk mengisi tabel 'reviews'
    di database (Step 4), TIDAK berubah dari sebelumnya.
    """
    df = sort_and_generate_temp_pk(raw_df)
    df = filter_inconsistent_sentiment(df)
    return df