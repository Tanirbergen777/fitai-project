from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent

MODEL_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_rf.pkl"
FEATURES_PATH = PROJECT_ROOT / "ai_engine" / "models_bin" / "squat_pose_feature_columns.json"

_MODEL_BUNDLE: Optional[Any] = None
_FEATURE_COLUMNS: Optional[list[str]] = None

logger = logging.getLogger(__name__)


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


def _ensure_loaded() -> Tuple[Any, Any, list[str]]:
    global _MODEL_BUNDLE, _FEATURE_COLUMNS

    if _MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Не найдена модель squat: {MODEL_PATH}")
        _MODEL_BUNDLE = joblib.load(MODEL_PATH)

    if _FEATURE_COLUMNS is None:
        bundle_columns = _load_feature_columns_from_bundle(_MODEL_BUNDLE)

        if bundle_columns:
            _FEATURE_COLUMNS = bundle_columns
        else:
            if not FEATURES_PATH.exists():
                raise FileNotFoundError(f"Не найден файл признаков squat: {FEATURES_PATH}")
            with open(FEATURES_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)

            if isinstance(loaded, dict):
                loaded = (
                    loaded.get("feature_columns")
                    or loaded.get("columns")
                    or loaded.get("features")
                )

            if not isinstance(loaded, list) or not loaded:
                raise ValueError("squat_pose_feature_columns.json должен содержать список признаков")

            _FEATURE_COLUMNS = [str(col) for col in loaded]

    if isinstance(_MODEL_BUNDLE, dict):
        model = (
            _MODEL_BUNDLE.get("model")
            or _MODEL_BUNDLE.get("classifier")
            or _MODEL_BUNDLE.get("pipeline")
        )
        imputer = _MODEL_BUNDLE.get("imputer")
    else:
        model = _MODEL_BUNDLE
        imputer = None

    if model is None:
        raise ValueError("В squat_pose_rf.pkl не найден ключ model/classifier/pipeline")

    return model, imputer, _FEATURE_COLUMNS


def _candidate_feature_keys(column: str) -> list[str]:
    """
    Frontend пен training dataset атаулары кейде әртүрлі болады:
    - left_knee_angle
    - feature_left_knee_angle
    - knee_angle
    Осы функция бір колонкаға мүмкін болатын alias-тарды қайтарады.
    """
    col = str(column)
    keys = [col]

    if col.startswith("feature_"):
        keys.append(col.replace("feature_", "", 1))
    else:
        keys.append(f"feature_{col}")

    alias_map = {
        "left_knee_angle": ["feature_left_knee_angle", "knee_angle"],
        "right_knee_angle": ["feature_right_knee_angle", "knee_angle"],
        "knee_angle": ["feature_left_knee_angle", "feature_right_knee_angle", "left_knee_angle", "right_knee_angle"],
        "left_hip_angle": ["feature_left_hip_angle", "hip_angle"],
        "right_hip_angle": ["feature_right_hip_angle", "hip_angle"],
        "hip_angle": ["feature_left_hip_angle", "feature_right_hip_angle", "left_hip_angle", "right_hip_angle"],
        "left_elbow_angle": ["feature_left_elbow_angle", "elbow_angle"],
        "right_elbow_angle": ["feature_right_elbow_angle", "elbow_angle"],
        "shoulder_width": ["feature_shoulder_width"],
        "ankle_width": ["feature_ankle_width"],
        "wrist_width": ["feature_wrist_width"],
        "left_knee_lift": ["feature_left_knee_lift"],
        "right_knee_lift": ["feature_right_knee_lift"],
        "hip_offset": ["feature_hip_offset"],
    }

    normalized = col.replace("feature_", "", 1)
    keys.extend(alias_map.get(normalized, []))

    # lm/wlm names are normally identical, but keep list unique and ordered.
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
    _, _, feature_columns = _ensure_loaded()

    row = {}
    for col in feature_columns:
        row[col] = _get_feature_value(features_json, col)

    return pd.DataFrame([row], columns=feature_columns)


def _predict_class_probability(model: Any, X) -> tuple[int, float | None]:
    """
    Кейбір sklearn модельдері DataFrame feature names-пен қатаң тексереді,
    ал кейбірі numpy array күтеді. Сондықтан алдымен X-пен, қате болса numpy-мен сынаймыз.
    """
    try:
        pred_raw = model.predict(X)[0]
        input_used = X
    except Exception:
        if hasattr(X, "to_numpy"):
            input_used = X.to_numpy()
        else:
            input_used = X
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


def _extract_knee_angle(features_json: Dict[str, Any]) -> float | None:
    candidates = [
        "knee_angle",
        "left_knee_angle",
        "right_knee_angle",
        "feature_left_knee_angle",
        "feature_right_knee_angle",
    ]

    values = [_to_number(features_json.get(key)) for key in candidates]
    values = [value for value in values if value is not None]

    if not values:
        return None

    return min(values)


def _rule_fallback(features_json: Dict[str, Any], reason: str = "ml_runtime_fallback") -> Dict[str, Any]:
    knee_angle = _extract_knee_angle(features_json)

    if knee_angle is not None:
        # squat bottom бұрышы төмен болса, присед тереңірек болды деген сөз.
        is_correct = knee_angle <= 115
        score = max(0.05, min(0.95, (130 - knee_angle) / 55))
        error_type = None if is_correct else "rule_not_deep_enough"
    else:
        is_correct = False
        score = 0.35
        error_type = "missing_knee_angle"

    return {
        "is_correct": bool(is_correct),
        "score": float(round(score, 4)),
        "error_type": error_type,
        "feedback": (
            f"Fallback: присед засчитан. Knee angle: {round(knee_angle, 1)}°"
            if is_correct and knee_angle is not None
            else (
                f"Fallback: присед не засчитан. Нужно опуститься чуть ниже. Knee angle: {round(knee_angle, 1)}°"
                if knee_angle is not None
                else "Fallback: присед не засчитан. Knee angle табылмады."
            )
        ),
        "label_source": reason,
    }


def evaluate_squat_features(features_json: Dict[str, Any]) -> Dict[str, Any]:
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
            score = 0.9 if is_correct else 0.4

        return {
            "is_correct": bool(is_correct),
            "score": float(round(score, 4)),
            "error_type": None if is_correct else "ml_wrong_depth",
            "feedback": (
                "ML: присед засчитан."
                if is_correct
                else "ML: присед не засчитан. Похоже, глубина была недостаточной."
            ),
            "label_source": "ml_rf_squat",
        }

    except Exception as error:
        try:
            _, _, feature_columns = _ensure_loaded()
        except Exception:
            feature_columns = []

        feature_keys = sorted(list(features_json.keys()))
        missing_features = [
            col for col in feature_columns
            if _get_feature_value(features_json, col) is None
        ] if feature_columns else []

        logger.exception(
            "SQUAT_ML_FALLBACK | error_type=%s | error=%s | model_path=%s | features_path=%s | feature_columns=%s | received_keys_sample=%s | missing_features_count=%s | missing_features_sample=%s",
            type(error).__name__,
            str(error),
            MODEL_PATH,
            FEATURES_PATH,
            len(feature_columns),
            feature_keys[:40],
            len(missing_features),
            missing_features[:30],
        )

        fallback = _rule_fallback(features_json, "backend_rule_fallback")
        fallback["feedback"] = (
            f"{fallback['feedback']} "
            f"ML fallback: {type(error).__name__}: {error}"
        )
        return fallback
