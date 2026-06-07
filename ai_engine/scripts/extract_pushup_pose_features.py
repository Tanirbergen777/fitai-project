from pathlib import Path
import math
from typing import Optional, Dict, Any, List

import cv2
import pandas as pd

try:
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    from mediapipe import Image, ImageFormat
except ImportError as exc:
    raise SystemExit(
        "MediaPipe Tasks API импортталмады. Орында:\n"
        "  pip install --upgrade mediapipe opencv-python pandas scikit-learn joblib\n"
    ) from exc


ROOT = Path("ai_engine/datasets/pushup_raw")
OUT_PATH = Path("ai_engine/datasets/pushup_pose_frame_dataset.csv")
POSE_MODEL_PATH = Path("frontend/public/models/pose_landmarker_lite.task")

VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

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


def infer_label(path: Path) -> int:
    parent = path.parent.name.lower()

    if "correct" in parent:
        return 1

    if "wrong" in parent or "incorrect" in parent:
        return 0

    raise ValueError(f"Cannot infer label from folder name: {path}")


def collect_videos() -> List[Path]:
    return sorted([p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXTS])


def create_pose_landmarker():
    if not POSE_MODEL_PATH.exists():
        raise SystemExit(
            f"Pose model not found: {POSE_MODEL_PATH}\n"
            "Тексер: frontend/public/models/pose_landmarker_lite.task бар ма?\n"
            "Егер басқа жерде болса, script ішіндегі POSE_MODEL_PATH жолын өзгерт."
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


def main():
    if not ROOT.exists():
        raise SystemExit(f"Dataset folder not found: {ROOT}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    videos = collect_videos()
    if not videos:
        raise SystemExit(f"No videos found in {ROOT}")

    rows = []
    failed_videos = []
    frame_step = 2

    # MediaPipe VIDEO mode timestamp must be monotonically increasing for the
    # whole PoseLandmarker instance. Сондықтан timestamp әр видеоға reset болмайды.
    global_timestamp_ms = 0

    with create_pose_landmarker() as landmarker:
        for video_idx, video_path in enumerate(videos, start=1):
            label = infer_label(video_path)
            cap = cv2.VideoCapture(str(video_path))

            if not cap.isOpened():
                failed_videos.append(str(video_path))
                print(f"[WARN] Cannot open: {video_path}")
                continue

            fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            detected = 0
            frame_index = 0

            while True:
                ok, frame = cap.read()
                if not ok:
                    break

                if frame_index % frame_step != 0:
                    frame_index += 1
                    continue

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = Image(image_format=ImageFormat.SRGB, data=rgb)

                # +1 міндетті: timestamp бірдей болып қалмауы керек.
                global_timestamp_ms += max(1, int((1000 / fps) * frame_step)) if fps > 0 else 40
                result = landmarker.detect_for_video(mp_image, global_timestamp_ms)

                landmarks = result.pose_landmarks[0] if result.pose_landmarks else None

                if landmarks:
                    features = build_features(landmarks)
                    row = {
                        "video_path": str(video_path),
                        "video_name": video_path.name,
                        "video_folder": video_path.parent.name,
                        "video_index": video_idx,
                        "frame_index": frame_index,
                        "timestamp_sec": round(frame_index / fps, 4) if fps > 0 else None,
                        "global_timestamp_ms": global_timestamp_ms,
                        "fps": fps,
                        "frame_count": frame_count,
                        "exercise_mode": "pushup",
                        "is_correct": label,
                    }
                    row.update(features)
                    rows.append(row)
                    detected += 1

                frame_index += 1

            cap.release()
            print(
                f"[{video_idx:03d}/{len(videos)}] {video_path.parent.name}/{video_path.name} "
                f"label={label} detected_frames={detected}"
            )

    df = pd.DataFrame(rows)
    df.to_csv(OUT_PATH, index=False, encoding="utf-8")

    print("\n" + "=" * 72)
    print("DONE")
    print("=" * 72)
    print(f"Videos found: {len(videos)}")
    print(f"Rows saved: {len(df)}")
    print(f"Output: {OUT_PATH.resolve()}")

    if len(df):
        print("\nClass distribution by frames:")
        print(df["is_correct"].value_counts().sort_index().to_string())

        print("\nClass distribution by videos:")
        print(df.groupby(["video_folder", "is_correct"])["video_name"].nunique().to_string())

    if failed_videos:
        print("\nFailed videos:")
        for p in failed_videos[:20]:
            print(" ", p)


if __name__ == "__main__":
    main()
