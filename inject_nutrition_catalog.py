import os
import json
import re

# Update AINutritionPage.jsx
page_path = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\components\nutrition\AINutritionPage.jsx"
with open(page_path, "r", encoding="utf-8") as f:
    content = f.read()

reason_func = """
  const translateReason = (reasonStr) => {
    if (!reasonStr) return '';
    return reasonStr.split(',').map(r => {
      const trimmed = r.trim();
      switch(trimmed) {
        case 'подходит под цель': return t('nutrition.ai.reasons.goalOk', 'Мақсатқа сай');
        case 'подходит по времени': return t('nutrition.ai.reasons.timeOk', 'Уақытқа сай');
        case 'учтены предпочтения': return t('nutrition.ai.reasons.prefOk', 'Қалаулар ескерілді');
        case 'уже выбиралось сегодня': return t('nutrition.ai.reasons.alreadySelected', 'Бүгін таңдалған');
        case 'ml-рекомендация': return t('nutrition.ai.reasons.mlRec', 'ML ұсынысы');
        default: return trimmed;
      }
    }).join(', ');
  };
"""

if "translateReason" not in content:
    content = content.replace("const slotLabelMap = {", reason_func + "\n  const slotLabelMap = {")

# Replace `{food.name}` with `{t(\`nutrition.catalog.${food.id}.name\`, { defaultValue: food.name })}`
content = content.replace("<h3>{food.name}</h3>", "<h3>{t(`nutrition.catalog.${food.id}.name`, { defaultValue: food.name })}</h3>")
content = content.replace('<p className="nutrition-recipe">{food.recipe}</p>', '<p className="nutrition-recipe">{t(`nutrition.catalog.${food.id}.recipe`, { defaultValue: food.recipe })}</p>')
content = content.replace("{t('nutrition.ai.reasonLabel')}: {food.reason}", "{t('nutrition.ai.reasonLabel')}: {translateReason(food.reason)}")

with open(page_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update locales
locales_dir = r"C:\Users\alizh\PycharmProjects\FastAPIProject\frontend\src\locales"
files = {
    "ru": os.path.join(locales_dir, "ru.json"),
    "kaz": os.path.join(locales_dir, "kaz.json"),
    "en": os.path.join(locales_dir, "en.json")
}

translations = {
    "ru": {
        "goalOk": "Подходит под цель",
        "timeOk": "Подходит по времени",
        "prefOk": "Учтены предпочтения",
        "alreadySelected": "Уже выбиралось сегодня",
        "mlRec": "ML-рекомендация"
    },
    "kaz": {
        "goalOk": "Мақсатқа сай",
        "timeOk": "Уақытқа сай",
        "prefOk": "Қалаулар ескерілді",
        "alreadySelected": "Бүгін таңдалған",
        "mlRec": "ML ұсынысы"
    },
    "en": {
        "goalOk": "Fits your goal",
        "timeOk": "Fits meal time",
        "prefOk": "Preferences applied",
        "alreadySelected": "Already selected today",
        "mlRec": "ML recommendation"
    }
}

catalog = {
    "1": {"ru": ["Овсянка с бананом и орехами", "Свари овсянку, добавь банан и немного орехов."],
          "kaz": ["Банан мен жаңғақ қосылған сұлы ботқасы", "Сұлы ботқасын пісіріп, банан және аздап жаңғақ қос."],
          "en": ["Oatmeal with banana and nuts", "Boil oatmeal, add banana and some nuts."]},
    "2": {"ru": ["Омлет с овощами", "Приготовь омлет с овощами на сковороде."],
          "kaz": ["Көкөніс қосылған омлет", "Табада көкөніс қосылған омлет дайында."],
          "en": ["Omelet with vegetables", "Cook an omelet with vegetables in a pan."]},
    "3": {"ru": ["Творог с ягодами", "Смешай творог с ягодами без сахара."],
          "kaz": ["Жидек қосылған сүзбе", "Сүзбені қантсыз жидекпен араластыр."],
          "en": ["Cottage cheese with berries", "Mix cottage cheese with berries without sugar."]},
    "4": {"ru": ["Греческий йогурт с гранолой", "Смешай греческий йогурт и гранолу."],
          "kaz": ["Гранола қосылған грек йогурты", "Грек йогуртын граноламен араластыр."],
          "en": ["Greek yogurt with granola", "Mix Greek yogurt with granola."]},
    "5": {"ru": ["Овсянка с яблоком и корицей", "Свари овсянку и добавь яблоко с корицей."],
          "kaz": ["Алма мен даршын қосылған сұлы ботқасы", "Сұлы ботқасын пісіріп, алма мен даршын қос."],
          "en": ["Oatmeal with apple and cinnamon", "Boil oatmeal and add apple and cinnamon."]},
    "6": {"ru": ["Яичница с цельнозерновым хлебом", "Пожарь яйца и подай с цельнозерновым хлебом."],
          "kaz": ["Тұтас дәнді нанмен жұмыртқа", "Жұмыртқаны қуырып, тұтас дәнді нанмен ұсын."],
          "en": ["Fried eggs with whole grain bread", "Fry eggs and serve with whole grain bread."]},
    "7": {"ru": ["Сырники без сахара", "Сделай сырники из творога и подай без сахара."],
          "kaz": ["Қантсыз сырниктер", "Сүзбеден сырник жасап, қантсыз ұсын."],
          "en": ["Sugar-free syrniki", "Make cottage cheese pancakes (syrniki) and serve without sugar."]},
    "8": {"ru": ["Тост с авокадо и яйцом", "Поджарь хлеб, добавь авокадо и вареное яйцо."],
          "kaz": ["Авокадо мен жұмыртқа қосылған тост", "Нанды қуырып, авокадо мен пісірілген жұмыртқа қос."],
          "en": ["Avocado and egg toast", "Toast the bread, add avocado and a boiled egg."]},
    "9": {"ru": ["Пшенная каша с тыквой", "Свари пшено с кусочками тыквы."],
          "kaz": ["Асқабақ қосылған тары ботқасы", "Тарыны асқабақ кесектерімен пісір."],
          "en": ["Millet porridge with pumpkin", "Boil millet with pumpkin pieces."]},
    "10": {"ru": ["Омлет с сыром", "Приготовь омлет и добавь тертый сыр."],
          "kaz": ["Ірімшік қосылған омлет", "Омлет дайындап, үккіштен өткен ірімшік қос."],
          "en": ["Omelet with cheese", "Cook an omelet and add grated cheese."]},
    "11": {"ru": ["Рисовая каша с молоком", "Свари рисовую кашу на молоке."],
          "kaz": ["Сүтке піскен күріш ботқасы", "Күріш ботқасын сүтке пісір."],
          "en": ["Rice porridge with milk", "Boil rice porridge with milk."]},
    "12": {"ru": ["Йогурт с бананом и семенами", "Смешай йогурт, банан и семена."],
          "kaz": ["Банан мен тұқымдар қосылған йогурт", "Йогурт, банан және тұқымдарды араластыр."],
          "en": ["Yogurt with banana and seeds", "Mix yogurt, banana, and seeds."]},
    "13": {"ru": ["Творог с медом и орехами", "Добавь к творогу немного меда и орехов."],
          "kaz": ["Бал мен жаңғақ қосылған сүзбе", "Сүзбеге аздап бал мен жаңғақ қос."],
          "en": ["Cottage cheese with honey and nuts", "Add some honey and nuts to cottage cheese."]},
    "14": {"ru": ["Гречневая каша с яйцом", "Отвари гречку и подай с вареным яйцом."],
          "kaz": ["Жұмыртқа қосылған қарақұмық ботқасы", "Қарақұмықты пісіріп, пісірілген жұмыртқамен ұсын."],
          "en": ["Buckwheat porridge with egg", "Boil buckwheat and serve with a boiled egg."]},
    "15": {"ru": ["Рис с курицей", "Отвари рис и добавь приготовленную курицу."],
          "kaz": ["Күріш пен тауық еті", "Күрішті пісіріп, дайын тауық етін қос."],
          "en": ["Rice with chicken", "Boil rice and add cooked chicken."]},
    "16": {"ru": ["Гречка с индейкой", "Отвари гречку и подай с индейкой."],
          "kaz": ["Күркетауық қосылған қарақұмық", "Қарақұмықты пісіріп, күркетауықпен ұсын."],
          "en": ["Buckwheat with turkey", "Boil buckwheat and serve with turkey."]},
    "17": {"ru": ["Макароны с говядиной", "Отвари макароны и смешай с говядиной."],
          "kaz": ["Сиыр еті қосылған макарон", "Макаронды пісіріп, сиыр етімен араластыр."],
          "en": ["Pasta with beef", "Boil pasta and mix with beef."]},
    "18": {"ru": ["Салат с тунцом", "Смешай листья салата, овощи и тунец."],
          "kaz": ["Тунец қосылған салат", "Салат жапырақтарын, көкөністер мен тунецті араластыр."],
          "en": ["Tuna salad", "Mix lettuce, vegetables, and tuna."]},
    "19": {"ru": ["Лосось с овощами", "Запеки лосось и подай с овощами."],
          "kaz": ["Көкөніс қосылған лосось", "Лососьті пеште пісіріп, көкөністермен ұсын."],
          "en": ["Salmon with vegetables", "Bake salmon and serve with vegetables."]},
    "20": {"ru": ["Картофель с индейкой", "Запеки картофель и индейку в духовке."],
          "kaz": ["Күркетауық қосылған картоп", "Картоп пен күркетауықты пеште пісір."],
          "en": ["Potato with turkey", "Bake potato and turkey in the oven."]},
    "21": {"ru": ["Куриная грудка с брокколи", "Обжарь или запеки куриную грудку и подай с брокколи."],
          "kaz": ["Брокколи қосылған тауық төс еті", "Тауық төс етін қуырып немесе пеште пісіріп, брокколимен ұсын."],
          "en": ["Chicken breast with broccoli", "Fry or bake chicken breast and serve with broccoli."]},
    "22": {"ru": ["Булгур с курицей", "Отвари булгур и подай с курицей."],
          "kaz": ["Тауық еті қосылған булгур", "Булгурді пісіріп, тауық етімен ұсын."],
          "en": ["Bulgur with chicken", "Boil bulgur and serve with chicken."]},
    "23": {"ru": ["Плов с говядиной", "Приготовь плов с рисом и говядиной."],
          "kaz": ["Сиыр етінен палау", "Күріш пен сиыр етінен палау дайында."],
          "en": ["Beef pilaf", "Cook pilaf with rice and beef."]},
    "24": {"ru": ["Коричневый рис с овощами и курицей", "Смешай коричневый рис, овощи и курицу."],
          "kaz": ["Көкөніс пен тауық еті қосылған қоңыр күріш", "Қоңыр күріш, көкөніс және тауық етін араластыр."],
          "en": ["Brown rice with vegetables and chicken", "Mix brown rice, vegetables, and chicken."]},
    "25": {"ru": ["Филе индейки с киноа", "Запеки индейку и подай с киноа."],
          "kaz": ["Киноа қосылған күркетауық филесі", "Күркетауықты пеште пісіріп, киноамен ұсын."],
          "en": ["Turkey fillet with quinoa", "Bake turkey and serve with quinoa."]},
    "26": {"ru": ["Чечевица с курицей", "Свари чечевицу и подай с курицей."],
          "kaz": ["Тауық еті қосылған жасымық", "Жасымықты пісіріп, тауық етімен ұсын."],
          "en": ["Lentils with chicken", "Boil lentils and serve with chicken."]},
    "27": {"ru": ["Тушеная говядина с картофелем", "Потуши говядину и картофель вместе."],
          "kaz": ["Картоппен бұқтырылған сиыр еті", "Сиыр еті мен картопты бірге бұқтыр."],
          "en": ["Stewed beef with potato", "Stew beef and potato together."]},
    "28": {"ru": ["Рыба с гречкой", "Запеки рыбу и подай с гречкой."],
          "kaz": ["Қарақұмық қосылған балық", "Балықты пеште пісіріп, қарақұмықпен ұсын."],
          "en": ["Fish with buckwheat", "Bake fish and serve with buckwheat."]},
    "29": {"ru": ["Паста с курицей и томатным соусом", "Смешай пасту, курицу и томатный соус."],
          "kaz": ["Тауық еті мен томат соусы қосылған паста", "Паста, тауық еті және томат соусын араластыр."],
          "en": ["Pasta with chicken and tomato sauce", "Mix pasta, chicken, and tomato sauce."]},
    "30": {"ru": ["Курица с салатом", "Запеки курицу и подай с овощным салатом."],
          "kaz": ["Салатпен тауық еті", "Тауық етін пеште пісіріп, көкөніс салатымен ұсын."],
          "en": ["Chicken with salad", "Bake chicken and serve with vegetable salad."]},
    "31": {"ru": ["Запеченная треска с овощами", "Запеки треску и овощи в духовке."],
          "kaz": ["Көкөніспен пеште пісірілген треска", "Треска мен көкөністерді пеште пісір."],
          "en": ["Baked cod with vegetables", "Bake cod and vegetables in the oven."]},
    "32": {"ru": ["Котлеты из индейки с рисом", "Приготовь котлеты из индейки и подай с рисом."],
          "kaz": ["Күрішпен күркетауық котлеттері", "Күркетауық котлеттерін дайындап, күрішпен ұсын."],
          "en": ["Turkey cutlets with rice", "Cook turkey cutlets and serve with rice."]},
    "33": {"ru": ["Курица терияки с рисом", "Приготовь курицу терияки и подай с рисом."],
          "kaz": ["Күрішпен терияки тауық еті", "Терияки тауық етін дайындап, күрішпен ұсын."],
          "en": ["Teriyaki chicken with rice", "Cook teriyaki chicken and serve with rice."]},
    "34": {"ru": ["Рагу из индейки и овощей", "Потуши индейку и овощи."],
          "kaz": ["Күркетауық пен көкөніс рагуы", "Күркетауық пен көкөністерді бұқтыр."],
          "en": ["Turkey and vegetable stew", "Stew turkey and vegetables."]},
    "35": {"ru": ["Чечевичный суп с курицей", "Приготовь чечевичный суп и добавь курицу."],
          "kaz": ["Тауық еті қосылған жасымық сорпасы", "Жасымық сорпасын дайындап, тауық етін қос."],
          "en": ["Lentil soup with chicken", "Cook lentil soup and add chicken."]},
    "36": {"ru": ["Овощной суп с говядиной", "Свари овощной суп и добавь кусочки говядины."],
          "kaz": ["Сиыр еті қосылған көкөніс сорпасы", "Көкөніс сорпасын пісіріп, сиыр еті кесектерін қос."],
          "en": ["Vegetable soup with beef", "Boil vegetable soup and add beef pieces."]},
    "37": {"ru": ["Говядина с булгуром", "Обжарь говядину и подай с булгуром."],
          "kaz": ["Булгур қосылған сиыр еті", "Сиыр етін қуырып, булгурмен ұсын."],
          "en": ["Beef with bulgur", "Fry beef and serve with bulgur."]},
    "38": {"ru": ["Курица карри с рисом", "Приготовь курицу карри и подай с рисом."],
          "kaz": ["Күрішпен карри тауық еті", "Карри тауық етін дайындап, күрішпен ұсын."],
          "en": ["Curry chicken with rice", "Cook curry chicken and serve with rice."]},
    "39": {"ru": ["Запеченная скумбрия с овощами", "Запеки скумбрию с овощами."],
          "kaz": ["Көкөніспен пеште пісірілген скумбрия", "Скумбрияны көкөністермен пеште пісір."],
          "en": ["Baked mackerel with vegetables", "Bake mackerel with vegetables."]},
    "40": {"ru": ["Фасоль с индейкой", "Потуши фасоль с индейкой."],
          "kaz": ["Күркетауық қосылған үрме бұршақ", "Үрме бұршақты күркетауықпен бұқтыр."],
          "en": ["Beans with turkey", "Stew beans with turkey."]},
    "41": {"ru": ["Куриная грудка с киноа и овощами", "Запеки курицу и подай с киноа и овощами."],
          "kaz": ["Киноа мен көкөніс қосылған тауық төс еті", "Тауық етін пеште пісіріп, киноа мен көкөністермен ұсын."],
          "en": ["Chicken breast with quinoa and vegetables", "Bake chicken and serve with quinoa and vegetables."]},
    "42": {"ru": ["Рис с омлетом и овощами", "Сделай рис, омлет и добавь овощи."],
          "kaz": ["Омлет пен көкөніс қосылған күріш", "Күріш, омлет жасап, көкөніс қос."],
          "en": ["Rice with omelet and vegetables", "Make rice, omelet, and add vegetables."]},
    "43": {"ru": ["Йогурт и яблоко", "Возьми натуральный йогурт и яблоко."],
          "kaz": ["Йогурт және алма", "Табиғи йогурт пен алма ал."],
          "en": ["Yogurt and apple", "Take natural yogurt and an apple."]},
    "44": {"ru": ["Бутерброд с арахисовой пастой и бананом", "Намажь арахисовую пасту на хлеб и добавь банан."],
          "kaz": ["Жержаңғақ пастасы мен банан қосылған бутерброд", "Нанға жержаңғақ пастасын жағып, банан қос."],
          "en": ["Peanut butter and banana sandwich", "Spread peanut butter on bread and add banana."]},
    "45": {"ru": ["Кефир и хлебцы", "Добавь к кефиру 2–3 хлебца."],
          "kaz": ["Айран мен нан қытырлақтары", "Айранға 2-3 нан қытырлағын қос."],
          "en": ["Kefir and crispbreads", "Add 2-3 crispbreads to kefir."]},
    "46": {"ru": ["Протеиновый коктейль", "Смешай протеин с молоком или водой."],
          "kaz": ["Протеин коктейлі", "Протеинді сүтпен немесе сумен араластыр."],
          "en": ["Protein shake", "Mix protein with milk or water."]},
    "47": {"ru": ["Орехи и сухофрукты", "Смешай орехи и немного сухофруктов."],
          "kaz": ["Жаңғақтар мен кептірілген жемістер", "Жаңғақтар мен аздап кептірілген жемістерді араластыр."],
          "en": ["Nuts and dried fruits", "Mix nuts and some dried fruits."]},
    "48": {"ru": ["Творожный мусс", "Взбей творог до мягкой текстуры."],
          "kaz": ["Сүзбе муссы", "Сүзбені жұмсақ құрылымға дейін көпірт."],
          "en": ["Cottage cheese mousse", "Whip cottage cheese to a soft texture."]},
    "49": {"ru": ["Смузи с бананом и йогуртом", "Взбей банан и йогурт в блендере."],
          "kaz": ["Банан мен йогурт қосылған смузи", "Блендерде банан мен йогуртты көпірт."],
          "en": ["Smoothie with banana and yogurt", "Blend banana and yogurt in a blender."]},
    "50": {"ru": ["Хумус с овощными палочками", "Подавай хумус с морковью и огурцом."],
          "kaz": ["Көкөніс таяқшалары қосылған хумус", "Хумусты сәбіз және қиярмен ұсын."],
          "en": ["Hummus with vegetable sticks", "Serve hummus with carrot and cucumber."]},
    "51": {"ru": ["Сэндвич с индейкой", "Сделай сэндвич с индейкой и овощами."],
          "kaz": ["Күркетауық қосылған сэндвич", "Күркетауық пен көкөністерден сэндвич жаса."],
          "en": ["Turkey sandwich", "Make a sandwich with turkey and vegetables."]},
    "52": {"ru": ["Яблоко и арахисовая паста", "Нарежь яблоко и добавь немного арахисовой пасты."],
          "kaz": ["Алма мен жержаңғақ пастасы", "Алманы турап, аздап жержаңғақ пастасын қос."],
          "en": ["Apple and peanut butter", "Slice an apple and add some peanut butter."]},
    "53": {"ru": ["Банан и творог", "Смешай творог и кусочки банана."],
          "kaz": ["Банан және сүзбе", "Сүзбе мен банан кесектерін араластыр."],
          "en": ["Banana and cottage cheese", "Mix cottage cheese and banana pieces."]},
    "54": {"ru": ["Протеиновый батончик", "Возьми готовый протеиновый батончик."],
          "kaz": ["Протеин батончигі", "Дайын протеин батончигін ал."],
          "en": ["Protein bar", "Take a ready-made protein bar."]},
    "55": {"ru": ["Груша и греческий йогурт", "Подавай грушу с греческим йогуртом."],
          "kaz": ["Алмұрт және грек йогурты", "Алмұртты грек йогуртымен ұсын."],
          "en": ["Pear and Greek yogurt", "Serve pear with Greek yogurt."]},
    "56": {"ru": ["Хлебцы с творожным сыром", "Намажь творожный сыр на хлебцы."],
          "kaz": ["Сүзбе ірімшігі жағылған нан қытырлақтары", "Нан қытырлақтарына сүзбе ірімшігін жақ."],
          "en": ["Crispbreads with cream cheese", "Spread cream cheese on crispbreads."]},
    "57": {"ru": ["Кефир перед сном", "Выпей стакан кефира."],
          "kaz": ["Ұйқы алдындағы айран", "Бір стақан айран іш."],
          "en": ["Kefir before bed", "Drink a glass of kefir."]},
    "58": {"ru": ["Творог перед сном", "Съешь порцию творога без сахара."],
          "kaz": ["Ұйқы алдындағы сүзбе", "Қантсыз сүзбе порциясын же."],
          "en": ["Cottage cheese before bed", "Eat a portion of cottage cheese without sugar."]},
    "59": {"ru": ["Омлет из белков", "Сделай легкий омлет из яичных белков."],
          "kaz": ["Ақуыздан жасалған омлет", "Жұмыртқа ақуызынан жеңіл омлет жаса."],
          "en": ["Egg white omelet", "Make a light omelet from egg whites."]},
    "60": {"ru": ["Йогурт без сахара", "Возьми натуральный йогурт без сахара."],
          "kaz": ["Қантсыз йогурт", "Қантсыз табиғи йогурт ал."],
          "en": ["Sugar-free yogurt", "Take natural yogurt without sugar."]},
    "61": {"ru": ["Легкий салат с курицей", "Сделай легкий салат с зеленью и курицей."],
          "kaz": ["Тауық етінен жеңіл салат", "Көкөністер мен тауық етінен жеңіл салат жаса."],
          "en": ["Light chicken salad", "Make a light salad with greens and chicken."]}
}

for lang, filepath in files.items():
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "nutrition" not in data:
            data["nutrition"] = {}
        if "ai" not in data["nutrition"]:
            data["nutrition"]["ai"] = {}
        
        data["nutrition"]["ai"]["reasons"] = translations[lang]
        
        if "catalog" not in data["nutrition"]:
            data["nutrition"]["catalog"] = {}
            
        for cid, t_data in catalog.items():
            data["nutrition"]["catalog"][cid] = {
                "name": t_data[lang][0],
                "recipe": t_data[lang][1]
            }
            
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Injected translations and updated AINutritionPage successfully!")
