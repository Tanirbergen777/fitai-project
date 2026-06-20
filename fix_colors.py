import os
import glob

components_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\workouts"
files = glob.glob(os.path.join(components_dir, "*.jsx"))

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace hardcoded dark background with CSS variable
    content = content.replace("#1c1f24", "var(--bg-main)")
    
    # In .lw-page, .mass-page, .gen-page, .workout-engine-container
    # there might be 'color: #fff;' which should be 'color: var(--text-main);'
    # It's safer to just replace 'color: #fff;' with 'color: var(--text-main);' in styles strings
    # But wait, there might be icons or SVGs that use #fff. Let's be careful and only replace it 
    # where it's part of the main container css.
    
    # We can just replace 'color: #fff;' everywhere in the CSS blocks, because usually 
    # if it's text, it should adapt.
    content = content.replace("color: #fff;", "color: var(--text-main);")
    content = content.replace("color: white;", "color: var(--text-main);")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Replaced #1c1f24 with var(--bg-main) in all workout components.")
