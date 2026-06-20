import os

components_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\nutrition"
files_to_fix = [
    os.path.join(components_dir, "MassGainNutrition.jsx"),
    os.path.join(components_dir, "LoseWeightNutrition.jsx")
]

for file_path in files_to_fix:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # We need to clear selectedFoodMessage when language changes
        if "i18n.language" not in content and "useTranslation()" in content:
            # First, add i18n to useTranslation
            content = content.replace("const { t } = useTranslation();", "const { t, i18n } = useTranslation();")
            
            # Then, add a useEffect to clear the message when language changes
            use_effect_code = """
  useEffect(() => {
    setSelectedFoodMessage('');
  }, [i18n.language]);
"""
            # Insert right after the useState definitions
            content = content.replace(
                "const [todayHistory, setTodayHistory] = useState([]);",
                "const [todayHistory, setTodayHistory] = useState([]);\n" + use_effect_code
            )
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
                print(f"Fixed {file_path}")

print("Fixed state caching bugs on language switch.")
