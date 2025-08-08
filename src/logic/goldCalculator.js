// src/logic/goldCalculator.js
export function calculateGold(lane, minutes, missPercentage) {
    const gameTimeInSeconds = minutes * 60;
    
    let firstWaveArrivalTime;
    if (lane === 'Mid') {
        firstWaveArrivalTime = 82; // ~1:22
    } else { // Top или Bot
        firstWaveArrivalTime = 95; // ~1:35
    }

    if (gameTimeInSeconds < firstWaveArrivalTime) {
        return {
            totalFarmed: 0, maxTotal: 0, totalGold: 0,
            details: { melee: { farmed: 0, max: 0, gold: 0 }, caster: { farmed: 0, max: 0, gold: 0 }, siege: { farmed: 0, max: 0, gold: 0 } }
        };
    }

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

        maxMelee += 3;
        maxCaster += 3;
        goldFromMelee += 3 * (21 + (goldCycles * 0.5));
        goldFromCaster += 3 * (14 + (goldCycles * 0.5));

        if (isSiegeWave) {
            maxSiege += 1;
            goldFromSiege += (60 + (goldCycles * 3));
        }
    }
    
    const hitChance = 1 - (missPercentage / 100);
    const farmedMelee = Math.round(maxMelee * hitChance);
    const farmedCaster = Math.round(maxCaster * hitChance);
    const farmedSiege = Math.round(maxSiege * hitChance);
    const goldMelee = Math.round(farmedMelee / (maxMelee || 1) * goldFromMelee);
    const goldCaster = Math.round(farmedCaster / (maxCaster || 1) * goldFromCaster);
    const goldSiege = Math.round(farmedSiege / (maxSiege || 1) * goldFromSiege);

    return {
        totalFarmed: farmedMelee + farmedCaster + farmedSiege,
        maxTotal: maxMelee + maxCaster + maxSiege,
        totalGold: goldMelee + goldCaster + goldSiege,
        details: {
            melee: { farmed: farmedMelee, max: maxMelee, gold: goldMelee },
            caster: { farmed: farmedCaster, max: maxCaster, gold: goldCaster },
            siege: { farmed: farmedSiege, max: maxSiege, gold: goldSiege },
        }
    };
}