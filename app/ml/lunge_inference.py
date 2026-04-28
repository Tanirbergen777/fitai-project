from pathlib import Path
from typing import Any, Dict, Optional
import json
import traceback

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ai_engine" / "models_bin" / "lunge_pose_rf.pkl"
FEATURES_PATH = BASE_DIR / "ai_engine" / "models_bin" / "lunge_pose_feature_columns.json"

_MODEL_BUNDLE: Any = None
_FEATURE_COLUMNS: Optional[list[str]] = None


def _to_number(value: Any) -> Optional[float]:
    if value is None:
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    if pd.isna(number):
        return None

    return number


def _load_feature_columns() -> list[str]:
    if not FEATURES_PATH.exists():
        raise FileNotFoundError(f"Не найден файл признаков lunge: {FEATURES_PATH}")

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        loaded = json.load(f)

    if isinstance(loaded, dict):
        loaded = loaded.get("feature_columns") or loaded.get("columns") or loaded.get("features")

    if not isinstance(loaded, list) or not loaded:
        raise ValueError("lunge_pose_feature_columns.json должен содержать список признаков")

    return [str(col) for col in loaded]


def _ensure_loaded():
    global _MODEL_BUNDLE, _FEATURE_COLUMNS

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Не найдена модель lunge: {MODEL_PATH}")
        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    if _FEATURE_COLUMNS is None:
        _FEATURE_COLUMNS = _load_feature_columns()

    if isinstance(_MODEL_BUNDLE, dict):
        model = (
            _MODEL_BUNDLE.get("model")
            or _MODEL_BUNDLE.get("classifier")
            or _MODEL_BUNDLE.get("pipeline")
        )
        imputer = _MODEL_BUNDLE.get("imputer")
        bundle_features = (
            _MODEL_BUNDLE.get("feature_columns")
            or _MODEL_BUNDLE.get("columns")
            or _MODEL_BUNDLE.get("features")
        )

        if bundle_features:
            _FEATURE_COLUMNS = [str(col) for col in bundle_features]
    else:
        model = _MODEL_BUNDLE
        imputer = None

    if model is None:
        raise ValueError("В lunge_pose_rf.pkl не найден ключ model/classifier/pipeline")

    return model, imputer, _FEATURE_COLUMNS


def _build_feature_row(features_json: Dict[str, Any]) -> pd.DataFrame:
    _, _, feature_columns = _ensure_loaded()

    row = {}
    for col in feature_columns:
        # Негізгі жол: дәл training кезіндегі feature атауы.
        value = _to_number(features_json.get(col))

        # Қосымша alias: кейбір frontend feature атаулары prefix-пен келеді.
        if value is None and col.startswith("feature_"):
            value = _to_number(features_json.get(col.replace("feature_", "", 1)))

        if value is None and not col.startswith("feature_"):
            value = _to_number(features_json.get(f"feature_{col}"))

        row[col] = value

    return pd.DataFrame([row], columns=feature_columns)


def _predict_class_probability(model: Any, X) -> tuple[int, Optional[float]]:
    pred = int(model.predict(X)[0])

    score = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        classes = list(getattr(model, "classes_", []))

        if 1 in classes:
            score = float(proba[classes.index(1)])
        elif "1" in classes:
            score = float(proba[classes.index("1")])
        elif len(proba) > 1:
            score = float(proba[1])
        elif len(proba) == 1:
            score = float(proba[0])

    return pred, score


def _extract_angle(features_json: Dict[str, Any], keys: list[str]) -> Optional[float]:
    values = []
    for key in keys:
        value = _to_number(features_json.get(key))
        if value is not None:
            values.append(value)

    if not values:
        return None

    return min(values)


def _rule_fallback(features_json: Dict[str, Any], reason: str = "lunge_rule_fallback") -> Dict[str, Any]:
    front_knee = _extract_angle(
        features_json,
        [
            "front_knee_angle",
            "feature_front_knee_angle",
            "left_knee_angle",
            "right_knee_angle",
            "feature_left_knee_angle",
            "feature_right_knee_angle",
        ],
    )

    back_knee = _extract_angle(
        features_json,
        [
            "back_knee_angle",
            "feature_back_knee_angle",
            "feature_left_knee_angle",
            "feature_right_knee_angle",
        ],
    )

    torso_lean = _to_number(features_json.get("torso_lean_angle")) or _to_number(
        features_json.get("feature_torso_lean_angle")
    )

    # Бұл fallback тек safety үшін. Негізгі мақсат — ml_rf_lunge.
    # Lunge дұрыс деп санау үшін алдыңғы тізе жеткілікті бүгілуі және корпус қатты құламауы керек.
    if front_knee is None:
        return {
            "is_correct": False,
            "score": 0.35,
            "error_type": "missing_front_knee_angle",
            "feedback": "Fallback: lunge бағалау үшін тізе бұрышы табылмады.",
            "label_source": reason,
        }

    depth_ok = 65 <= front_knee <= 125
    torso_ok = True if torso_lean is None else torso_lean <= 45
    is_correct = bool(depth_ok and torso_ok)

    if is_correct:
        score = 0.75
        feedback = f"Fallback: lunge засчитан. Front knee angle: {round(front_knee, 1)}°"
        error_type = None
    else:
        score = 0.45
        if not depth_ok:
            feedback = f"Fallback: lunge қате. Қозғалыс тереңдігін түзету керек. Front knee angle: {round(front_knee, 1)}°"
            error_type = "rule_lunge_depth"
        else:
            feedback = "Fallback: lunge қате. Корпусты тұрақты ұстау керек."
            error_type = "rule_lunge_torso"

    return {
        "is_correct": bool(is_correct),
        "score": float(round(score, 4)),
        "error_type": error_type,
        "feedback": feedback,
        "label_source": reason,
    }


def evaluate_lunge_features(features_json: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(features_json, dict) or not features_json:
        return _rule_fallback({}, "empty_features_fallback")

    try:
        model, imputer, _ = _ensure_loaded()
        X = _build_feature_row(features_json)
        X_filled = X.fillna(0)

        if imputer is not None:
            X_for_model = imputer.transform(X_filled)
        else:
            X_for_model = X_filled

        pred, score = _predict_class_probability(model, X_for_model)
        is_correct = pred == 1

        if score is None:
            score = 0.85 if is_correct else 0.35

        return {
            "is_correct": bool(is_correct),
            "score": float(round(score, 4)),
            "error_type": None if is_correct else "ml_lunge_wrong_depth",
            "feedback": (
                "ML: lunge засчитан."
                if is_correct
                else "ML: lunge қате. Мүмкін қозғалыс тереңдігі немесе дене позициясы дұрыс емес."
            ),
            "label_source": "ml_rf_lunge",
        }

    except Exception as error:
        print(
            "LUNGE_ML_FALLBACK | "
            f"error_type={type(error).__name__} | error={error} | "
            f"model_path={MODEL_PATH} | features_path={FEATURES_PATH} | "
            f"received_keys_sample={sorted(list(features_json.keys()))[:40]}"
        )
        traceback.print_exc()

        fallback = _rule_fallback(features_json, "backend_lunge_rule_fallback")
        fallback["feedback"] = f"{fallback['feedback']} ML fallback себебі: {error}"
        return fallback