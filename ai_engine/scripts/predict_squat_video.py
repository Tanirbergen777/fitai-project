import argparse
import json
import math
from pathlib import Path

import cv2
import joblib
import mediapipe as mp
import pandas as pd


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent if SCRIPT_DIR.name == 'scripts' else SCRIPT_DIR.parent

DEFAULT_MODEL_BUNDLE = PROJECT_ROOT / 'ai_engine' / 'models_bin' / 'squat_pose_rf.pkl'
DEFAULT_FEATURES_PATH = PROJECT_ROOT / 'ai_engine' / 'models_bin' / 'squat_pose_feature_columns.json'
DEFAULT_POSE_MODEL = PROJECT_ROOT / 'frontend' / 'public' / 'models' / 'pose_landmarker_lite.task'
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / 'ai_engine' / 'inference_outputs'

BaseOptions = mp.tasks.BaseOptions
PoseLandmarker = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

LANDMARKS = {
    'LEFT_SHOULDER': 11,
    'RIGHT_SHOULDER': 12,
    'LEFT_ELBOW': 13,
    'RIGHT_ELBOW': 14,
    'LEFT_WRIST': 15,
    'RIGHT_WRIST': 16,
    'LEFT_HIP': 23,
    'RIGHT_HIP': 24,
    'LEFT_KNEE': 25,
    'RIGHT_KNEE': 26,
    'LEFT_ANKLE': 27,
    'RIGHT_ANKLE': 28,
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
    dz = getattr(a, 'z', 0.0) - getattr(b, 'z', 0.0)
    return math.sqrt(dx * dx + dy * dy + dz * dz)


def safe_landmark(points, idx):
    if points is None or idx >= len(points):
        return None
    return points[idx]


def extract_generic_features(landmarks, world_landmarks):
    wl = world_landmarks if world_landmarks else landmarks
    lm = landmarks

    l_sh = safe_landmark(wl, LANDMARKS['LEFT_SHOULDER'])
    r_sh = safe_landmark(wl, LANDMARKS['RIGHT_SHOULDER'])
    l_el = safe_landmark(wl, LANDMARKS['LEFT_ELBOW'])
    r_el = safe_landmark(wl, LANDMARKS['RIGHT_ELBOW'])
    l_wr = safe_landmark(wl, LANDMARKS['LEFT_WRIST'])
    r_wr = safe_landmark(wl, LANDMARKS['RIGHT_WRIST'])
    l_hip = safe_landmark(wl, LANDMARKS['LEFT_HIP'])
    r_hip = safe_landmark(wl, LANDMARKS['RIGHT_HIP'])
    l_knee = safe_landmark(wl, LANDMARKS['LEFT_KNEE'])
    r_knee = safe_landmark(wl, LANDMARKS['RIGHT_KNEE'])
    l_ank = safe_landmark(wl, LANDMARKS['LEFT_ANKLE'])
    r_ank = safe_landmark(wl, LANDMARKS['RIGHT_ANKLE'])

    img_l_hip = safe_landmark(lm, LANDMARKS['LEFT_HIP'])
    img_r_hip = safe_landmark(lm, LANDMARKS['RIGHT_HIP'])
    img_l_knee = safe_landmark(lm, LANDMARKS['LEFT_KNEE'])
    img_r_knee = safe_landmark(lm, LANDMARKS['RIGHT_KNEE'])
    img_l_sh = safe_landmark(lm, LANDMARKS['LEFT_SHOULDER'])
    img_r_sh = safe_landmark(lm, LANDMARKS['RIGHT_SHOULDER'])
    img_l_ank = safe_landmark(lm, LANDMARKS['LEFT_ANKLE'])
    img_r_ank = safe_landmark(lm, LANDMARKS['RIGHT_ANKLE'])
    img_l_wr = safe_landmark(lm, LANDMARKS['LEFT_WRIST'])
    img_r_wr = safe_landmark(lm, LANDMARKS['RIGHT_WRIST'])

    left_knee_angle = get_angle(l_hip, l_knee, l_ank)
    right_knee_angle = get_angle(r_hip, r_knee, r_ank)
    left_elbow_angle = get_angle(l_sh, l_el, l_wr)
    right_elbow_angle = get_angle(r_sh, r_el, r_wr)
    left_hip_angle = get_angle(l_sh, l_hip, l_knee)
    right_hip_angle = get_angle(r_sh, r_hip, r_knee)

    shoulder_width = get_distance(l_sh, r_sh)
    ankle_width = get_distance(l_ank, r_ank)
    wrist_width = get_distance(l_wr, r_wr)

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
        'feature_left_knee_angle': left_knee_angle,
        'feature_right_knee_angle': right_knee_angle,
        'feature_left_elbow_angle': left_elbow_angle,
        'feature_right_elbow_angle': right_elbow_angle,
        'feature_left_hip_angle': left_hip_angle,
        'feature_right_hip_angle': right_hip_angle,
        'feature_shoulder_width': shoulder_width,
        'feature_ankle_width': ankle_width,
        'feature_wrist_width': wrist_width,
        'feature_left_knee_lift': left_knee_lift,
        'feature_right_knee_lift': right_knee_lift,
        'feature_hip_offset': hip_offset,
    }

    for i, point in enumerate(lm):
        features[f'lm_{i}_x'] = getattr(point, 'x', None)
        features[f'lm_{i}_y'] = getattr(point, 'y', None)
        features[f'lm_{i}_z'] = getattr(point, 'z', None)
        features[f'lm_{i}_visibility'] = getattr(point, 'visibility', None)

    if world_landmarks:
        for i, point in enumerate(world_landmarks):
            features[f'wlm_{i}_x'] = getattr(point, 'x', None)
            features[f'wlm_{i}_y'] = getattr(point, 'y', None)
            features[f'wlm_{i}_z'] = getattr(point, 'z', None)
            features[f'wlm_{i}_visibility'] = getattr(point, 'visibility', None)

    return features


def process_video(video_path: Path, pose_model_path: Path, target_sampling_fps: float = 5.0):
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f'Не удалось открыть видео: {video_path}')

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    sample_every = max(1, int(round(fps / target_sampling_fps)))

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(pose_model_path)),
        running_mode=VisionRunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_segmentation_masks=False,
    )

    rows = []
    frame_idx = 0
    sampled_frames = 0
    detected_frames = 0

    with PoseLandmarker.create_from_options(options) as landmarker:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            if frame_idx % sample_every != 0:
                frame_idx += 1
                continue

            sampled_frames += 1

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            timestamp_ms = int((frame_idx / fps) * 1000)

            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            pose_landmarks_list = getattr(result, 'pose_landmarks', None)
            if pose_landmarks_list is None:
                pose_landmarks_list = getattr(result, 'landmarks', None)

            world_landmarks_list = getattr(result, 'pose_world_landmarks', None)
            if world_landmarks_list is None:
                world_landmarks_list = getattr(result, 'world_landmarks', None)

            if not pose_landmarks_list:
                frame_idx += 1
                continue

            landmarks = pose_landmarks_list[0]
            world_landmarks = world_landmarks_list[0] if world_landmarks_list else None
            detected_frames += 1

            row = {
                'video_name': video_path.name,
                'video_path': str(video_path),
                'frame_index': frame_idx,
                'timestamp_ms': timestamp_ms,
                'video_fps': fps,
                'video_total_frames': total_frames,
                'sample_every_n_frames': sample_every,
            }
            row.update(extract_generic_features(landmarks, world_landmarks))
            rows.append(row)

            frame_idx += 1

    cap.release()

    return {
        'rows': rows,
        'fps': fps,
        'total_frames': total_frames,
        'sampled_frames': sampled_frames,
        'detected_frames': detected_frames,
        'sample_every': sample_every,
    }


def aggregate_predictions(frame_probs):
    if not frame_probs:
        return {
            'final_prediction': 'unknown',
            'confidence': 0.0,
            'mean_correct_probability': 0.0,
            'mean_incorrect_probability': 0.0,
            'correct_frames': 0,
            'incorrect_frames': 0,
        }

    mean_correct = sum(p['prob_correct'] for p in frame_probs) / len(frame_probs)
    mean_incorrect = sum(p['prob_incorrect'] for p in frame_probs) / len(frame_probs)
    correct_frames = sum(1 for p in frame_probs if p['predicted_label'] == 1)
    incorrect_frames = sum(1 for p in frame_probs if p['predicted_label'] == 0)

    final_prediction = 'correct' if mean_correct >= mean_incorrect else 'incorrect'
    confidence = max(mean_correct, mean_incorrect)

    return {
        'final_prediction': final_prediction,
        'confidence': round(float(confidence), 4),
        'mean_correct_probability': round(float(mean_correct), 4),
        'mean_incorrect_probability': round(float(mean_incorrect), 4),
        'correct_frames': correct_frames,
        'incorrect_frames': incorrect_frames,
    }


def main():
    parser = argparse.ArgumentParser(description='Проверка squat-модели на новом видео')
    parser.add_argument('--video', required=True, help='Путь к видео для проверки')
    parser.add_argument('--model-bundle', default=str(DEFAULT_MODEL_BUNDLE), help='Путь к squat_pose_rf.pkl')
    parser.add_argument('--features', default=str(DEFAULT_FEATURES_PATH), help='Путь к squat_pose_feature_columns.json')
    parser.add_argument('--pose-model', default=str(DEFAULT_POSE_MODEL), help='Путь к pose_landmarker_lite.task')
    parser.add_argument('--sampling-fps', type=float, default=5.0, help='Сколько кадров в секунду брать из видео')
    parser.add_argument('--save-frame-preds', action='store_true', help='Сохранить покадровые предсказания в CSV')
    args = parser.parse_args()

    video_path = Path(args.video)
    model_bundle_path = Path(args.model_bundle)
    features_path = Path(args.features)
    pose_model_path = Path(args.pose_model)

    if not video_path.exists():
        raise FileNotFoundError(f'Видео не найдено: {video_path}')
    if not model_bundle_path.exists():
        raise FileNotFoundError(f'Файл модели не найден: {model_bundle_path}')
    if not features_path.exists():
        raise FileNotFoundError(f'Файл списка признаков не найден: {features_path}')
    if not pose_model_path.exists():
        raise FileNotFoundError(f'Файл pose model не найден: {pose_model_path}')

    bundle = joblib.load(model_bundle_path)
    model = bundle['model']
    imputer = bundle['imputer']

    with open(features_path, 'r', encoding='utf-8') as f:
        feature_columns = json.load(f)

    processed = process_video(video_path, pose_model_path, target_sampling_fps=args.sampling_fps)
    rows = processed['rows']

    if not rows:
        raise RuntimeError(
            'Не удалось извлечь ни одного кадра с позой. Проверь видео, ракурс и видимость человека.'
        )

    df = pd.DataFrame(rows)
    for col in feature_columns:
        if col not in df.columns:
            df[col] = None

    X = df[feature_columns].copy()
    X = imputer.transform(X)

    probs = model.predict_proba(X)
    preds = model.predict(X)

    frame_results = []
    for i, (pred, prob_pair) in enumerate(zip(preds, probs)):
        prob_incorrect = float(prob_pair[0])
        prob_correct = float(prob_pair[1])
        frame_results.append({
            'frame_index': int(df.iloc[i]['frame_index']),
            'timestamp_ms': int(df.iloc[i]['timestamp_ms']),
            'predicted_label': int(pred),
            'predicted_name': 'correct' if int(pred) == 1 else 'incorrect',
            'prob_correct': round(prob_correct, 6),
            'prob_incorrect': round(prob_incorrect, 6),
        })

    summary = aggregate_predictions(frame_results)

    report = {
        'video_name': video_path.name,
        'video_path': str(video_path),
        'frames_with_pose': len(frame_results),
        'sampled_frames': processed['sampled_frames'],
        'detected_frames': processed['detected_frames'],
        'video_fps': processed['fps'],
        'sample_every_n_frames': processed['sample_every'],
        **summary,
    }

    print('\n=== VIDEO REPORT ===')
    print(json.dumps(report, ensure_ascii=False, indent=2))

    output_dir = DEFAULT_OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    json_report_path = output_dir / f'{video_path.stem}_report.json'
    with open(json_report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f'\nJSON report saved: {json_report_path}')

    if args.save_frame_preds:
        frame_df = pd.DataFrame(frame_results)
        csv_path = output_dir / f'{video_path.stem}_frame_predictions.csv'
        frame_df.to_csv(csv_path, index=False, encoding='utf-8-sig')
        print(f'Frame predictions CSV saved: {csv_path}')


if __name__ == '__main__':
    main()
