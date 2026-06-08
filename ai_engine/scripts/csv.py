import pandas as pd
import matplotlib.pyplot as plt

path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\ai_engine\datasets\nutrition_recommendation_sampled.csv"
df = pd.read_csv(path)

label_counts = df["label"].value_counts().sort_index()

plt.figure(figsize=(7, 5))
plt.bar(label_counts.index.astype(str), label_counts.values)
plt.title("Nutrition recommendation dataset-тегі label үлестірімі")
plt.xlabel("Label")
plt.ylabel("Жазбалар саны")
plt.grid(axis="y", alpha=0.25)
plt.tight_layout()
plt.savefig("nutrition_label_distribution.png", dpi=300)
plt.show()

print(label_counts)