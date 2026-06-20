import os
import json
import re

frontend_src = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src"

def remove_ai_block(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r"\s*<div style=\{styles\.futureAiBlock\}>.*?<div style=\{styles\.futureAiList\}>.*?</div>\s*</div>"
    
    new_content = re.sub(pattern, "", content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Remove from EnergyPage and FocusPage
remove_ai_block(os.path.join(frontend_src, "components", "knowledge", "EnergyPage.jsx"))
remove_ai_block(os.path.join(frontend_src, "components", "knowledge", "FocusPage.jsx"))

# Update locales
locales_dir = os.path.join(frontend_src, "locales")
kaz_path = os.path.join(locales_dir, "kaz.json")
ru_path = os.path.join(locales_dir, "ru.json")
en_path = os.path.join(locales_dir, "en.json")

def update_video_subtitle(filepath, lang):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if "knowledgeModule" in data and "videos" in data["knowledgeModule"]:
        if lang == "kaz":
            data["knowledgeModule"]["videos"]["subtitle"] = "Қызықты әрі пайдалы бейнероликтер тізімі"
        elif lang == "ru":
            data["knowledgeModule"]["videos"]["subtitle"] = "Список интересных и полезных видеороликов"
        elif lang == "en":
            data["knowledgeModule"]["videos"]["subtitle"] = "List of interesting and useful videos"
            
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

update_video_subtitle(kaz_path, "kaz")
update_video_subtitle(ru_path, "ru")
update_video_subtitle(en_path, "en")

print("Fixed UI blocks and locales successfully!")
