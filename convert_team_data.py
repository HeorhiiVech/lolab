import pandas as pd

# Словарь, где ключ - название турнира, а значение - имя файла
TOURNAMENT_FILES = {
    'LEC': 'LEC 2025 Summer - Team Stats.csv',
    'LCK': 'LCK 2025 Rounds 3-5 - Team Stats.csv',
    'LPL': 'LPL 2025 Split 3 - Team Stats.csv'
}

# Определяем нужные колонки для каждого типа турнира
LEC_LCK_COLS = [
    'Team', 'KD', 'GSPD', 'EGR', 'MLR', 'GD15', 'FB%', 'FT%', 
    'F3T%', 'PPG', 'HLD%', 'GRB%', 'FD%', 'FBN%', 'LNE%', 'JNG%', 'WPM'
]
LPL_COLS = [
    'Team', 'KD', 'GSPD', 'FB%', 'FT%', 'HLD%', 'GRB%', 'FD%', 
    'LNE%', 'JNG%', 'WPM'
]

all_teams_data = []

print("Начинаю обработку файлов статистики команд...")

for tournament, filename in TOURNAMENT_FILES.items():
    try:
        df = pd.read_csv(filename)
        print(f"Файл '{filename}' успешно загружен.")
        
        # --- ВАЖНОЕ ИСПРАВЛЕНИЕ: ДОБАВЛЯЕМ КОЛОНКУ 'Tournament' ---
        df['Tournament'] = tournament
        
        # Выбираем нужные колонки в зависимости от турнира
        if tournament in ['LEC', 'LCK']:
            # Добавляем 'Tournament' в список обязательных колонок
            required_cols = ['Tournament'] + LEC_LCK_COLS
            if all(col in df.columns for col in LEC_LCK_COLS):
                df_filtered = df[required_cols]
                all_teams_data.append(df_filtered)
                print(f"-> Обработано {len(df_filtered)} команд из {tournament}.")
            else:
                missing_cols = [col for col in LEC_LCK_COLS if col not in df.columns]
                print(f"ПРЕДУПРЕЖДЕНИЕ: В файле для {tournament} отсутствуют колонки: {missing_cols}. Файл пропущен.")

        elif tournament == 'LPL':
            # Добавляем 'Tournament' в список обязательных колонок
            required_cols = ['Tournament'] + LPL_COLS
            if all(col in df.columns for col in LPL_COLS):
                df_filtered = df[required_cols]
                all_teams_data.append(df_filtered)
                print(f"-> Обработано {len(df_filtered)} команд из {tournament}.")
            else:
                missing_cols = [col for col in LPL_COLS if col not in df.columns]
                print(f"ПРЕДУПРЕЖДЕНИЕ: В файле для {tournament} отсутствуют колонки: {missing_cols}. Файл пропущен.")

    except FileNotFoundError:
        print(f"ОШИБКА: Файл '{filename}' не найден.")
    except Exception as e:
        print(f"Произошла ошибка при обработке файла '{filename}': {e}")

if all_teams_data:
    final_df = pd.concat(all_teams_data, ignore_index=True)
    final_df = final_df.where(pd.notna(final_df), None)
    final_df.to_json('src/data/team_data.json', orient='records', force_ascii=False)
    print("\nВсе данные команд успешно объединены и сохранены в 'src/data/team_data.json'!")
else:
    print("\nНе было обработано ни одного файла. Итоговый JSON не создан.")