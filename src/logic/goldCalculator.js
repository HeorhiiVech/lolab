// src/logic/goldCalculator.js
export function calculateGold(lane, minutes, missPercentage, procRate) {
    const gameTimeInSeconds = minutes * 60;
    
    // 1. Расчет стандартного пассивного золота (2.04g/sec, начиная с 1:40)
    let passiveGold = 0;
    const passiveGoldStartTime = 100; // 1 минута 40 секунд
    if (gameTimeInSeconds > passiveGoldStartTime) {
      passiveGold = (gameTimeInSeconds - passiveGoldStartTime) * 2.04;
    }

    // === ЛОГИКА ДЛЯ САППОРТА ===
    if (lane === 'Support') {
        // 2. Бонусное пассивное золото от World Atlas (+2g за 10 сек)
        const itemBonusPassiveGold = (gameTimeInSeconds / 10) * 2;
        
        // 3. Расчет золота с проков предмета
        const chargeCooldown = 20; // 1 заряд каждые 20 секунд
        const goldPerProc = 20;    // Золото за удар по чемпиону
        
        // Считаем, сколько всего зарядов могло появиться за это время
        const totalChargesGenerated = Math.floor(gameTimeInSeconds / chargeCooldown);
        // Считаем, сколько из них игрок использовал (согласно ползунку)
        const chargesUsed = totalChargesGenerated * (procRate / 100);
        const procGold = chargesUsed * goldPerProc;

        const grandTotalGold = passiveGold + itemBonusPassiveGold + procGold;

        return {
            lane: 'Support', // Возвращаем специальный флаг для UI
            passiveGold: Math.round(passiveGold),
            itemBonusPassiveGold: Math.round(itemBonusPassiveGold),
            procGold: Math.round(procGold),
            grandTotalGold: Math.round(grandTotalGold),
        };
    }

    // === ЛОГИКА ДЛЯ ОСТАЛЬНЫХ ЛИНИЙ (без изменений) ===
    let firstWaveArrivalTime;
    if (lane === 'Mid') {
        firstWaveArrivalTime = 82;
    } else { // Top или Bot
        firstWaveArrivalTime = 95;
    }
    
    if (gameTimeInSeconds < firstWaveArrivalTime) {
        return {
            lane: lane, totalFarmed: 0, maxTotal: 0, totalGold: 0,
            passiveGold: Math.round(passiveGold),
            grandTotalGold: Math.round(passiveGold),
            details: { melee: { farmed: 0, max: 0, gold: 0 }, caster: { farmed: 0, max: 0, gold: 0 }, siege: { farmed: 0, max: 0, gold: 0 } }
        };
    }

    // ... (остальная логика для фарма миньонов остается без изменений) ...
    const firstWaveSpawnTime = 65; 
    const totalWaves = Math.floor((gameTimeInSeconds - firstWaveArrivalTime) / 30) + 1;
    let maxMelee = 0, maxCaster = 0, maxSiege = 0;
    let goldFromMelee = 0, goldFromCaster = 0, goldFromSiege = 0;

    for (let i = 1; i <= totalWaves; i++) {
        const waveSpawnTime = firstWaveSpawnTime + (i - 1) * 30;
        let isSiegeWave = false;
        if (waveSpawnTime < 15 * 60) { if (i % 3 === 0) isSiegeWave = true; } 
        else if (waveSpawnTime < 25 * 60) { if (i % 2 === 0) isSiegeWave = true; } 
        else { isSiegeWave = true; }
        const goldCycles = Math.floor(waveSpawnTime / 90);
        maxMelee += 3; maxCaster += 3;
        goldFromMelee += 3 * (21 + (goldCycles * 0.5));
        goldFromCaster += 3 * (14 + (goldCycles * 0.5));
        if (isSiegeWave) { maxSiege += 1; goldFromSiege += (60 + (goldCycles * 3)); }
    }
    
    const hitChance = 1 - (missPercentage / 100);
    const farmedMelee = Math.round(maxMelee * hitChance);
    const farmedCaster = Math.round(maxCaster * hitChance);
    const farmedSiege = Math.round(maxSiege * hitChance);
    const goldMelee = Math.round(farmedMelee / (maxMelee || 1) * goldFromMelee);
    const goldCaster = Math.round(farmedCaster / (maxCaster || 1) * goldFromCaster);
    const goldSiege = Math.round(farmedSiege / (maxSiege || 1) * goldFromSiege);

    const totalMinionGold = goldMelee + goldCaster + goldSiege;
    const grandTotalGold = totalMinionGold + passiveGold;

    return {
        lane: lane,
        totalFarmed: farmedMelee + farmedCaster + farmedSiege,
        maxTotal: maxMelee + maxCaster + maxSiege,
        totalGold: totalMinionGold,
        passiveGold: Math.round(passiveGold),
        grandTotalGold: Math.round(grandTotalGold),
        details: {
            melee: { farmed: farmedMelee, max: maxMelee, gold: goldMelee },
            caster: { farmed: farmedCaster, max: maxCaster, gold: goldCaster },
            siege: { farmed: farmedSiege, max: maxSiege, gold: goldSiege },
        }
    };
}