from pathlib import Path
import argparse
import math
from typing import Optional, Dict, Any, List

import cv2
import joblib
import pandas as pd

try:
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    from mediapipe import Image, ImageFormat
except ImportError as exc:
    raise SystemExit(
        "MediaPipe Tasks API импортталмады. Орында:\n"
        "  pip install mediapipe opencv-python pandas scikit-learn joblib\n"
    ) from exc


MODEL_PATH = Path("ai_engine/models_bin/pushup_pose_rf.pkl")
POSE_MODEL_PATH = Path("frontend/public/models/pose_landmarker_lite.task")
DEFAULT_DATASET_ROOT = Path("ai_engine/datasets/pushup_raw")

VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

# MediaPipe landmark indexes
L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28


def safe_point(landmarks, idx: int) -> Optional[Dict[str, float]]:
    if landmarks is None or idx >= len(landmarks):
        return None
    p = landmarks[idx]
    return {
        "x": float(p.x),
        "y": float(p.y),
        "z": float(p.z),
        "visibility": float(getattr(p, "visibility", 1.0)),
    }


def distance(a, b) -> Optional[float]:
    if not a or not b:
        return None
    return math.sqrt((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2)


def angle(a, b, c) -> Optional[float]:
    if not a or not b or not c:
        return None

    ab = (a["x"] - b["x"], a["y"] - b["y"])
    cb = (c["x"] - b["x"], c["y"] - b["y"])

    dot = ab[0] * cb[0] + ab[1] * cb[1]
    mag_ab = math.sqrt(ab[0] ** 2 + ab[1] ** 2)
    mag_cb = math.sqrt(cb[0] ** 2 + cb[1] ** 2)

    if mag_ab == 0 or mag_cb == 0:
        return None

    cos_value = max(-1.0, min(1.0, dot / (mag_ab * mag_cb)))
    return round(math.degrees(math.acos(cos_value)), 3)


def avg_y(*points) -> Optional[float]:
    pts = [p for p in points if p]
    if not pts:
        return None
    return sum(p["y"] for p in pts) / len(pts)


def visibility_avg(points: List[Optional[Dict[str, float]]]) -> Optional[float]:
    pts = [p for p in points if p]
    if not pts:
        return None
    return round(sum(p["visibility"] for p in pts) / len(pts), 4)


def build_features(landmarks) -> Dict[str, Any]:
    l_sh = safe_point(landmarks, L_SHOULDER)
    r_sh = safe_point(landmarks, R_SHOULDER)
    l_el = safe_point(landmarks, L_ELBOW)
    r_el = safe_point(landmarks, R_ELBOW)
    l_wr = safe_point(landmarks, L_WRIST)
    r_wr = safe_point(landmarks, R_WRIST)
    l_hip = safe_point(landmarks, L_HIP)
    r_hip = safe_point(landmarks, R_HIP)
    l_knee = safe_point(landmarks, L_KNEE)
    r_knee = safe_point(landmarks, R_KNEE)
    l_ank = safe_point(landmarks, L_ANKLE)
    r_ank = safe_point(landmarks, R_ANKLE)

    shoulder_y = avg_y(l_sh, r_sh)
    hip_y = avg_y(l_hip, r_hip)
    ankle_y = avg_y(l_ank, r_ank)

    hip_offset = None
    if shoulder_y is not None and hip_y is not None and ankle_y is not None:
        hip_offset = abs(hip_y - ((shoulder_y + ankle_y) / 2))

    row = {
        "feature_left_elbow_angle": angle(l_sh, l_el, l_wr),
        "feature_right_elbow_angle": angle(r_sh, r_el, r_wr),
        "feature_left_shoulder_angle": angle(l_el, l_sh, l_hip),
        "feature_right_shoulder_angle": angle(r_el, r_sh, r_hip),
        "feature_left_hip_angle": angle(l_sh, l_hip, l_knee),
        "feature_right_hip_angle": angle(r_sh, r_hip, r_knee),
        "feature_left_knee_angle": angle(l_hip, l_knee, l_ank),
        "feature_right_knee_angle": angle(r_hip, r_knee, r_ank),
        "feature_body_line_left": angle(l_sh, l_hip, l_ank),
        "feature_body_line_right": angle(r_sh, r_hip, r_ank),
        "feature_shoulder_width": distance(l_sh, r_sh),
        "feature_hip_width": distance(l_hip, r_hip),
        "feature_wrist_width": distance(l_wr, r_wr),
        "feature_ankle_width": distance(l_ank, r_ank),
        "feature_shoulder_y": shoulder_y,
        "feature_hip_y": hip_y,
        "feature_ankle_y": ankle_y,
        "feature_hip_offset": hip_offset,
        "feature_visibility_score": visibility_avg(
            [l_sh, r_sh, l_el, r_el, l_wr, r_wr, l_hip, r_hip, l_knee, r_knee, l_ank, r_ank]
        ),
    }

    for i, p in enumerate(landmarks):
        row[f"lm_{i}_x"] = float(p.x)
        row[f"lm_{i}_y"] = float(p.y)
        row[f"lm_{i}_z"] = float(p.z)
        row[f"lm_{i}_visibility"] = float(getattr(p, "visibility", 1.0))

    return row


def load_model_bundle():
    if not MODEL_PATH.exists():
        raise SystemExit(f"Model not found: {MODEL_PATH}")

    bundle = joblib.load(MODEL_PATH)

    if isinstance(bundle, dict):
        model = bundle.get("model")
        feature_columns = bundle.get("feature_columns")
    else:
        model = bundle
        feature_columns = None

    if model is None:
        raise SystemExit("Model bundle ішінде 'model' табылмады.")

    if not feature_columns:
        raise SystemExit("Model bundle ішінде 'feature_columns' табылмады.")

    return model, [str(col) for col in feature_columns]


def create_pose_landmarker():
    if not POSE_MODEL_PATH.exists():
        raise SystemExit(
            f"Pose model not found: {POSE_MODEL_PATH}\n"
            "Тексер: frontend/public/models/pose_landmarker_lite.task бар ма?"
        )

    base_options = python.BaseOptions(model_asset_path=str(POSE_MODEL_PATH))
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.45,
        min_pose_presence_confidence=0.45,
        min_tracking_confidence=0.45,
    )
    return vision.PoseLandmarker.create_from_options(options)


def infer_true_label(path: Path) -> Optional[int]:
    parent = path.parent.name.lower()
    if "correct" in parent:
        return 1
    if "wrong" in parent or "incorrect" in parent:
        return 0
    return None


def predict_video(video_path: Path, landmarker, model, feature_columns, frame_step=2, start_ts=0):
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        return {
            "video_path": str(video_path),
            "error": "cannot_open_video",
            "detected_frames": 0,
            "prediction": None,
            "correct_probability": None,
            "timestamp_ms": start_ts,
        }

    fps = float(cap.get(cv2.CAP_PROP_FPS) or 25)
    frame_index = 0
    detected_rows = []
    timestamp_ms = start_ts

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        if frame_index % frame_step != 0:
            frame_index += 1
            continue

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = Image(image_format=ImageFormat.SRGB, data=rgb)

        timestamp_ms += max(1, int((1000 / fps) * frame_step)) if fps > 0 else 40
        result = landmarker.detect_for_video(mp_image, timestamp_ms)

        landmarks = result.pose_landmarks[0] if result.pose_landmarks else None

        if landmarks:
            features = build_features(landmarks)
            detected_rows.append(features)

        frame_index += 1

    cap.release()

    if not detected_rows:
        return {
            "video_path": str(video_path),
            "detected_frames": 0,
            "prediction": None,
            "correct_probability": None,
            "timestamp_ms": timestamp_ms,
        }

    X = pd.DataFrame(detected_rows)

    for col in feature_columns:
        if col not in X.columns:
            X[col] = None

    X = X[feature_columns].apply(pd.to_numeric, errors="coerce")

    frame_preds = model.predict(X)

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)
        classes = list(getattr(model, "classes_", []))

        if 1 in classes:
            correct_probs = proba[:, classes.index(1)]
        elif "1" in classes:
            correct_probs = proba[:, classes.index("1")]
        elif proba.shape[1] > 1:
            correct_probs = proba[:, 1]
        else:
            correct_probs = proba[:, 0]
    else:
        correct_probs = frame_preds

    correct_probability = float(pd.Series(correct_probs).mean())
    prediction = 1 if correct_probability >= 0.5 else 0

    return {
        "video_path": str(video_path),
        "video_name": video_path.name,
        "folder": video_path.parent.name,
        "detected_frames": len(detected_rows),
        "frame_correct_count": int((frame_preds == 1).sum()),
        "frame_wrong_count": int((frame_preds == 0).sum()),
        "correct_probability": round(correct_probability, 4),
        "prediction": prediction,
        "prediction_label": "correct" if prediction == 1 else "wrong",
        "true_label": infer_true_label(video_path),
        "timestamp_ms": timestamp_ms,
    }


def collect_dataset_videos(root: Path):
    return sorted([p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXTS])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", type=str, default="", help="Single video path to test")
    parser.add_argument("--dataset", type=str, default="", help="Dataset folder to test all videos")
    parser.add_argument("--limit", type=int, default=0, help="Limit videos for dataset mode")
    parser.add_argument("--frame-step", type=int, default=2)
    args = parser.parse_args()

    model, feature_columns = load_model_bundle()

    videos = []

    if args.video:
        videos = [Path(args.video)]
    else:
        root = Path(args.dataset) if args.dataset else DEFAULT_DATASET_ROOT
        videos = collect_dataset_videos(root)

    if args.limit and args.limit > 0:
        videos = videos[:args.limit]

    if not videos:
        raise SystemExit("No videos found.")

    results = []
    timestamp_ms = 0

    with create_pose_landmarker() as landmarker:
        for idx, video_path in enumerate(videos, start=1):
            result = predict_video(
                video_path=video_path,
                landmarker=landmarker,
                model=model,
                feature_columns=feature_columns,
                frame_step=args.frame_step,
                start_ts=timestamp_ms,
            )

            timestamp_ms = result.get("timestamp_ms", timestamp_ms) + 1000
            results.append(result)

            true_label = result.get("true_label")
            true_text = "?" if true_label is None else ("correct" if true_label == 1 else "wrong")

            print(
                f"[{idx:03d}/{len(videos)}] {video_path.parent.name}/{video_path.name} "
                f"true={true_text} pred={result.get('prediction_label')} "
                f"p_correct={result.get('correct_probability')} "
                f"frames={result.get('detected_frames')}"
            )

    df = pd.DataFrame(results)

    if len(df) == 1:
        print("\nRESULT:")
        print(df.drop(columns=["timestamp_ms"], errors="ignore").to_string(index=False))
        return

    usable = df.dropna(subset=["true_label", "prediction"])

    print("\n" + "=" * 72)
    print("VIDEO-LEVEL SUMMARY")
    print("=" * 72)
    print(f"Videos tested: {len(df)}")
    print(f"Usable with labels: {len(usable)}")

    if len(usable):
        acc = (usable["true_label"].astype(int) == usable["prediction"].astype(int)).mean()
        print(f"Video-level accuracy: {acc:.4f}")

        print("\nConfusion matrix style counts:")
        print(pd.crosstab(
            usable["true_label"].map({0: "true_wrong", 1: "true_correct"}),
            usable["prediction"].map({0: "pred_wrong", 1: "pred_correct"}),
            dropna=False,
        ).to_string())

    out_path = Path("ai_engine/inference_outputs/pushup_video_test_results.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.drop(columns=["timestamp_ms"], errors="ignore").to_csv(out_path, index=False, encoding="utf-8")
    print(f"\nSaved: {out_path.resolve()}")


if __name__ == "__main__":
    main()
