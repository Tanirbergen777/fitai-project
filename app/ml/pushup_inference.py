from __future__ import annotations

import json
import traceback
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "pushup_pose_rf.pkl"
FEATURES_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "pushup_pose_feature_columns.json"

_MODEL_BUNDLE: Optional[Any] = None
_FEATURE_COLUMNS: Optional[list[str]] = None


def _to_number(value: Any) -> float | None:
    if value is None:
        return None

    if isinstance(value, bool):
        return float(int(value))

    if isinstance(value, (int, float)):
        return float(value)

    try:
        text = str(value).replace(",", ".").strip()
        if text == "":
            return None
        return float(text)
    except Exception:
        return None


def _load_feature_columns_from_bundle(bundle: Any) -> list[str] | None:
    if isinstance(bundle, dict):
        for key in ["feature_columns", "features", "columns", "feature_names"]:
            columns = bundle.get(key)
            if isinstance(columns, list) and columns:
                return [str(col) for col in columns]
    return None


def _ensure_loaded() -> Tuple[Any, list[str]]:
    global _MODEL_BUNDLE, _FEATURE_COLUMNS

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Не найдена push-up модель: {MODEL_PATH}")
        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    if _FEATURE_COLUMNS is None:
        bundle_columns = _load_feature_columns_from_bundle(_MODEL_BUNDLE)

        if bundle_columns:
            _FEATURE_COLUMNS = bundle_columns
        else:
            if not FEATURES_PATH.exists():
                raise FileNotFoundError(f"Не найден файл признаков push-up: {FEATURES_PATH}")

            with open(FEATURES_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)

            if isinstance(loaded, dict):
                loaded = (
                    loaded.get("feature_columns")
                    or loaded.get("columns")
                    or loaded.get("features")
                )

            if not isinstance(loaded, list) or not loaded:
                raise ValueError("pushup_pose_feature_columns.json должен содержать список признаков")

            _FEATURE_COLUMNS = [str(col) for col in loaded]

    if isinstance(_MODEL_BUNDLE, dict):
        model = (
            _MODEL_BUNDLE.get("model")
            or _MODEL_BUNDLE.get("classifier")
            or _MODEL_BUNDLE.get("pipeline")
        )
    else:
        model = _MODEL_BUNDLE

    if model is None:
        raise ValueError("В pushup_pose_rf.pkl не найден ключ model/classifier/pipeline")

    return model, _FEATURE_COLUMNS


def _candidate_feature_keys(column: str) -> list[str]:
    col = str(column)
    keys = [col]

    if col.startswith("feature_"):
        keys.append(col.replace("feature_", "", 1))
    else:
        keys.append(f"feature_{col}")

    alias_map = {
        "left_elbow_angle": ["feature_left_elbow_angle", "elbow_angle"],
        "right_elbow_angle": ["feature_right_elbow_angle", "elbow_angle"],
        "elbow_angle": [
            "feature_left_elbow_angle",
            "feature_right_elbow_angle",
            "left_elbow_angle",
            "right_elbow_angle",
        ],
        "left_shoulder_angle": ["feature_left_shoulder_angle", "shoulder_angle"],
        "right_shoulder_angle": ["feature_right_shoulder_angle", "shoulder_angle"],
        "left_hip_angle": ["feature_left_hip_angle", "hip_angle"],
        "right_hip_angle": ["feature_right_hip_angle", "hip_angle"],
        "body_line_left": ["feature_body_line_left", "body_line_angle"],
        "body_line_right": ["feature_body_line_right", "body_line_angle"],
        "shoulder_width": ["feature_shoulder_width"],
        "hip_width": ["feature_hip_width"],
        "wrist_width": ["feature_wrist_width"],
        "ankle_width": ["feature_ankle_width"],
        "hip_offset": ["feature_hip_offset"],
        "visibility_score": ["feature_visibility_score"],
    }

    normalized = col.replace("feature_", "", 1)
    keys.extend(alias_map.get(normalized, []))

    unique_keys: list[str] = []
    for key in keys:
        if key not in unique_keys:
            unique_keys.append(key)

    return unique_keys


def _get_feature_value(features_json: Dict[str, Any], column: str) -> float | None:
    for key in _candidate_feature_keys(column):
        value = _to_number(features_json.get(key))
        if value is not None:
            return value
    return None


def _build_feature_row(features_json: Dict[str, Any]) -> pd.DataFrame:
    _, feature_columns = _ensure_loaded()

    row = {}
    for col in feature_columns:
        row[col] = _get_feature_value(features_json, col)

    return pd.DataFrame([row], columns=feature_columns)


def _predict_class_probability(model: Any, X) -> tuple[int, float | None]:
    try:
        pred_raw = model.predict(X)[0]
        input_used = X
    except Exception:
        input_used = X.to_numpy() if hasattr(X, "to_numpy") else X
        pred_raw = model.predict(input_used)[0]

    pred = int(pred_raw)

    score = None
    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(input_used)[0]
        except Exception:
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


def _extract_elbow_angle(features_json: Dict[str, Any]) -> float | None:
    candidates = [
        "elbow_angle",
        "left_elbow_angle",
        "right_elbow_angle",
        "feature_left_elbow_angle",
        "feature_right_elbow_angle",
    ]

    values = [_to_number(features_json.get(key)) for key in candidates]
    values = [value for value in values if value is not None]

    if not values:
        return None

    # Push-up төменгі фазасында elbow angle кішірек болады.
    return min(values)


def _rule_fallback(features_json: Dict[str, Any], reason: str = "pushup_rule_fallback") -> Dict[str, Any]:
    elbow_angle = _extract_elbow_angle(features_json)
    hip_offset = _to_number(features_json.get("feature_hip_offset") or features_json.get("hip_offset"))

    if elbow_angle is None:
        is_correct = False
        score = 0.35
        error_type = "missing_elbow_angle"
        feedback = "Fallback: push-up бағалау үшін elbow angle табылмады."
    else:
        # Қарапайым fallback:
        # elbow жеткілікті бүгілсе және дене сызығы қатты бұзылмаса, correct.
        elbow_ok = elbow_angle <= 105
        body_ok = hip_offset is None or hip_offset <= 0.12

        is_correct = bool(elbow_ok and body_ok)

        if not elbow_ok:
            error_type = "elbow_not_bent"
            feedback = f"Fallback: шынтақты көбірек бүк. Elbow angle: {round(elbow_angle, 1)}°"
        elif not body_ok:
            error_type = "body_not_straight"
            feedback = f"Fallback: денені түзу ұста. Hip offset: {round(hip_offset, 3)}"
        else:
            error_type = None
            feedback = f"Fallback: push-up засчитан. Elbow angle: {round(elbow_angle, 1)}°"

        if elbow_ok:
            score = 0.75 if body_ok else 0.55
        else:
            score = max(0.05, min(0.65, (130 - elbow_angle) / 70))

    return {
        "is_correct": bool(is_correct),
        "score": float(round(score, 4)),
        "error_type": error_type,
        "feedback": feedback,
        "label_source": reason,
    }


def evaluate_pushup_features(features_json: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(features_json, dict) or not features_json:
        return _rule_fallback({}, "empty_features_fallback_pushup")

    try:
        model, _ = _ensure_loaded()
        X = _build_feature_row(features_json)
        X_filled = X.fillna(0)

        pred, score = _predict_class_probability(model, X_filled)
        is_correct = pred == 1

        if score is None:
            score = 0.9 if is_correct else 0.4

        return {
            "is_correct": bool(is_correct),
            "score": float(round(score, 4)),
            "error_type": None if is_correct else "ml_pushup_wrong_form",
            "feedback": (
                "ML: push-up дұрыс орындалды."
                if is_correct
                else "ML: push-up қате орындалды. Шынтақ, корпус сызығы немесе амплитуданы тексер."
            ),
            "label_source": "ml_rf_pushup",
        }

    except Exception as error:
        print(
            "PUSHUP_ML_FALLBACK | "
            f"error_type={type(error).__name__} | "
            f"error={error} | "
            f"model_path={MODEL_PATH} | "
            f"features_path={FEATURES_PATH} | "
            f"received_keys_sample={sorted(list(features_json.keys()))[:40]}",
            flush=True,
        )
        traceback.print_exc()

        fallback = _rule_fallback(features_json, "backend_rule_fallback_pushup")
        fallback["feedback"] = f"{fallback['feedback']} ML уақытша fallback режимінде: {error}"
        return fallback