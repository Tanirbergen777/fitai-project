import math
from pathlib import Path

import cv2
import mediapipe as mp
import pandas as pd


# ---------- Paths ----------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

RAW_VIDEOS_DIR = PROJECT_ROOT / "ai_engine" / "datasets" / "raw_videos"
OUTPUT_CSV = PROJECT_ROOT / "ai_engine" / "datasets" / "video_pose_frames.csv"

# Используем ту же модель, что и во фронте
MODEL_PATH = PROJECT_ROOT / "frontend" / "public" / "models" / "pose_landmarker_lite.task"


# ---------- MediaPipe ----------
BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode


LANDMARKS = {
    "LEFT_SHOULDER": 11,
    "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13,
    "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15,
    "RIGHT_WRIST": 16,
    "LEFT_HIP": 23,
    "RIGHT_HIP": 24,
    "LEFT_KNEE": 25,
    "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27,
    "RIGHT_ANKLE": 28,
}


def get_angle(a, b, c):
    if a is None or b is None or c is None:
        return None

    abx, aby = a.x - b.x, a.y - b.y
    cbx, cby = c.x - b.x, c.y - b.y

    dot = abx * cbx + aby * cby
    mag_ab = math.sqrt(abx * abx + aby * aby)
    mag_cb = math.sqrt(cbx * cbx + cby * cby)

    if mag_ab == 0 or mag_cb == 0:
        return None

    cosine = max(-1.0, min(1.0, dot / (mag_ab * mag_cb)))
    return math.degrees(math.acos(cosine))


def get_distance(a, b):
    if a is None or b is None:
        return None
    dx = a.x - b.x
    dy = a.y - b.y
    dz = getattr(a, "z", 0.0) - getattr(b, "z", 0.0)
    return math.sqrt(dx * dx + dy * dy + dz * dz)


def safe_landmark(points, idx):
    if points is None or idx >= len(points):
        return None
    return points[idx]


def parse_video_name(video_path: Path):
    """
    Примеры:
    squat_correct_01.mp4
    squat_wrong_depth_01.mp4
    plank_hips_high_01.mp4
    jumping_jacks_correct_01.mp4
    high_knees_knees_low_01.mp4
    """
    stem = video_path.stem

    known_exercises = [
        "jumping_jacks",
        "high_knees",
        "reverse_crunch",
        "crunch",
        "squat",
        "plank",
        "lunge",
    ]

    exercise = None
    for ex in known_exercises:
        prefix = f"{ex}_"
        if stem.startswith(prefix):
            exercise = ex
            rest = stem[len(prefix):]
            break

    if exercise is None:
        raise ValueError(
            f"Не удалось определить exercise из имени файла: {video_path.name}"
        )

    parts = rest.split("_")
    if len(parts) < 2:
        raise ValueError(
            f"Имя файла должно заканчиваться номером, например _01: {video_path.name}"
        )

    clip_id = parts[-1]
    label_part = "_".join(parts[:-1])

    if label_part == "correct":
        target_is_correct = 1
        error_type = "none"
    else:
        target_is_correct = 0
        error_type = label_part

    return {
        "exercise_name": exercise,
        "target_is_correct": target_is_correct,
        "error_type": error_type,
        "clip_id": clip_id,
    }


def extract_generic_features(landmarks, world_landmarks):
    # Для углов и расстояний стараемся брать world landmarks, если они есть.
    wl = world_landmarks if world_landmarks else landmarks
    lm = landmarks

    l_sh = safe_landmark(wl, LANDMARKS["LEFT_SHOULDER"])
    r_sh = safe_landmark(wl, LANDMARKS["RIGHT_SHOULDER"])
    l_el = safe_landmark(wl, LANDMARKS["LEFT_ELBOW"])
    r_el = safe_landmark(wl, LANDMARKS["RIGHT_ELBOW"])
    l_wr = safe_landmark(wl, LANDMARKS["LEFT_WRIST"])
    r_wr = safe_landmark(wl, LANDMARKS["RIGHT_WRIST"])
    l_hip = safe_landmark(wl, LANDMARKS["LEFT_HIP"])
    r_hip = safe_landmark(wl, LANDMARKS["RIGHT_HIP"])
    l_knee = safe_landmark(wl, LANDMARKS["LEFT_KNEE"])
    r_knee = safe_landmark(wl, LANDMARKS["RIGHT_KNEE"])
    l_ank = safe_landmark(wl, LANDMARKS["LEFT_ANKLE"])
    r_ank = safe_landmark(wl, LANDMARKS["RIGHT_ANKLE"])

    img_l_hip = safe_landmark(lm, LANDMARKS["LEFT_HIP"])
    img_r_hip = safe_landmark(lm, LANDMARKS["RIGHT_HIP"])
    img_l_knee = safe_landmark(lm, LANDMARKS["LEFT_KNEE"])
    img_r_knee = safe_landmark(lm, LANDMARKS["RIGHT_KNEE"])
    img_l_sh = safe_landmark(lm, LANDMARKS["LEFT_SHOULDER"])
    img_r_sh = safe_landmark(lm, LANDMARKS["RIGHT_SHOULDER"])
    img_l_ank = safe_landmark(lm, LANDMARKS["LEFT_ANKLE"])
    img_r_ank = safe_landmark(lm, LANDMARKS["RIGHT_ANKLE"])
    img_l_wr = safe_landmark(lm, LANDMARKS["LEFT_WRIST"])
    img_r_wr = safe_landmark(lm, LANDMARKS["RIGHT_WRIST"])

    left_knee_angle = get_angle(l_hip, l_knee, l_ank)
    right_knee_angle = get_angle(r_hip, r_knee, r_ank)
    left_elbow_angle = get_angle(l_sh, l_el, l_wr)
    right_elbow_angle = get_angle(r_sh, r_el, r_wr)
    left_hip_angle = get_angle(l_sh, l_hip, l_knee)
    right_hip_angle = get_angle(r_sh, r_hip, r_knee)

    shoulder_width = get_distance(l_sh, r_sh)
    ankle_width = get_distance(l_ank, r_ank)
    wrist_width = get_distance(l_wr, r_wr)

    # Нормализованные image-space признаки
    left_knee_lift = None
    right_knee_lift = None
    if img_l_hip and img_l_knee:
        left_knee_lift = img_l_hip.y - img_l_knee.y
    if img_r_hip and img_r_knee:
        right_knee_lift = img_r_hip.y - img_r_knee.y

    hip_offset = None
    if img_l_sh and img_r_sh and img_l_hip and img_r_hip and img_l_ank and img_r_ank:
        shoulder_y = (img_l_sh.y + img_r_sh.y) / 2
        hip_y = (img_l_hip.y + img_r_hip.y) / 2
        ankle_y = (img_l_ank.y + img_r_ank.y) / 2
        hip_offset = abs(hip_y - ((shoulder_y + ankle_y) / 2))

    features = {
        "feature_left_knee_angle": left_knee_angle,
        "feature_right_knee_angle": right_knee_angle,
        "feature_left_elbow_angle": left_elbow_angle,
        "feature_right_elbow_angle": right_elbow_angle,
        "feature_left_hip_angle": left_hip_angle,
        "feature_right_hip_angle": right_hip_angle,
        "feature_shoulder_width": shoulder_width,
        "feature_ankle_width": ankle_width,
        "feature_wrist_width": wrist_width,
        "feature_left_knee_lift": left_knee_lift,
        "feature_right_knee_lift": right_knee_lift,
        "feature_hip_offset": hip_offset,
    }

    # Сохраняем все landmarks как признаки
    for i, point in enumerate(lm):
        features[f"lm_{i}_x"] = getattr(point, "x", None)
        features[f"lm_{i}_y"] = getattr(point, "y", None)
        features[f"lm_{i}_z"] = getattr(point, "z", None)
        features[f"lm_{i}_visibility"] = getattr(point, "visibility", None)

    if world_landmarks:
        for i, point in enumerate(world_landmarks):
            features[f"wlm_{i}_x"] = getattr(point, "x", None)
            features[f"wlm_{i}_y"] = getattr(point, "y", None)
            features[f"wlm_{i}_z"] = getattr(point, "z", None)
            features[f"wlm_{i}_visibility"] = getattr(point, "visibility", None)

    return features


def iter_video_files(root: Path):
    for ext in ("*.mp4", "*.mov", "*.avi", "*.mkv"):
        yield from root.rglob(ext)


def process_video(video_path: Path, options, target_sampling_fps: float = 5.0):
    meta = parse_video_name(video_path)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"[WARN] Не удалось открыть видео: {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    sample_every = max(1, int(round(fps / target_sampling_fps)))

    rows = []
    frame_idx = 0
    kept_frames = 0
    detected_frames = 0

    with PoseLandmarker.create_from_options(options) as landmarker:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            if frame_idx % sample_every != 0:
                frame_idx += 1
                continue

            kept_frames += 1

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            timestamp_ms = int((frame_idx / fps) * 1000)

            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            pose_landmarks_list = getattr(result, "pose_landmarks", None)
            if pose_landmarks_list is None:
                pose_landmarks_list = getattr(result, "landmarks", None)

            world_landmarks_list = getattr(result, "pose_world_landmarks", None)
            if world_landmarks_list is None:
                world_landmarks_list = getattr(result, "world_landmarks", None)

            if not pose_landmarks_list:
                frame_idx += 1
                continue

            landmarks = pose_landmarks_list[0]
            world_landmarks = world_landmarks_list[0] if world_landmarks_list else None
            detected_frames += 1

            row = {
                "video_name": video_path.name,
                "video_path": str(video_path.relative_to(PROJECT_ROOT)),
                "exercise_name": meta["exercise_name"],
                "target_is_correct": meta["target_is_correct"],
                "error_type": meta["error_type"],
                "clip_id": meta["clip_id"],
                "frame_index": frame_idx,
                "timestamp_ms": timestamp_ms,
                "video_fps": fps,
                "video_total_frames": total_frames,
                "sample_every_n_frames": sample_every,
            }

            row.update(extract_generic_features(landmarks, world_landmarks))
            rows.append(row)

            frame_idx += 1

    cap.release()

    print(
        f"[OK] {video_path.name} | sampled={kept_frames} | detected={detected_frames} | rows={len(rows)}"
    )
    return rows


def main():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Не найдена модель: {MODEL_PATH}\n"
            f"Проверь, что файл pose_landmarker_lite.task лежит в frontend/public/models/"
        )

    if not RAW_VIDEOS_DIR.exists():
        raise FileNotFoundError(f"Не найдена папка с видео: {RAW_VIDEOS_DIR}")

    video_files = sorted(iter_video_files(RAW_VIDEOS_DIR))
    if not video_files:
        raise FileNotFoundError(f"В raw_videos нет ни одного видео: {RAW_VIDEOS_DIR}")

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(MODEL_PATH)),
        running_mode=VisionRunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_segmentation_masks=False,
    )

    all_rows = []

    for video_path in video_files:
        rows = process_video(video_path, options, target_sampling_fps=5.0)
        all_rows.extend(rows)

    if not all_rows:
        raise RuntimeError(
            "Скрипт отработал, но не извлёк ни одной строки. "
            "Проверь видео, модель и видимость человека в кадре."
        )

    df = pd.DataFrame(all_rows)
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print("\nГотово.")
    print(f"Видео обработано: {len(video_files)}")
    print(f"Строк в датасете: {len(df)}")
    print(f"CSV сохранён: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()