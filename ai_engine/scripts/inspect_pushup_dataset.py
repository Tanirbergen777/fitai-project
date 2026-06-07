from pathlib import Path
from collections import defaultdict

try:
    import cv2
except ImportError:
    cv2 = None

ROOT = Path("ai_engine/datasets/pushup_raw")

VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def get_video_info(path: Path):
    if cv2 is None:
        return None

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        return None

    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    duration = frames / fps if fps > 0 else 0
    cap.release()

    return {
        "frames": frames,
        "fps": round(fps, 2),
        "width": width,
        "height": height,
        "duration_sec": round(duration, 2),
    }

def main():
    if not ROOT.exists():
        print(f"Dataset folder not found: {ROOT}")
        return

    files = [p for p in ROOT.rglob("*") if p.is_file()]
    videos = [p for p in files if p.suffix.lower() in VIDEO_EXTS]
    images = [p for p in files if p.suffix.lower() in IMAGE_EXTS]
    others = [p for p in files if p.suffix.lower() not in VIDEO_EXTS | IMAGE_EXTS]

    print("=" * 70)
    print("PUSH-UP DATASET INSPECTION")
    print("=" * 70)
    print(f"Root: {ROOT.resolve()}")
    print(f"Total files: {len(files)}")
    print(f"Videos: {len(videos)}")
    print(f"Images: {len(images)}")
    print(f"Other files: {len(others)}")

    print("\nFile extensions:")
    ext_counts = defaultdict(int)
    for p in files:
        ext_counts[p.suffix.lower() or "[no_ext]"] += 1

    for ext, count in sorted(ext_counts.items(), key=lambda x: x[0]):
        print(f"  {ext}: {count}")

    print("\nCounts by parent folder:")
    folder_counts = defaultdict(int)
    for p in files:
        folder_counts[str(p.parent.relative_to(ROOT))] += 1

    for folder, count in sorted(folder_counts.items(), key=lambda x: x[0]):
        print(f"  {folder}: {count}")

    print("\nFirst 30 files:")
    for p in files[:30]:
        print(f"  {p.relative_to(ROOT)}")

    if videos:
        print("\nVideo metadata sample:")
        for p in videos[:15]:
            info = get_video_info(p)
            print(f"  {p.relative_to(ROOT)}")
            print(f"    {info}")

    if cv2 is None:
        print("\nOpenCV not installed. Run:")
        print("  pip install opencv-python")

if __name__ == "__main__":
    main()