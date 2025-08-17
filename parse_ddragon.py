import requests
import json
import os

# --- Шаг 1: Найти последнюю версию игры ---
try:
    versions_url = "https://ddragon.leagueoflegends.com/api/versions.json"
    versions = requests.get(versions_url).json()
    latest_version = versions[0]
    print(f"✅ Найдена последняя версия игры: {latest_version}")
except Exception as e:
    print(f"❌ Не удалось получить последнюю версию игры: {e}")
    exit()

# --- Шаг 2: Создать папку для данных ---
output_dir = "src/data" # Сразу создаем в папке src/data вашего проекта
os.makedirs(output_dir, exist_ok=True)

# --- Шаг 3: Скачать и обработать данные по предметам ---
items_url = f"http://ddragon.leagueoflegends.com/cdn/{latest_version}/data/ru_RU/item.json"
print("🔄 Загрузка и обработка данных по предметам...")

try:
    response = requests.get(items_url)
    response.raise_for_status()
    all_items_data = response.json()['data']

    filtered_items = []
    for item_id, item_details in all_items_data.items():
        # --- Критерии фильтрации ---
        # 1. Предмет доступен на карте "Ущелье Призывателей" (map '11')
        # 2. Предмет можно купить (purchasable)
        # 3. Это финальный предмет (нет поля "into")
        # 4. Его стоимость больше 1500 (чтобы отсеять компоненты и сапоги)
        # 5. У него есть описание (чтобы отсеять системные предметы)
        if (item_details['maps'].get('11', False) and
            item_details['gold']['purchasable'] and
            not item_details.get('into') and
            item_details['gold']['total'] > 1500 and
            item_details.get('description')):

            filtered_items.append({
                "id": item_id,
                "name": item_details['name'],
                "imageUrl": f"https://ddragon.leagueoflegends.com/cdn/{latest_version}/img/item/{item_details['image']['full']}"
            })

    # --- Шаг 4: Сохранить отфильтрованный список ---
    output_path = os.path.join(output_dir, 'items_base.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_items, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Успешно! {len(filtered_items)} предметов сохранено в файл: {output_path}")

except requests.exceptions.RequestException as e:
    print(f"❌ Ошибка при загрузке данных предметов: {e}")