from pathlib import Path

ROOT = Path("ai_engine/datasets/rehab24_raw")
NAMES_PATH = ROOT / "joints_names.txt"

KEYWORDS = {
    "left_hip": ["left hip", "left_hip", "lhip", "l_hip", "hip_l"],
    "right_hip": ["right hip", "right_hip", "rhip", "r_hip", "hip_r"],
    "left_knee": ["left knee", "left_knee", "lknee", "l_knee", "knee_l"],
    "right_knee": ["right knee", "right_knee", "rknee", "r_knee", "knee_r"],
    "left_ankle": ["left ankle", "left_ankle", "lankle", "l_ankle", "ankle_l"],
    "right_ankle": ["right ankle", "right_ankle", "rankle", "r_ankle", "ankle_r"],
    "left_shoulder": ["left shoulder", "left_shoulder", "lshoulder", "l_shoulder", "shoulder_l"],
    "right_shoulder": ["right shoulder", "right_shoulder", "rshoulder", "r_shoulder", "shoulder_r"],
}

def normalize(value: str) -> str:
    return (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(".", "_")
        .replace("/", "_")
    )

def main():
    if not NAMES_PATH.exists():
        raise SystemExit(
            f"Файл табылмады: {NAMES_PATH}\n"
            "Мына команданы орындап тексер:\n"
            "  dir ai_engine\\datasets\\rehab24_raw\n"
        )

    raw_lines = NAMES_PATH.read_text(encoding="utf-8", errors="ignore").splitlines()
    names = [line.strip() for line in raw_lines if line.strip()]

    print("=" * 80)
    print("REHAB24-6 JOINT NAMES")
    print("=" * 80)
    print(f"Path: {NAMES_PATH.resolve()}")
    print(f"Joint names count: {len(names)}")

    print("\nIndex → name:")
    for idx, name in enumerate(names):
        print(f"{idx:02d}: {name}")

    print("\nAuto mapping attempt:")
    normalized = [normalize(name) for name in names]

    for target, aliases in KEYWORDS.items():
        found = None

        for idx, name in enumerate(normalized):
            for alias in aliases:
                alias_norm = normalize(alias)
                if alias_norm in name or name in alias_norm:
                    found = idx
                    break
            if found is not None:
                break

        if found is None:
            print(f"{target:15s}: NOT_FOUND")
        else:
            print(f"{target:15s}: {found:02d} → {names[found]}")

if __name__ == "__main__":
    main()