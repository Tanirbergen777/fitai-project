import json
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "datasets"

LIVE_SAMPLES_PATH = DATA_DIR / "camera_live_samples.csv"
REP_EVENTS_PATH = DATA_DIR / "camera_rep_events.csv"

LIVE_OUTPUT_PATH = DATA_DIR / "camera_live_samples_flat.csv"
REP_OUTPUT_PATH = DATA_DIR / "camera_rep_events_flat.csv"
ML_OUTPUT_PATH = DATA_DIR / "camera_ml_dataset.csv"


def safe_json_loads(value):
    if pd.isna(value) or value is None or value == "":
        return {}
    if isinstance(value, dict):
        return value
    try:
        return json.loads(value)
    except Exception:
        return {}


def flatten_features_column(df: pd.DataFrame, column_name: str = "features_json") -> pd.DataFrame:
    if column_name not in df.columns:
        return df.copy()

    features_series = df[column_name].apply(safe_json_loads)
    features_df = pd.json_normalize(features_series)

    if features_df.empty:
        return df.drop(columns=[column_name], errors="ignore")

    features_df.columns = [f"feature_{col}" for col in features_df.columns]
    base_df = df.drop(columns=[column_name], errors="ignore").reset_index(drop=True)
    features_df = features_df.reset_index(drop=True)

    return pd.concat([base_df, features_df], axis=1)


def prepare_live_samples(df: pd.DataFrame) -> pd.DataFrame:
    df = flatten_features_column(df, "features_json")

    if "exercise_mode" in df.columns:
        df["exercise_mode"] = df["exercise_mode"].fillna("unknown")

    if "stage" in df.columns:
        df["stage"] = df["stage"].fillna("unknown")

    if "error_type" in df.columns:
        df["error_type"] = df["error_type"].fillna("none")

    return df


def prepare_rep_events(df: pd.DataFrame) -> pd.DataFrame:
    df = flatten_features_column(df, "features_json")

    if "exercise_mode" in df.columns:
        df["exercise_mode"] = df["exercise_mode"].fillna("unknown")

    if "stage" in df.columns:
        df["stage"] = df["stage"].fillna("unknown")

    if "error_type" in df.columns:
        df["error_type"] = df["error_type"].fillna("none")

    if "is_correct" in df.columns:
        df["target_is_correct"] = df["is_correct"].astype(int)

    return df


def build_ml_dataset(live_df: pd.DataFrame, rep_df: pd.DataFrame) -> pd.DataFrame:
    live_df = live_df.copy()
    rep_df = rep_df.copy()

    if "session_id" not in live_df.columns or "session_id" not in rep_df.columns:
        return rep_df

    if "exercise_mode" not in live_df.columns:
        live_df["exercise_mode"] = "unknown"

    if "exercise_mode" not in rep_df.columns:
        rep_df["exercise_mode"] = "unknown"

    if "elapsed_seconds" not in live_df.columns:
        live_df["elapsed_seconds"] = 0.0

    live_df["elapsed_seconds"] = pd.to_numeric(
        live_df["elapsed_seconds"], errors="coerce"
    ).fillna(0.0)

    # Для первой версии ML-датасета просто используем rep-events как основную таблицу,
    # а live-samples сохраняем отдельно для будущих sequence/window моделей.
    ml_df = rep_df.copy()

    # Оставляем только полезные признаки + target
    useful_columns = [
        col
        for col in ml_df.columns
        if col.startswith("feature_")
        or col in {
            "session_id",
            "exercise_name",
            "exercise_mode",
            "stage",
            "metric_label",
            "metric_value",
            "error_type",
            "rep_index",
            "score",
            "target_is_correct",
        }
    ]

    ml_df = ml_df[useful_columns].copy()

    if "error_type" in ml_df.columns:
        ml_df["error_type"] = ml_df["error_type"].fillna("none")

    if "stage" in ml_df.columns:
        ml_df["stage"] = ml_df["stage"].fillna("unknown")

    if "exercise_mode" in ml_df.columns:
        ml_df["exercise_mode"] = ml_df["exercise_mode"].fillna("unknown")

    return ml_df


def main():
    if not LIVE_SAMPLES_PATH.exists():
        raise FileNotFoundError(f"Не найден файл live samples: {LIVE_SAMPLES_PATH}")

    if not REP_EVENTS_PATH.exists():
        raise FileNotFoundError(f"Не найден файл rep events: {REP_EVENTS_PATH}")

    live_df = pd.read_csv(LIVE_SAMPLES_PATH)
    rep_df = pd.read_csv(REP_EVENTS_PATH)

    live_flat = prepare_live_samples(live_df)
    rep_flat = prepare_rep_events(rep_df)
    ml_df = build_ml_dataset(live_flat, rep_flat)

    DATA_DIR.mkdir(parents=True, exist_ok=True)

    live_flat.to_csv(LIVE_OUTPUT_PATH, index=False, encoding="utf-8-sig")
    rep_flat.to_csv(REP_OUTPUT_PATH, index=False, encoding="utf-8-sig")
    ml_df.to_csv(ML_OUTPUT_PATH, index=False, encoding="utf-8-sig")

    print("Готово.")
    print(f"Live flat: {LIVE_OUTPUT_PATH}")
    print(f"Rep flat:  {REP_OUTPUT_PATH}")
    print(f"ML data:   {ML_OUTPUT_PATH}")
    print(f"Live rows: {len(live_flat)}")
    print(f"Rep rows:  {len(rep_flat)}")
    print(f"ML rows:   {len(ml_df)}")


if __name__ == "__main__":
    main()