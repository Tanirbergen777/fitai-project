import random
import csv
import os

def determine_plan(age, gender, height, weight, goal, focus, limitations, intensity, duration):
    if age < 18:
        return "kids_active_play_safe"
        
    if limitations == "joints" or intensity == "low":
        if goal == "lose_weight":
            return "fat_loss_low_impact"
        elif goal == "gain_mass":
            return "muscle_low_impact"
        else:
            return "keep_fit_low_impact"
            
    if goal == "lose_weight":
        if focus in ["full", "legs"]:
            return "fat_loss_cardio_focus" if intensity == "high" else "fat_loss_general"
        else:
            return "fat_loss_general"
            
    if goal == "gain_mass":
        if intensity == "high":
            return "muscle_gym_progressive"
        else:
            return "muscle_home_basic"
            
    # keep_fit
    if intensity == "high" or duration >= 45:
        return "keep_fit_endurance"
        
    return "keep_fit_balanced"

def generate_dataset(num_samples=10000):
    genders = ["Male", "Female"]
    goals = ["keep_fit", "lose_weight", "gain_mass"]
    focuses = ["full", "legs", "abs", "chest", "arms"]
    limitations_opts = ["none", "none", "none", "joints"] # 25% have joints issues
    intensities = ["low", "normal", "high"]
    durations = [10, 15, 20, 30, 45, 60]
    
    data = []
    
    for _ in range(num_samples):
        age = random.randint(14, 80)
        gender = random.choice(genders)
        
        if gender == "Male":
            height = random.uniform(160, 200)
            weight = random.uniform(50, 140)
        else:
            height = random.uniform(150, 185)
            weight = random.uniform(45, 120)
            
        goal = random.choice(goals)
        focus = random.choice(focuses)
        limitation = random.choice(limitations_opts)
        intensity = random.choice(intensities)
        duration = random.choice(durations)
        
        plan_id = determine_plan(age, gender, height, weight, goal, focus, limitation, intensity, duration)
        
        data.append([
            age, gender, round(height, 1), round(weight, 1), 
            goal, focus, limitation, intensity, duration, plan_id
        ])
        
    return data

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "new_ai_workout_dataset.csv")
    
    dataset = generate_dataset(10000)
    
    with open(out_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "age", "gender", "height", "weight", 
            "goal", "focus", "limitations", "intensity", "duration", "plan_template_id"
        ])
        writer.writerows(dataset)
        
    print(f"✅ Generated {len(dataset)} records into {out_file}")
