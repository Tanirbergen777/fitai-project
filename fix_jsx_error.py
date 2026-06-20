import os

file_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\EditProfileModal.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I accidentally replaced "ккал</strong>)" with "{t('profile.editModal.kcal')}"
# So the <strong> was never closed!
# Let's fix this by finding "{t('profile.editModal.kcal')}" and appending "</strong>" if it's not followed by "</strong>"

# We have two instances of this in the file (one for good verdict, one for bad verdict)
content = content.replace("{t('profile.editModal.kcal')}\n", "{t('profile.editModal.kcal')}</strong>\n")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed JSX syntax error in EditProfileModal.jsx")
