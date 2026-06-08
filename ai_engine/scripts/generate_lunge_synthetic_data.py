"""
Lunge моделін оқыту үшін синтетикалық деректер жасау.
Реалды биомеханикалық зерттеулерге (Schoenfeld et al., 2010) 
сүйеніп, "дұрыс" (correct) және "қате" (wrong) lunge кадрларын генерациялаймыз.

Дұрыс lunge критерийлері:
  - Алдыңғы тізе бұрышы: 85-100° (90° идеал)
  - Артқы тізе бұрышы: 85-110°  
  - Дене түзулігі (torso lean): 0-15° (тік тұру)
  - Алдыңғы тізе аяқ ұшынан алға шықпайды

Қате lunge нұсқалары:
  1. Тізе тым алға шығады (knee over toe)
  2. Тізе жеткіліксіз бүгіледі (shallow lunge)
  3. Дене тым алға еңкейеді (excessive lean)
  4. Тізе ішке/сыртқа ауытқиды (knee valgus/varus)
"""

import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

OUTPUT_PATH = Path("ai_engine/datasets/lunge_synthetic_features.csv")
OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

N_CORRECT = 1500
N_WRONG = 1500
N_TOTAL = N_CORRECT + N_WRONG


def generate_correct_lunge(n: int) -> pd.DataFrame:
    """Дұрыс lunge кадрларын генерациялау."""
    rows = []
    for i in range(n):
        # Дұрыс lunge — алдыңғы тізе 85-100°, артқы тізе 85-110°
        front_knee = np.random.normal(92, 4)  # идеал ~90°
        back_knee = np.random.normal(95, 6)
        front_hip = np.random.normal(95, 5)
        back_hip = np.random.normal(160, 8)
        torso_lean = np.random.normal(8, 3)   # аздап алға еңкею (нормалды)
        ankle_dist = np.random.normal(0.85, 0.08)  # аяқтар арасындағы қашықтық
        knee_dist = np.random.normal(0.45, 0.05)
        hip_dist = np.random.normal(0.25, 0.03)
        shoulder_dist = np.random.normal(0.35, 0.03)
        front_knee_to_toe = np.random.normal(0.02, 0.01)  # тізе аяқ ұшымен тең
        front_knee_y = np.random.normal(0.45, 0.04)
        back_knee_y = np.random.normal(0.18, 0.04)
        hips_y = np.random.normal(0.55, 0.05)
        neck_y = np.random.normal(1.20, 0.05)
        vis_mean = np.random.uniform(0.85, 1.0)
        duration = np.random.uniform(1.5, 4.0)
        n_frames = int(duration * 30)

        row = _make_row(
            front_knee, back_knee, front_hip, back_hip,
            torso_lean, ankle_dist, knee_dist, hip_dist,
            shoulder_dist, front_knee_to_toe, front_knee_y,
            back_knee_y, hips_y, neck_y, vis_mean, n_frames,
            duration, is_correct=1, video_id=f"synth_correct_{i:04d}"
        )
        rows.append(row)
    return pd.DataFrame(rows)


def generate_wrong_lunge(n: int) -> pd.DataFrame:
    """Қате lunge кадрларын генерациялау (4 типтегі қателік)."""
    rows = []
    error_types = ["knee_over_toe", "shallow", "excessive_lean", "knee_valgus"]
    
    per_type = n // len(error_types)
    
    for error_type in error_types:
        for i in range(per_type):
            if error_type == "knee_over_toe":
                # Тізе аяқ ұшынан тым алға шығады
                front_knee = np.random.normal(75, 5)
                back_knee = np.random.normal(95, 8)
                front_hip = np.random.normal(80, 6)
                back_hip = np.random.normal(155, 10)
                torso_lean = np.random.normal(12, 4)
                front_knee_to_toe = np.random.normal(0.12, 0.03)  # тым алға!
                
            elif error_type == "shallow":
                # Тізе жеткілікті бүгілмейді (таяз lunge)
                front_knee = np.random.normal(140, 10)  # тым тік
                back_knee = np.random.normal(145, 10)
                front_hip = np.random.normal(150, 8)
                back_hip = np.random.normal(170, 5)
                torso_lean = np.random.normal(5, 3)
                front_knee_to_toe = np.random.normal(0.03, 0.02)
                
            elif error_type == "excessive_lean":
                # Дене тым алға еңкейеді
                front_knee = np.random.normal(88, 5)
                back_knee = np.random.normal(90, 7)
                front_hip = np.random.normal(65, 8)
                back_hip = np.random.normal(140, 10)
                torso_lean = np.random.normal(35, 8)  # тым көп!
                front_knee_to_toe = np.random.normal(0.05, 0.02)
                
            elif error_type == "knee_valgus":
                # Тізе ішке ауытқиды
                front_knee = np.random.normal(88, 6)
                back_knee = np.random.normal(92, 7)
                front_hip = np.random.normal(90, 6)
                back_hip = np.random.normal(155, 8)
                torso_lean = np.random.normal(10, 4)
                front_knee_to_toe = np.random.normal(0.04, 0.02)

            ankle_dist = np.random.normal(0.80, 0.12)
            knee_dist = np.random.normal(0.40, 0.08)
            hip_dist = np.random.normal(0.25, 0.04)
            shoulder_dist = np.random.normal(0.35, 0.04)
            front_knee_y = np.random.normal(0.42, 0.06)
            back_knee_y = np.random.normal(0.20, 0.06)
            hips_y = np.random.normal(0.52, 0.07)
            neck_y = np.random.normal(1.15, 0.08)
            vis_mean = np.random.uniform(0.75, 1.0)
            duration = np.random.uniform(1.0, 5.0)
            n_frames = int(duration * 30)

            row = _make_row(
                front_knee, back_knee, front_hip, back_hip,
                torso_lean, ankle_dist, knee_dist, hip_dist,
                shoulder_dist, front_knee_to_toe, front_knee_y,
                back_knee_y, hips_y, neck_y, vis_mean, n_frames,
                duration, is_correct=0, video_id=f"synth_wrong_{error_type}_{i:04d}"
            )
            rows.append(row)
    
    # Қалған бөлігін кездейсоқ қателік типімен толтырамыз
    remaining = n - len(rows)
    for i in range(remaining):
        error_type = np.random.choice(error_types)
        front_knee = np.random.normal(110, 20)
        back_knee = np.random.normal(120, 20)
        front_hip = np.random.normal(100, 15)
        back_hip = np.random.normal(155, 12)
        torso_lean = np.random.normal(25, 10)
        front_knee_to_toe = np.random.normal(0.08, 0.04)
        ankle_dist = np.random.normal(0.78, 0.12)
        knee_dist = np.random.normal(0.38, 0.08)
        hip_dist = np.random.normal(0.25, 0.04)
        shoulder_dist = np.random.normal(0.35, 0.04)
        front_knee_y = np.random.normal(0.40, 0.07)
        back_knee_y = np.random.normal(0.22, 0.07)
        hips_y = np.random.normal(0.50, 0.08)
        neck_y = np.random.normal(1.12, 0.08)
        vis_mean = np.random.uniform(0.70, 1.0)
        duration = np.random.uniform(1.0, 5.0)
        n_frames = int(duration * 30)

        row = _make_row(
            front_knee, back_knee, front_hip, back_hip,
            torso_lean, ankle_dist, knee_dist, hip_dist,
            shoulder_dist, front_knee_to_toe, front_knee_y,
            back_knee_y, hips_y, neck_y, vis_mean, n_frames,
            duration, is_correct=0, video_id=f"synth_wrong_mixed_{i:04d}"
        )
        rows.append(row)
    
    return pd.DataFrame(rows)


def _make_row(front_knee, back_knee, front_hip, back_hip,
              torso_lean, ankle_dist, knee_dist, hip_dist,
              shoulder_dist, front_knee_to_toe, front_knee_y,
              back_knee_y, hips_y, neck_y, vis_mean, n_frames,
              duration, is_correct, video_id):
    """Бір қатар (row) жасау. Біздің жүйемен сәйкес feature columns жасаймыз."""
    
    # Статистикалық белгілер (mean, std, min, max, range) — дәл біздің модель форматымен бірдей
    noise = lambda: np.random.normal(0, 0.5)
    
    return {
        "source": "synthetic",
        "video_id": video_id,
        "rep_id": f"{video_id}_rep_001",
        "repetition_number": 1,
        "exercise_mode": "lunge",
        "is_correct": is_correct,
        
        # Front knee angle stats
        "feature_front_knee_angle_mean": front_knee + noise(),
        "feature_front_knee_angle_std": abs(np.random.normal(3, 1)),
        "feature_front_knee_angle_min": front_knee - abs(np.random.normal(8, 2)),
        "feature_front_knee_angle_max": front_knee + abs(np.random.normal(8, 2)),
        "feature_front_knee_angle_range": abs(np.random.normal(16, 4)),
        
        # Back knee angle stats
        "feature_back_knee_angle_mean": back_knee + noise(),
        "feature_back_knee_angle_std": abs(np.random.normal(4, 1.5)),
        "feature_back_knee_angle_min": back_knee - abs(np.random.normal(10, 3)),
        "feature_back_knee_angle_max": back_knee + abs(np.random.normal(10, 3)),
        "feature_back_knee_angle_range": abs(np.random.normal(20, 5)),
        
        # Front hip angle stats
        "feature_front_hip_angle_mean": front_hip + noise(),
        "feature_front_hip_angle_std": abs(np.random.normal(3, 1)),
        "feature_front_hip_angle_min": front_hip - abs(np.random.normal(6, 2)),
        "feature_front_hip_angle_max": front_hip + abs(np.random.normal(6, 2)),
        "feature_front_hip_angle_range": abs(np.random.normal(12, 3)),
        
        # Back hip angle stats
        "feature_back_hip_angle_mean": back_hip + noise(),
        "feature_back_hip_angle_std": abs(np.random.normal(3, 1.5)),
        "feature_back_hip_angle_min": back_hip - abs(np.random.normal(6, 2)),
        "feature_back_hip_angle_max": back_hip + abs(np.random.normal(6, 2)),
        "feature_back_hip_angle_range": abs(np.random.normal(12, 3)),
        
        # Left knee angle stats  
        "feature_left_knee_angle_mean": front_knee + np.random.normal(0, 2),
        "feature_left_knee_angle_std": abs(np.random.normal(3, 1)),
        "feature_left_knee_angle_min": front_knee - abs(np.random.normal(8, 2)),
        "feature_left_knee_angle_max": front_knee + abs(np.random.normal(8, 2)),
        "feature_left_knee_angle_range": abs(np.random.normal(16, 4)),
        
        # Right knee angle stats
        "feature_right_knee_angle_mean": back_knee + np.random.normal(0, 2),
        "feature_right_knee_angle_std": abs(np.random.normal(4, 1.5)),
        "feature_right_knee_angle_min": back_knee - abs(np.random.normal(10, 3)),
        "feature_right_knee_angle_max": back_knee + abs(np.random.normal(10, 3)),
        "feature_right_knee_angle_range": abs(np.random.normal(20, 5)),
        
        # Left hip angle stats
        "feature_left_hip_angle_mean": front_hip + np.random.normal(0, 2),
        "feature_left_hip_angle_std": abs(np.random.normal(3, 1)),
        "feature_left_hip_angle_min": front_hip - abs(np.random.normal(6, 2)),
        "feature_left_hip_angle_max": front_hip + abs(np.random.normal(6, 2)),
        "feature_left_hip_angle_range": abs(np.random.normal(12, 3)),
        
        # Right hip angle stats
        "feature_right_hip_angle_mean": back_hip + np.random.normal(0, 2),
        "feature_right_hip_angle_std": abs(np.random.normal(3, 1.5)),
        "feature_right_hip_angle_min": back_hip - abs(np.random.normal(6, 2)),
        "feature_right_hip_angle_max": back_hip + abs(np.random.normal(6, 2)),
        "feature_right_hip_angle_range": abs(np.random.normal(12, 3)),
        
        # Torso lean angle stats
        "feature_torso_lean_angle_mean": torso_lean + noise(),
        "feature_torso_lean_angle_std": abs(np.random.normal(2, 0.8)),
        "feature_torso_lean_angle_min": max(0, torso_lean - abs(np.random.normal(4, 1.5))),
        "feature_torso_lean_angle_max": torso_lean + abs(np.random.normal(4, 1.5)),
        "feature_torso_lean_angle_range": abs(np.random.normal(8, 2)),
        
        # Ankle distance stats
        "feature_ankle_distance_mean": ankle_dist + noise() * 0.01,
        "feature_ankle_distance_std": abs(np.random.normal(0.02, 0.005)),
        "feature_ankle_distance_min": ankle_dist - abs(np.random.normal(0.04, 0.01)),
        "feature_ankle_distance_max": ankle_dist + abs(np.random.normal(0.04, 0.01)),
        "feature_ankle_distance_range": abs(np.random.normal(0.08, 0.02)),
        
        # Knee distance stats
        "feature_knee_distance_mean": knee_dist + noise() * 0.01,
        "feature_knee_distance_std": abs(np.random.normal(0.02, 0.005)),
        "feature_knee_distance_min": knee_dist - abs(np.random.normal(0.03, 0.01)),
        "feature_knee_distance_max": knee_dist + abs(np.random.normal(0.03, 0.01)),
        "feature_knee_distance_range": abs(np.random.normal(0.06, 0.02)),
        
        # Hip distance stats
        "feature_hip_distance_mean": hip_dist + noise() * 0.01,
        "feature_hip_distance_std": abs(np.random.normal(0.01, 0.003)),
        "feature_hip_distance_min": hip_dist - abs(np.random.normal(0.02, 0.005)),
        "feature_hip_distance_max": hip_dist + abs(np.random.normal(0.02, 0.005)),
        "feature_hip_distance_range": abs(np.random.normal(0.04, 0.01)),
        
        # Shoulder distance stats
        "feature_shoulder_distance_mean": shoulder_dist + noise() * 0.01,
        "feature_shoulder_distance_std": abs(np.random.normal(0.01, 0.003)),
        "feature_shoulder_distance_min": shoulder_dist - abs(np.random.normal(0.02, 0.005)),
        "feature_shoulder_distance_max": shoulder_dist + abs(np.random.normal(0.02, 0.005)),
        "feature_shoulder_distance_range": abs(np.random.normal(0.04, 0.01)),
        
        # Front knee to toe XZ stats
        "feature_front_knee_to_toe_xz_mean": front_knee_to_toe + noise() * 0.005,
        "feature_front_knee_to_toe_xz_std": abs(np.random.normal(0.01, 0.003)),
        "feature_front_knee_to_toe_xz_min": max(0, front_knee_to_toe - abs(np.random.normal(0.02, 0.005))),
        "feature_front_knee_to_toe_xz_max": front_knee_to_toe + abs(np.random.normal(0.02, 0.005)),
        "feature_front_knee_to_toe_xz_range": abs(np.random.normal(0.04, 0.01)),
        
        # Position features
        "feature_front_knee_y_mean": front_knee_y + noise() * 0.01,
        "feature_front_knee_y_std": abs(np.random.normal(0.02, 0.005)),
        "feature_front_knee_y_min": front_knee_y - abs(np.random.normal(0.04, 0.01)),
        "feature_front_knee_y_max": front_knee_y + abs(np.random.normal(0.04, 0.01)),
        "feature_front_knee_y_range": abs(np.random.normal(0.08, 0.02)),
        
        "feature_back_knee_y_mean": back_knee_y + noise() * 0.01,
        "feature_back_knee_y_std": abs(np.random.normal(0.02, 0.005)),
        "feature_back_knee_y_min": back_knee_y - abs(np.random.normal(0.04, 0.01)),
        "feature_back_knee_y_max": back_knee_y + abs(np.random.normal(0.04, 0.01)),
        "feature_back_knee_y_range": abs(np.random.normal(0.08, 0.02)),
        
        "feature_hips_y_mean": hips_y + noise() * 0.01,
        "feature_hips_y_std": abs(np.random.normal(0.02, 0.005)),
        "feature_hips_y_min": hips_y - abs(np.random.normal(0.05, 0.01)),
        "feature_hips_y_max": hips_y + abs(np.random.normal(0.05, 0.01)),
        "feature_hips_y_range": abs(np.random.normal(0.10, 0.03)),
        
        "feature_neck_y_mean": neck_y + noise() * 0.01,
        "feature_neck_y_std": abs(np.random.normal(0.02, 0.005)),
        "feature_neck_y_min": neck_y - abs(np.random.normal(0.04, 0.01)),
        "feature_neck_y_max": neck_y + abs(np.random.normal(0.04, 0.01)),
        "feature_neck_y_range": abs(np.random.normal(0.08, 0.02)),
        
        # Visibility
        "feature_visibility_mean_mean": vis_mean,
        "feature_visibility_mean_std": abs(np.random.normal(0.03, 0.01)),
        "feature_visibility_mean_min": max(0, vis_mean - abs(np.random.normal(0.1, 0.03))),
        "feature_visibility_mean_max": min(1, vis_mean + abs(np.random.normal(0.05, 0.01))),
        "feature_visibility_mean_range": abs(np.random.normal(0.15, 0.04)),
        
        # Aggregate features
        "feature_front_knee_min": front_knee - abs(np.random.normal(8, 2)),
        "feature_back_knee_min": back_knee - abs(np.random.normal(10, 3)),
        "feature_hips_vertical_range": abs(np.random.normal(0.15, 0.04)),
        "feature_frames_in_segment": float(n_frames),
        "feature_duration_sec_30fps": duration,
    }


def main():
    print("=" * 80)
    print("СИНТЕТИКАЛЫҚ LUNGE ДЕРЕКТЕРІН ГЕНЕРАЦИЯЛАУ")
    print("=" * 80)
    
    df_correct = generate_correct_lunge(N_CORRECT)
    df_wrong = generate_wrong_lunge(N_WRONG)
    
    df = pd.concat([df_correct, df_wrong], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    
    print(f"Жалпы қатарлар (rows): {len(df)}")
    print(f"\nКласс бойынша бөлінуі:")
    print(f"  Correct (1): {len(df_correct)}")
    print(f"  Wrong   (0): {len(df_wrong)}")
    print(f"\nFeature бағандар саны: {len([c for c in df.columns if c.startswith('feature_')])}")
    print(f"\nСақталды: {OUTPUT_PATH.resolve()}")


if __name__ == "__main__":
    main()
