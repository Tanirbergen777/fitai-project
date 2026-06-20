import json

with open('mapping.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

map_str = "const videoPathMap = {\n"
for k, v in mapping.items():
    map_str += f"  '{k}': '{v}',\n"
map_str += "};\n"

with open('frontend/src/components/workouts/AITrainingWorkout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'const videoPathMap' not in content:
    content = content.replace('const AITrainingWorkout =', map_str + '\nconst AITrainingWorkout =')

old_logic = """
      const genEx = backendMlResult.generated_exercises.map((ex, i) => ({
        key: `ai_gen_${i}`,
        name: ex.name,
        description: ex.description,
        reps: ex.dynamic_reps,
        workSeconds: ex.workSeconds || 30,
        restSeconds: ex.restSeconds || ex.rest_seconds || 30,
        mediaUrl: ex.video_path ? getVideoUrl(ex.video_path) : null,
        cameraMode: null
      }));
"""

new_logic = """
      const genEx = backendMlResult.generated_exercises.map((ex, i) => {
        let name = ex.name;
        let description = ex.description;
        
        if (ex.video_path && videoPathMap[ex.video_path]) {
          const cat = ex.video_path.split('/')[0];
          const key = videoPathMap[ex.video_path];
          const transName = t(`training.${cat}.${key}.title`);
          const transDesc = t(`training.${cat}.${key}.desc`);
          
          if (transName && !transName.includes('training.')) name = transName;
          if (transDesc && !transDesc.includes('training.')) description = transDesc;
        }

        return {
          key: `ai_gen_${i}`,
          name: name,
          description: description,
          reps: ex.dynamic_reps,
          workSeconds: ex.workSeconds || 30,
          restSeconds: ex.restSeconds || ex.rest_seconds || 30,
          mediaUrl: ex.video_path ? getVideoUrl(ex.video_path) : null,
          cameraMode: null
        };
      });
"""

content = content.replace(old_logic.strip(), new_logic.strip())

with open('frontend/src/components/workouts/AITrainingWorkout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected videoPathMap and translation logic successfully")
