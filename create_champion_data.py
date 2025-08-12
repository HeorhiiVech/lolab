import os
import json

# Путь к папке с файлами чемпионов
champions_folder_path = 'champions'
# Куда сохранить итоговый файл
output_file_path = 'src/data/all_champions.json'

all_champions_data = {}
version = "15.15.1" # Версия по умолчанию, если что-то пойдет не так

# --- Улучшение: Автоматически определяем версию ---
first_file_processed = False
for filename in os.listdir(champions_folder_path):
    if filename.endswith('.json'):
        # Берем версию из первого попавшегося файла
        if not first_file_processed:
            with open(os.path.join(champions_folder_path, filename), 'r', encoding='utf-8') as f:
                content = json.load(f)
                version = content.get('version', version)
                first_file_processed = True
        
        # Обрабатываем данные чемпиона
        with open(os.path.join(champions_folder_path, filename), 'r', encoding='utf-8') as f:
            champion_file_content = json.load(f)
            for champ_id, champ_data in champion_file_content.get('data', {}).items():
                all_champions_data[champ_id] = {
                    'id': champ_data['id'],
                    'name': champ_data['name'],
                    'image': champ_data['image'],
                    'tags': champ_data['tags'] # <--- ДОБАВЛЕНА ЭТА СТРОКА
                }

# Сохраняем данные и версию вместе
output_data = {
    "version": version,
    "data": all_champions_data
}

# Создаем директорию, если она не существует
os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=4)

print(f"Файл '{output_file_path}' успешно создан с версией {version}!")