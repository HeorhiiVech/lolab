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

function parseStatsFromDescription(description) {
  const parsedStats = {};
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = description;

  const statsNode = tempDiv.querySelector('mainText > stats');
  if (!statsNode) {
    return parsedStats;
  }

  const keywordMap = {
    'силы умений': 'abilityPower',
    'силы атаки': 'attackDamage',
    'брони': 'armor',
    'сопротивления магии': 'magicResist',
    'ускорения умений': 'abilityHaste',
    'здоровья': 'health',
    'маны': 'mana',
    '% шанса критического удара': 'critChance',
    '% скорости атаки': 'attackSpeed',
    '% скорости передвижения': 'moveSpeedPercent',
    '% магического пробивания': 'magicPenetrationPercent',
    '% пробивания брони': 'armorPenetrationPercent',
    '% эффективности лечения и щитов': 'healAndShieldPower',
    '% базового восстановления маны': 'manaRegenPercent',
  };

  const statLines = statsNode.innerHTML.split(/<br\s*\/?>/i);

  statLines.forEach(line => {
    const valueMatch = line.match(/<attention>(\d+)<\/attention>/);
    if (valueMatch && valueMatch[1]) {
      const value = parseInt(valueMatch[1], 10);
      
      for (const keyword in keywordMap) {
        if (line.includes(keyword)) {
          const statName = keywordMap[keyword];
          parsedStats[statName] = value;
          break;
        }
      }
    }
  });

  return parsedStats;
}

export const items = {};
for (const key in itemData.data) {
  const item = itemData.data[key];

  if (item.maps && item.maps['11'] && item.gold.purchasable) {
    const baseStats = {
      attackDamage: item.stats.FlatPhysicalDamageMod || 0,
      abilityPower: item.stats.FlatMagicDamageMod || 0,
      critChance: (item.stats.FlatCritChanceMod || 0) * 100,
      attackSpeed: (item.stats.PercentAttackSpeedMod || 0) * 100,
      health: item.stats.FlatHPPoolMod || 0,
      mana: item.stats.FlatMPPoolMod || 0,
      armor: item.stats.FlatArmorMod || 0,
      magicResist: item.stats.FlatSpellBlockMod || 0,
      moveSpeed: item.stats.FlatMovementSpeedMod || 0,
    };
    
    const parsedStats = parseStatsFromDescription(item.description);

    items[key] = {
      id: key,
      name: item.name,
      cost: item.gold.total,
      plaintext: item.plaintext || '',
      stats: {
        ...baseStats,
        ...parsedStats,
      },
      // === ИСПРАВЛЕНИЕ ЗДЕСЬ ===
      // Мы дублируем ускорение умений на верхний уровень для удобства
      abilityHaste: parsedStats.abilityHaste || 0,
      imageUrl: getItemImageURL(item.image.full)
    };
  }
}