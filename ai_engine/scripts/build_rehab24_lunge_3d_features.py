from pathlib import Path
import math
from typing import Dict, Any, Optional, List

import numpy as np
import pandas as pd


ROOT = Path("ai_engine/datasets/rehab24_raw")
SEG_PATH = ROOT / "lunge_segmentation_ex5.csv"
JOINTS_DIR = ROOT / "3d_joints" / "Ex5"
OUT_PATH = Path("ai_engine/datasets/rehab24_lunge_3d_features.csv")

# REHAB24-6 joints_names.txt mapping:
# 00 Hips, 01 Spine, 02 Spine1, 03 Neck
# 06 LeftShoulder, 11 RightShoulder
# 16 LeftUpLeg, 17 LeftLeg, 18 LeftFoot, 19 LeftToeBase
# 21 RightUpLeg, 22 RightLeg, 23 RightFoot, 24 RightToeBase
J = {
    "hips_center": 0,
    "spine": 1,
    "spine1": 2,
    "neck": 3,
    "left_shoulder": 6,
    "right_shoulder": 11,
    "left_hip": 16,
    "left_knee": 17,
    "left_ankle": 18,
    "left_toe": 19,
    "right_hip": 21,
    "right_knee": 22,
    "right_ankle": 23,
    "right_toe": 24,
}


def first_available(*points: Optional[np.ndarray]) -> Optional[np.ndarray]:
    for p in points:
        if p is not None:
            return p
    return None


def point(frame: np.ndarray, idx: int) -> Optional[np.ndarray]:
    if frame is None or idx >= frame.shape[0]:
        return None

    p = frame[idx, :3].astype(float)

    if np.isnan(p).any():
        return None

    return p


def visibility(frame: np.ndarray, idx: int) -> float:
    if frame is None or idx >= frame.shape[0] or frame.shape[1] < 4:
        return 0.0

    value = frame[idx, 3]
    if np.isnan(value):
        return 0.0

    return float(value)


def dist(a: Optional[np.ndarray], b: Optional[np.ndarray]) -> float:
    if a is None or b is None:
        return np.nan
    return float(np.linalg.norm(a - b))


def angle_3d(a: Optional[np.ndarray], b: Optional[np.ndarray], c: Optional[np.ndarray]) -> float:
    """Angle ABC in degrees."""
    if a is None or b is None or c is None:
        return np.nan

    ba = a - b
    bc = c - b

    ba_norm = np.linalg.norm(ba)
    bc_norm = np.linalg.norm(bc)

    if ba_norm == 0 or bc_norm == 0:
        return np.nan

    cos_value = float(np.dot(ba, bc) / (ba_norm * bc_norm))
    cos_value = max(-1.0, min(1.0, cos_value))

    return float(math.degrees(math.acos(cos_value)))


def angle_to_vertical(a: Optional[np.ndarray], b: Optional[np.ndarray]) -> float:
    """Angle between vector a->b and vertical Y axis."""
    if a is None or b is None:
        return np.nan

    v = b - a
    norm = np.linalg.norm(v)

    if norm == 0:
        return np.nan

    vertical = np.array([0.0, 1.0, 0.0])
    cos_value = float(np.dot(v, vertical) / norm)
    cos_value = max(-1.0, min(1.0, cos_value))

    # 0 means close to vertical; 90 means very horizontal.
    return float(math.degrees(math.acos(abs(cos_value))))


def safe_stats(values: List[float], prefix: str) -> Dict[str, float]:
    arr = np.array(values, dtype=float)
    arr = arr[~np.isnan(arr)]

    if arr.size == 0:
        return {
            f"{prefix}_mean": np.nan,
            f"{prefix}_std": np.nan,
            f"{prefix}_min": np.nan,
            f"{prefix}_max": np.nan,
            f"{prefix}_range": np.nan,
        }

    return {
        f"{prefix}_mean": float(np.mean(arr)),
        f"{prefix}_std": float(np.std(arr)),
        f"{prefix}_min": float(np.min(arr)),
        f"{prefix}_max": float(np.max(arr)),
        f"{prefix}_range": float(np.max(arr) - np.min(arr)),
    }


def safe_min(values: List[float]) -> float:
    arr = np.array(values, dtype=float)
    arr = arr[~np.isnan(arr)]
    return float(np.min(arr)) if arr.size else np.nan


def safe_range(values: List[float]) -> float:
    arr = np.array(values, dtype=float)
    arr = arr[~np.isnan(arr)]
    return float(np.max(arr) - np.min(arr)) if arr.size else np.nan


def frame_features(frame: np.ndarray, front_leg: str) -> Dict[str, float]:
    hips_center = point(frame, J["hips_center"])
    spine1 = point(frame, J["spine1"])
    neck = point(frame, J["neck"])

    l_shoulder = point(frame, J["left_shoulder"])
    r_shoulder = point(frame, J["right_shoulder"])

    l_hip = point(frame, J["left_hip"])
    l_knee = point(frame, J["left_knee"])
    l_ankle = point(frame, J["left_ankle"])
    l_toe = point(frame, J["left_toe"])

    r_hip = point(frame, J["right_hip"])
    r_knee = point(frame, J["right_knee"])
    r_ankle = point(frame, J["right_ankle"])
    r_toe = point(frame, J["right_toe"])

    shoulder_center = None
    if l_shoulder is not None and r_shoulder is not None:
        shoulder_center = (l_shoulder + r_shoulder) / 2
    else:
        shoulder_center = first_available(neck, spine1)

    if front_leg == "left":
        f_hip, f_knee, f_ankle, f_toe = l_hip, l_knee, l_ankle, l_toe
        b_hip, b_knee, b_ankle, b_toe = r_hip, r_knee, r_ankle, r_toe
    else:
        f_hip, f_knee, f_ankle, f_toe = r_hip, r_knee, r_ankle, r_toe
        b_hip, b_knee, b_ankle, b_toe = l_hip, l_knee, l_ankle, l_toe

    knee_to_toe_xz = np.nan
    if f_knee is not None and f_toe is not None:
        knee_to_toe_xz = float(np.linalg.norm((f_knee - f_toe)[[0, 2]]))

    return {
        "left_knee_angle": angle_3d(l_hip, l_knee, l_ankle),
        "right_knee_angle": angle_3d(r_hip, r_knee, r_ankle),
        "left_hip_angle": angle_3d(shoulder_center, l_hip, l_knee),
        "right_hip_angle": angle_3d(shoulder_center, r_hip, r_knee),
        "front_knee_angle": angle_3d(f_hip, f_knee, f_ankle),
        "back_knee_angle": angle_3d(b_hip, b_knee, b_ankle),
        "front_hip_angle": angle_3d(shoulder_center, f_hip, f_knee),
        "back_hip_angle": angle_3d(shoulder_center, b_hip, b_knee),
        "torso_lean_angle": angle_to_vertical(hips_center, first_available(neck, spine1)),
        "ankle_distance": dist(l_ankle, r_ankle),
        "knee_distance": dist(l_knee, r_knee),
        "hip_distance": dist(l_hip, r_hip),
        "shoulder_distance": dist(l_shoulder, r_shoulder),
        "front_knee_to_toe_xz": knee_to_toe_xz,
        "front_knee_y": float(f_knee[1]) if f_knee is not None else np.nan,
        "back_knee_y": float(b_knee[1]) if b_knee is not None else np.nan,
        "hips_y": float(hips_center[1]) if hips_center is not None else np.nan,
        "neck_y": float(neck[1]) if neck is not None else np.nan,
        "visibility_mean": float(np.mean([
            visibility(frame, J["left_hip"]),
            visibility(frame, J["left_knee"]),
            visibility(frame, J["left_ankle"]),
            visibility(frame, J["right_hip"]),
            visibility(frame, J["right_knee"]),
            visibility(frame, J["right_ankle"]),
            visibility(frame, J["neck"]),
        ])),
    }


def aggregate_segment(segment: np.ndarray, front_leg: str) -> Dict[str, float]:
    if len(segment) == 0:
        return {}

    per_frame = [frame_features(frame, front_leg) for frame in segment]
    keys = sorted(per_frame[0].keys())
    output: Dict[str, float] = {}

    for key in keys:
        values = [row.get(key, np.nan) for row in per_frame]
        output.update(safe_stats(values, f"feature_{key}"))

    output["feature_front_knee_min"] = safe_min([row.get("front_knee_angle", np.nan) for row in per_frame])
    output["feature_back_knee_min"] = safe_min([row.get("back_knee_angle", np.nan) for row in per_frame])
    output["feature_hips_vertical_range"] = safe_range([row.get("hips_y", np.nan) for row in per_frame])
    output["feature_frames_in_segment"] = float(len(segment))
    output["feature_duration_sec_30fps"] = float(len(segment) / 30.0)

    return output


def front_leg_from_subtype(value: str) -> str:
    value = str(value).lower()

    if "left" in value:
        return "left"

    if "right" in value:
        return "right"

    return "left"


def load_segmentation() -> pd.DataFrame:
    if SEG_PATH.exists():
        return pd.read_csv(SEG_PATH)

    fallback = ROOT / "Segmentation.csv"
    if fallback.exists():
        df = pd.read_csv(fallback, sep=";")
        return df[df["exercise_id"] == 5].copy()

    raise FileNotFoundError(f"Segmentation not found: {SEG_PATH}")


def main():
    if not JOINTS_DIR.exists():
        raise SystemExit(f"3D joints Ex5 folder not found: {JOINTS_DIR}")

    seg = load_segmentation()
    seg = seg[seg["exercise_id"] == 5].copy()

    rows = []
    missing_files = []
    skipped_empty = []
    cache: Dict[str, np.ndarray] = {}

    for _, item in seg.iterrows():
        video_id = str(item["video_id"])
        npy_path = JOINTS_DIR / f"{video_id}-30fps.npy"

        if not npy_path.exists():
            missing_files.append(str(npy_path))
            continue

        if video_id not in cache:
            cache[video_id] = np.load(npy_path, allow_pickle=False)

        arr = cache[video_id]

        first_frame = int(item["first_frame"])
        last_frame = int(item["last_frame"])

        # REHAB24 segmentation indexes match 30fps arrays in this dataset.
        start = max(0, first_frame)
        end = min(arr.shape[0] - 1, last_frame)

        if end <= start:
            skipped_empty.append({
                "video_id": video_id,
                "first_frame": first_frame,
                "last_frame": last_frame,
                "array_frames": arr.shape[0],
            })
            continue

        segment = arr[start:end + 1]
        front_leg = front_leg_from_subtype(item.get("exercise_subtype", ""))
        features = aggregate_segment(segment, front_leg)

        row: Dict[str, Any] = {
            "source": "rehab24_3d",
            "video_id": video_id,
            "rep_id": f"{video_id}_rep_{int(item['repetition_number']):03d}",
            "repetition_number": int(item["repetition_number"]),
            "exercise_mode": "lunge",
            "exercise_id": int(item["exercise_id"]),
            "person_id": int(item["person_id"]),
            "first_frame": first_frame,
            "last_frame": last_frame,
            "front_leg": front_leg,
            "exercise_subtype": item.get("exercise_subtype"),
            "cam17_orientation": item.get("cam17_orientation"),
            "mocap_erroneous": int(item.get("mocap_erroneous", 0)),
            "correctness": int(item["correctness"]),
            "is_correct": int(item["correctness"]),
        }
        row.update(features)
        rows.append(row)

    df = pd.DataFrame(rows)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_PATH, index=False, encoding="utf-8")

    print("=" * 90)
    print("REHAB24 LUNGE 3D FEATURE DATASET BUILT")
    print("=" * 90)
    print(f"Rows: {len(df)}")
    print(f"Output: {OUT_PATH.resolve()}")

    if len(df):
        print("\nClass distribution:")
        print(df["is_correct"].value_counts().sort_index().to_string())

        print("\nVideos:")
        print(df["video_id"].value_counts().sort_index().to_string())

        print("\nFirst 5 rows:")
        preview_cols = [
            "rep_id",
            "video_id",
            "front_leg",
            "cam17_orientation",
            "is_correct",
            "feature_front_knee_min",
            "feature_back_knee_min",
            "feature_hips_vertical_range",
            "feature_duration_sec_30fps",
        ]
        preview_cols = [c for c in preview_cols if c in df.columns]
        print(df[preview_cols].head().to_string(index=False))

        print("\nFeature columns count:")
        print(len([c for c in df.columns if c.startswith("feature_")]))

    if missing_files:
        print("\nMissing files:")
        for p in missing_files[:20]:
            print(" ", p)

    if skipped_empty:
        print("\nSkipped empty segments:")
        for item in skipped_empty[:20]:
            print(" ", item)


if __name__ == "__main__":
    main()