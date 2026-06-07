from pathlib import Path
import pandas as pd

ROOT = Path("ai_engine/datasets/rehab24_raw")
SEG_PATH = ROOT / "Segmentation.csv"

def main():
    if not SEG_PATH.exists():
        raise SystemExit(
            f"Файл табылмады: {SEG_PATH}\n"
            "Алдымен Segmentation.csv жүктеп ал."
        )

    # REHAB24-6 Segmentation.csv semicolon-separated.
    df = pd.read_csv(SEG_PATH, sep=";")

    print("=" * 90)
    print("REHAB24-6 SEGMENTATION INSPECTION")
    print("=" * 90)
    print(f"Path: {SEG_PATH.resolve()}")
    print(f"Rows: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    print("\nFirst 10 rows:")
    print(df.head(10).to_string(index=False))

    print("\nExercise counts:")
    print(df["exercise_id"].value_counts().sort_index().to_string())

    print("\nCorrectness counts overall:")
    print(df["correctness"].value_counts(dropna=False).sort_index().to_string())

    print("\nCorrectness by exercise:")
    print(pd.crosstab(df["exercise_id"], df["correctness"]).to_string())

    # Ex5 = Leg lunge
    lunge_df = df[df["exercise_id"] == 5].copy()

    print("\n" + "=" * 90)
    print("EX5 = LEG LUNGE")
    print("=" * 90)
    print(f"Lunge repetitions: {len(lunge_df)}")

    if lunge_df.empty:
        return

    print("\nLunge correctness counts:")
    print(lunge_df["correctness"].value_counts(dropna=False).sort_index().to_string())

    print("\nLunge subtype counts:")
    print(lunge_df["exercise_subtype"].value_counts(dropna=False).to_string())

    print("\nLunge camera orientation counts:")
    print(lunge_df["cam17_orientation"].value_counts(dropna=False).to_string())

    print("\nLunge video count:")
    print(lunge_df["video_id"].nunique())

    print("\nLunge unique videos:")
    print(sorted(lunge_df["video_id"].unique().tolist()))

    print("\nFirst 20 lunge rows:")
    print(lunge_df.head(20).to_string(index=False))

    out_path = ROOT / "lunge_segmentation_ex5.csv"
    lunge_df.to_csv(out_path, index=False, encoding="utf-8")
    print(f"\nSaved lunge-only segmentation: {out_path.resolve()}")

if __name__ == "__main__":
    main()