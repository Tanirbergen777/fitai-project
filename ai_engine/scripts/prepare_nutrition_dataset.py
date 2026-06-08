from pathlib import Path
import pandas as pd

INPUT_PATH = Path(__file__).resolve().parent.parent / "datasets" / "nutrition_recommendation_data.csv"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "datasets" / "nutrition_recommendation_sampled.csv"

SAMPLE_SIZE = 200_000
RANDOM_STATE = 42


def main():
    print(f"Читаю датасет: {INPUT_PATH}")
    df = pd.read_csv(INPUT_PATH)

    print("Размер исходного датасета:", df.shape)
    print("\nРаспределение label:")
    print(df["label"].value_counts())

    # Перемешиваем
    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

    # Балансируем по label
    df_0 = df[df["label"] == 0]
    df_1 = df[df["label"] == 1]

    half = SAMPLE_SIZE // 2
    n0 = min(len(df_0), half)
    n1 = min(len(df_1), half)

    sampled = pd.concat([
        df_0.sample(n=n0, random_state=RANDOM_STATE),
        df_1.sample(n=n1, random_state=RANDOM_STATE),
    ])

    sampled = sampled.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

    print("\nРазмер sampled датасета:", sampled.shape)
    print("\nРаспределение label после sampling:")
    print(sampled["label"].value_counts())

    sampled.to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")
    print(f"\nГотово. Sampled датасет сохранен: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()