// src/utils/time.js

const TWELVE_HOURS_IN_MS = 12 * 60 * 60 * 1000;

/**
 * Генерирует уникальный числовой идентификатор для текущего 12-часового блока (относительно времени UTC).
 * Этот идентификатор будет одинаковым для всех пользователей в мире.
 * @returns {number} - Идентификатор временного блока.
 */
export const getTimeBlockSeed = () => {
    return Math.floor(Date.now() / TWELVE_HOURS_IN_MS);
};

/**
 * Вычисляет точное время следующего 12-часового сброса.
 * @returns {Date} - Объект Date, указывающий на время следующего сброса.
 */
export const getNextResetTime = () => {
    const currentSeed = getTimeBlockSeed();
    const nextResetTimestamp = (currentSeed + 1) * TWELVE_HOURS_IN_MS;
    return new Date(nextResetTimestamp);
};