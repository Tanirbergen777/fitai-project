import os
import json

locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"
files = {
    "ru": os.path.join(locales_dir, "ru.json"),
    "kaz": os.path.join(locales_dir, "kaz.json"),
    "en": os.path.join(locales_dir, "en.json")
}

translations = {
    "ru": {
        "chooseTitle": "Что вы хотите сделать с этим блюдом?",
        "goCafe": "Пойти в ближайшую кафешку",
        "goCafeText": "Откроем поиск этого блюда в Яндекс Картах.",
        "cookMyself": "Приготовить сам",
        "cookMyselfText": "Покажем рецепт, продукты и YouTube-видео.",
        "cookSubtitle": "Рецепт, продукты и шаги приготовления",
        "ingredients": "Продукты",
        "steps": "Как готовить",
        "openYoutube": "Открыть YouTube",
        "buySubtitle": "Откроем Яндекс Карты с поиском ближайших мест по этому блюду",
        "buyText": "Сейчас откроется поиск по Яндекс Картам. Дальше пользователь сможет выбрать удобную точку, посмотреть варианты и маршрут.",
        "openYandex": "Открыть Яндекс Карты",
        "fallback": {
            "ingredients": {
                "main": "Основной продукт блюда",
                "extra1": "Дополнительные ингредиенты по вкусу",
                "extra2": "Специи и добавки"
            },
            "recipe": "Используй описание блюда как основу приготовления.",
            "step2": "Подготовь ингредиенты и собери блюдо пошагово."
        }
    },
    "kaz": {
        "chooseTitle": "Бұл тағаммен не істегіңіз келеді?",
        "goCafe": "Жақын маңдағы дәмханаға бару",
        "goCafeText": "Яндекс Картадан осы тағамды табуға көмектесеміз.",
        "cookMyself": "Өзім дайындаймын",
        "cookMyselfText": "Рецепт, құрамы және YouTube-видеосын көрсетеміз.",
        "cookSubtitle": "Рецепт, құрамы және дайындау қадамдары",
        "ingredients": "Құрамы (Азық-түлік)",
        "steps": "Қалай дайындаймыз",
        "openYoutube": "YouTube-ті ашу",
        "buySubtitle": "Осы тағамды ұсынатын жақын маңдағы орындарды Яндекс Картадан ашамыз",
        "buyText": "Қазір Яндекс Картадан іздеу ашылады. Сіз өзіңізге ыңғайлы орынды таңдап, бағытты көре аласыз.",
        "openYandex": "Яндекс Картаны ашу",
        "fallback": {
            "ingredients": {
                "main": "Тағамның негізгі өнімі",
                "extra1": "Қалауыңыз бойынша қосымша ингредиенттер",
                "extra2": "Дәмдеуіштер мен қоспалар"
            },
            "recipe": "Тағамның сипаттамасын дайындау негізі ретінде қолданыңыз.",
            "step2": "Ингредиенттерді дайындап, тағамды қадам бойынша жасаңыз."
        }
    },
    "en": {
        "chooseTitle": "What would you like to do with this dish?",
        "goCafe": "Go to a nearby cafe",
        "goCafeText": "We will open a search for this dish on Yandex Maps.",
        "cookMyself": "Cook it myself",
        "cookMyselfText": "We will show you the recipe, ingredients, and a YouTube video.",
        "cookSubtitle": "Recipe, ingredients, and preparation steps",
        "ingredients": "Ingredients",
        "steps": "How to cook",
        "openYoutube": "Open YouTube",
        "buySubtitle": "We will open Yandex Maps to search for nearby places with this dish",
        "buyText": "A search on Yandex Maps will open now. You can choose a convenient place, check options, and see the route.",
        "openYandex": "Open Yandex Maps",
        "fallback": {
            "ingredients": {
                "main": "Main ingredient of the dish",
                "extra1": "Additional ingredients to taste",
                "extra2": "Spices and add-ins"
            },
            "recipe": "Use the dish description as a basis for cooking.",
            "step2": "Prepare the ingredients and assemble the dish step by step."
        }
    }
}

for lang, filepath in files.items():
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "nutrition" not in data:
            data["nutrition"] = {}
        
        if "foodAction" not in data["nutrition"]:
            data["nutrition"]["foodAction"] = {}
            
        # Update the dictionary
        data["nutrition"]["foodAction"].update(translations[lang])
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Translation files updated successfully.")
