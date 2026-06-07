from pathlib import Path
import json
import numpy as np
import pandas as pd

ROOT = Path("ai_engine/datasets/rehab24_raw/3d_joints/Ex5")
SEG_PATH = Path("ai_engine/datasets/rehab24_raw/lunge_segmentation_ex5.csv")

def preview_text(path: Path, max_lines=5):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return [next(f).rstrip("\n") for _ in range(max_lines)]
    except StopIteration:
        return []
    except Exception as e:
        return [f"[cannot read text: {e}]"]

def inspect_npy(path: Path):
    try:
        arr = np.load(path, allow_pickle=True)
        info = {
            "type": type(arr).__name__,
            "shape": getattr(arr, "shape", None),
            "dtype": str(getattr(arr, "dtype", None)),
        }
        if isinstance(arr, np.ndarray) and arr.size > 0:
            flat = arr.reshape(-1)[:10]
            info["sample"] = [str(x) for x in flat]
        return info
    except Exception as e:
        return {"error": str(e)}

def inspect_csv(path: Path):
    try:
        # Try common separators
        for sep in [",", ";", "\t", " "]:
            try:
                df = pd.read_csv(path, sep=sep, nrows=5)
                if len(df.columns) > 1:
                    return {
                        "sep": sep,
                        "columns": list(df.columns),
                        "head": df.head().to_dict(orient="records"),
                    }
            except Exception:
                pass

        df = pd.read_csv(path, nrows=5, header=None)
        return {
            "sep": "unknown",
            "columns": list(df.columns),
            "head": df.head().to_dict(orient="records"),
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    if not ROOT.exists():
        raise SystemExit(f"Folder not found: {ROOT}")

    files = [p for p in ROOT.rglob("*") if p.is_file()]

    print("=" * 90)
    print("REHAB24-6 EX5 3D JOINTS INSPECTION")
    print("=" * 90)
    print(f"Root: {ROOT.resolve()}")
    print(f"Files: {len(files)}")

    ext_counts = {}
    for p in files:
        ext_counts[p.suffix.lower() or "[no_ext]"] = ext_counts.get(p.suffix.lower() or "[no_ext]", 0) + 1

    print("\nExtensions:")
    for ext, count in sorted(ext_counts.items()):
        print(f"  {ext}: {count}")

    folder_counts = {}
    for p in files:
        folder = str(p.parent.relative_to(ROOT))
        folder_counts[folder] = folder_counts.get(folder, 0) + 1

    print("\nFolders:")
    for folder, count in sorted(folder_counts.items())[:80]:
        print(f"  {folder}: {count}")

    print("\nFirst 50 files:")
    for p in files[:50]:
        print(f"  {p.relative_to(ROOT)}  size={p.stat().st_size}")

    if SEG_PATH.exists():
        seg = pd.read_csv(SEG_PATH)
        print("\nSegmentation Ex5 loaded:")
        print(f"  rows: {len(seg)}")
        print(f"  video ids: {sorted(seg['video_id'].astype(str).unique().tolist())}")
        print("\nExpected lunge video_id files:")
        for vid in sorted(seg["video_id"].astype(str).unique().tolist()):
            matches = [p for p in files if vid.lower() in p.name.lower() or vid.lower() in str(p).lower()]
            print(f"  {vid}: matches={len(matches)}")
            for m in matches[:5]:
                print(f"    - {m.relative_to(ROOT)}")
    else:
        print(f"\nSegmentation file not found: {SEG_PATH}")

    print("\nSample file inspection:")
    for p in files[:10]:
        print("\n" + "-" * 70)
        print(f"File: {p.relative_to(ROOT)}")
        print(f"Size: {p.stat().st_size}")

        ext = p.suffix.lower()
        if ext == ".npy":
            print(json.dumps(inspect_npy(p), ensure_ascii=False, indent=2, default=str))
        elif ext in {".csv", ".txt", ".tsv"}:
            if ext == ".csv":
                print(json.dumps(inspect_csv(p), ensure_ascii=False, indent=2, default=str))
            else:
                for line in preview_text(p):
                    print(line)
        else:
            print("No preview for this file type.")

if __name__ == "__main__":
    main()