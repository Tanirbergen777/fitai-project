import re
import json

with open('frontend/src/components/workouts/AITrainingWorkout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r"t\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)", content)

extracted = {}
for key, val in matches:
    parts = key.split('.')
    curr = extracted
    for p in parts[:-1]:
        if p not in curr:
            curr[p] = {}
        curr = curr[p]
    curr[parts[-1]] = val

with open('extracted.json', 'w', encoding='utf-8') as f:
    json.dump(extracted, f, ensure_ascii=False, indent=2)

print("Extracted to extracted.json")
