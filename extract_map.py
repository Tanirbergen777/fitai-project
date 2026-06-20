import re
import json

files = [
    'frontend/src/components/workouts/MassGainWorkout.jsx',
    'frontend/src/components/workouts/LoseWeightWorkout.jsx',
    'frontend/src/components/workouts/GeneralWorkout.jsx'
]

mapping = {}

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r"key:\s*'([^']+)',\s*video:\s*'([^']+)'", content)
        for key, video in matches:
            mapping[video] = key

print('Found', len(mapping), 'mappings')
with open('mapping.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2)
