import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "datasets" / "nutrition_recommendation_sampled.csv"

def main():
    print(f"Loading dataset: {DATA_PATH}")
    # Read a sample to make KNN faster, e.g., 40,000 rows
    df = pd.read_csv(DATA_PATH).sample(n=40000, random_state=42)

    target_col = "label"
    drop_cols = ["label", "food_name", "rule_score"]
    
    X = df.drop(columns=drop_cols, errors="ignore")
    y = df[target_col]

    categorical_features = ["goal", "meal_slot", "budget", "late_meals", "cooking_mode", "preference", "allergy"]
    numeric_features = ["food_id", "meals_per_day", "already_selected_today", "calories", "protein", "fat", "carbs", 
                        "is_breakfast_food", "is_lunch_food", "is_snack_food", "is_dinner_food", "is_late_food", 
                        "matches_preference", "has_allergy_conflict"]

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, categorical_features),
            ("num", numeric_transformer, numeric_features),
        ]
    )

    models = {
        "KNN": KNeighborsClassifier(n_neighbors=5, n_jobs=-1),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        # RF already known ~ 98.5%
    }

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    for name, model in models.items():
        print(f"\nTraining {name}...")
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"{name} Accuracy: {acc:.4f}")

if __name__ == "__main__":
    main()
