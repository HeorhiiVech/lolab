import pandas as pd
import glob

# Список всех твоих CSV-файлов с данными турниров
# Просто добавляй сюда новые имена файлов, когда они появятся
tournament_files = {
    'LCK': 'LCK 2025.csv',
    'LEC': 'LEC 2025.csv',  # Пример для нового турнира
    # 'LPL': 'LPL 2025.csv', # Можешь добавлять еще
}

# Создаем пустой список, куда будем складывать данные
all_data = []

# Проходим по каждому файлу в нашем списке
for tournament_name, file_name in tournament_files.items():
    try:
        # 1. Загружаем CSV
        df = pd.read_csv(file_name)

        # 2. Добавляем колонку 'Tournament'
        df['Tournament'] = tournament_name

        # 3. Добавляем данные в общий список
        all_data.append(df)
        print(f"Файл '{file_name}' успешно обработан.")
    except FileNotFoundError:
        print(f"ПРЕДУПРЕЖДЕНИЕ: Файл '{file_name}' не найден и будет пропущен.")

# Объединяем данные из всех файлов в одну большую таблицу
combined_df = pd.concat(all_data, ignore_index=True)

# "Чистим" объединенные данные (удаляем GP < 2 и дубликаты)
combined_df = combined_df[combined_df['GP'] >= 2]
combined_df = combined_df.sort_values('GP', ascending=False).drop_duplicates(subset='Player', keep='first')

# Сохраняем итоговый JSON-файл
combined_df.to_json('src/data/pro_data.json', orient='records', force_ascii=False)

print("\nВсе данные объединены, очищены и сохранены в 'pro_data.json'!")