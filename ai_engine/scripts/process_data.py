import pandas as pd
import os

# Настраиваем пути, чтобы скрипт всегда находил файлы
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Путь к сырым данным (XPT файлы)
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
# Путь, куда сохраним готовый CSV
SAVE_DIR = os.path.join(BASE_DIR, "..", "datasets")


def merge_medical_data():
    print("🚀 Запуск сборки данных NHANES...")

    # Создаем папку для датасетов, если её еще нет
    os.makedirs(SAVE_DIR, exist_ok=True)

    try:
        # 1. Загружаем 3 основных файла из ai_engine/data/
        print("📥 Чтение файлов DEMO, BMX и DR1TOT...")
        demo = pd.read_sas(os.path.join(DATA_DIR, 'DEMO_J.XPT'))
        body = pd.read_sas(os.path.join(DATA_DIR, 'BMX_J.XPT'))
        diet = pd.read_sas(os.path.join(DATA_DIR, 'DR1TOT_J.XPT'))

        # 2. Склеиваем их по ID (SEQN)
        # how='inner' означает, что мы оставим только тех людей, которые есть во всех трех файлах
        df = pd.merge(demo, body, on='SEQN', how='inner')
        df = pd.merge(df, diet, on='SEQN', how='inner')

        # 3. Отбираем колонки для "Ультра-модели"
        # RIDAGEYR(Возраст), RIAGENDR(Пол), BMXWT(Вес), BMXHT(Рост),
        # BMXWAIST(Талия), BMXHIP(Бедра), BMXARMC(Обхват руки), DR1TKCAL(Калории)
        cols = ['RIDAGEYR', 'RIAGENDR', 'BMXWT', 'BMXHT', 'BMXWAIST', 'BMXHIP', 'BMXARMC', 'DR1TKCAL']

        final_df = df[cols].copy()

        # 4. Чистим данные от пустых строк (NaN)
        final_df = final_df.dropna()

        # 5. Сохраняем результат для обучения
        save_path = os.path.join(SAVE_DIR, "ultra_fitness_data.csv")
        final_df.to_csv(save_path, index=False)

        print(f"✅ Готово! Собрано полных профилей: {len(final_df)}")
        print(f"📁 Файл создан: {save_path}")

    except FileNotFoundError:
        print(f"❌ Ошибка: Файлы не найдены в {DATA_DIR}. Проверь названия!")
    except Exception as e:
        print(f"❌ Ошибка в процессе: {e}")


if __name__ == "__main__":
    merge_medical_data()