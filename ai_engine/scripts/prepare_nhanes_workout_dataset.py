import os
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(BASE_DIR, "..", "datasets", "nhanes_raw")
OUTPUT_PATH = os.path.join(BASE_DIR, "..", "datasets", "nhanes_workout_base.csv")


def load_xpt(filename: str) -> pd.DataFrame:
    path = os.path.join(RAW_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Файл не найден: {path}")
    return pd.read_sas(path, format="xport")


def map_gender(value):
    if pd.isna(value):
        return None
    if int(value) == 1:
        return "Male"
    if int(value) == 2:
        return "Female"
    return None


def derive_activity_level(row):
    vig_days = 0
    mod_days = 0
    sitting = row.get("PAD680")

    if row.get("PAQ650") == 1 and not pd.isna(row.get("PAQ655")):
        vig_days = int(row.get("PAQ655"))

    if row.get("PAQ665") == 1 and not pd.isna(row.get("PAQ670")):
        mod_days = int(row.get("PAQ670"))

    score = 0

    if vig_days >= 4:
        score += 2
    elif vig_days >= 2:
        score += 1

    if mod_days >= 5:
        score += 2
    elif mod_days >= 3:
        score += 1

    if not pd.isna(sitting) and sitting >= 480:
        score -= 1

    if score <= 0:
        return 1
    if score == 1:
        return 2
    if score == 2:
        return 3
    return 4


def derive_limitations(row):
    # MCQ160A = arthritis
    if row.get("MCQ160A") == 1:
        return "joints"
    return "none"


def main():
    demo = load_xpt("P_DEMO.xpt")[["SEQN", "RIDAGEYR", "RIAGENDR"]].copy()

    bmx = load_xpt("P_BMX.xpt")[
        ["SEQN", "BMXHT", "BMXWT", "BMXBMI", "BMXWAIST", "BMXHIP", "BMXARMC"]
    ].copy()

    paq = load_xpt("P_PAQ.xpt")[
        ["SEQN", "PAQ650", "PAQ655", "PAQ665", "PAQ670", "PAD680"]
    ].copy()

    mcq = load_xpt("P_MCQ.xpt")[
        ["SEQN", "MCQ160A"]
    ].copy()

    df = demo.merge(bmx, on="SEQN", how="inner")
    df = df.merge(paq, on="SEQN", how="left")
    df = df.merge(mcq, on="SEQN", how="left")

    # только взрослые
    df = df[df["RIDAGEYR"] >= 18].copy()

    df["gender"] = df["RIAGENDR"].apply(map_gender)
    df["activity_level"] = df.apply(derive_activity_level, axis=1)
    df["limitations"] = df.apply(derive_limitations, axis=1)

    result = pd.DataFrame({
        "seqn": df["SEQN"],
        "age": df["RIDAGEYR"],
        "gender": df["gender"],
        "height": df["BMXHT"],
        "weight": df["BMXWT"],
        "bmi": df["BMXBMI"],
        "waist": df["BMXWAIST"],
        "hip": df["BMXHIP"],
        "arm": df["BMXARMC"],
        "activity_level": df["activity_level"],
        "limitations": df["limitations"],
    })

    result = result.dropna(subset=["age", "gender", "height", "weight", "bmi"]).copy()

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    result.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")

    print("Готово.")
    print(f"Сохранено в: {OUTPUT_PATH}")
    print(f"Строк: {len(result)}")
    print(result.head(10).to_string(index=False))


if __name__ == "__main__":
    main()