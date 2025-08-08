// src/data/items.js
import itemData from './items.json';

export const statGoldValues = {
  attackDamage: 35,
  abilityPower: 20,
  armor: 20,
  magicResist: 20,
  health: 2.666667,
  mana: 1,
  critChance: 40,
  attackSpeed: 25,
  moveSpeed: 12,
  abilityHaste: 50,
};

const patchVersion = itemData.version;
const getItemImageURL = (imageFullName) => {
  return `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${imageFullName}`;
};

export const items = {};
for (const key in itemData.data) {
  const item = itemData.data[key];

  if (item.maps && item.maps['11'] && item.gold.purchasable) {
    items[key] = {
      id: key,
      name: item.name,
      cost: item.gold.total,
      stats: {
        attackDamage: item.stats.FlatPhysicalDamageMod || 0,
        abilityPower: item.stats.FlatMagicDamageMod || 0,
        critChance: (item.stats.FlatCritChanceMod || 0) * 100,
        attackSpeed: (item.stats.PercentAttackSpeedMod || 0) * 100,
        health: item.stats.FlatHPPoolMod || 0,
        mana: item.stats.FlatMPPoolMod || 0,
        armor: item.stats.FlatArmorMod || 0,
        magicResist: item.stats.FlatSpellBlockMod || 0,
        moveSpeed: item.stats.FlatMovementSpeedMod || 0,
      },
      abilityHaste: 0, 
      imageUrl: getItemImageURL(item.image.full)
    };
  }
}

// === ПОЛНЫЙ И ТОЧНЫЙ СПИСОК ПРЕДМЕТОВ С УСКОРЕНИЕМ (ПО ТВОЕЙ ТАБЛИЦЕ) ===
const hasteItems = {
  // Компоненты
  '2022': 5,   // Светлячок
  '3067': 10,  // Воспламеняющий камень
  '3108': 10,  // Бесовской манускрипт
  '3024': 10,  // Ледяной баклер
  '3057': 10,  // Сияние
  '3158': 10,  // Ионийские сапоги просветления
  '4642': 10,  // Зеркало йордлов
  '6660': 5,   // Пепел Бами
  '3133': 10,  // Боевой молот Колфилда
  '3105': 10,  // Эгида Легиона
  '4638': 10,  // Бдительный защитный камень
  '3802': 10,  // Потерянная глава

  // Легендарные и завершенные предметы
  '2065': 15,  // Боевая песнь Шурелии
  '3050': 10,  // Конвергенция Зика
  '3190': 10,  // Медальон Железных Солари
  '6617': 20,  // Исцеляющий лунный камень
  '6620': 20,  // Эхо Гелии
  '4005': 20,  // Имперский мандат
  '6616': 15,  // Посох водного потока
  '3107': 15,  // Искупление
  '3109': 10,  // Клятва рыцаря
  '3222': 15,  // Благословение Микаэля
  '4643': 30,  // Неусыпный защитный камень
  '3119': 15,  // Вестник зимы
  '3110': 20,  // Ледяное сердце
  '3179': 10,  // Теневая глефа
  '3152': 20,  // Хекстековый ракетный ремень
  '8020': 15,  // Маска пустоты
  '3065': 10,  // Облачение духов
  '3068': 10,  // Эгида солнечного пламени
  '3118': 15,  // Пагубность
  '6655': 10,  // Помощник Людена (Luden's Companion)
  '2502': 10,  // Бесконечное отчаяние
  '2503': 20,  // Факел темного огня
  '4628': 25,  // Хекстековый прицел
  // 'Сияние пустоты' в файле нет, возможно старое название
  '3165': 15,  // Мореллономикон
  '3003': 25,  // Посох архангела
  '3004': 15,  // Манамунэ
  '3100': 10,  // Гроза Личей
  '3115': 15,  // Зуб Нашора
  '3508': 15,  // Похититель сущности
  '6662': 15,  // Хладорожденная рукавица
  '6692': 15,  // Затмение
  // 'Проклятие кровопускателя' - нет такого предмета, возможно старое название
  '6697': 15,  // Гордыня (в файле 10, но ставлю твое значение 15)
  '3071': 20,  // Черная секира
  '3137': 20,  // Могильный цветок
  '4629': 25,  // Космический ускоритель
  '6694': 15,  // Злоба Серильды
  '6696': 20,  // Шакрам Аксиом
  '6699': 10,  // Электрический цикломеч
  '3156': 15,  // Зев Малмортиуса
  '4633': 15,  // Творец разломов
  '6609': 15,  // Нож-пила химпанка
  '6610': 10,  // Расколотое небо
  '6698': 10,  // Нечестивая гидра
  '3074': 15,  // Ненасытная гидра
  '6333': 15,  // Танец смерти
  '3078': 15,  // Тройственный Союз
};

for (const itemId in hasteItems) {
  if (items[itemId]) {
    items[itemId].abilityHaste = hasteItems[itemId];
  }
}