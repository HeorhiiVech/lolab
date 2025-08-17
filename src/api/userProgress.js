import { db } from '../firebase-config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, collection, getDocs } from "firebase/firestore";

/**
 * Обновляет прогресс изучения предмета для пользователя (логика Anki).
 * @param {string} userId ID пользователя
 * @param {string} itemId ID предмета
 * @param {boolean} isCorrect Правильно ли ответил пользователь
 */
export const updateItemMastery = async (userId, itemId, isCorrect) => {
    if (!userId) return;

    const masteryRef = doc(db, "users", userId, "itemMastery", itemId);
    const masteryDoc = await getDoc(masteryRef);
    const currentMastery = masteryDoc.exists() ? masteryDoc.data() : { level: 0 };

    let newLevel = currentMastery.level;

    if (isCorrect) {
        newLevel = Math.min(newLevel + 1, 5); // Максимальный уровень - 5
    } else {
        newLevel = Math.max(newLevel - 1, 0); // Понижаем уровень при ошибке
    }
    
    // Интервалы в днях для следующего повторения
    const reviewIntervals = [1, 3, 7, 14, 30, 90]; // 0-5 уровни
    const daysToAdd = reviewIntervals[newLevel];
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

    await setDoc(masteryRef, {
        level: newLevel,
        lastReviewed: serverTimestamp(),
        nextReviewDate: Timestamp.fromDate(nextReviewDate),
    }, { merge: true });
};

/**
 * Обновляет лучшее время пользователя в режиме испытания.
 * @param {string} userId ID пользователя
 * @param {string} deckName Название колоды (например, 'all')
 * @param {number} newTime Новое время в секундах
 */
export const updateChallengeBestTime = async (userId, deckName, newTime) => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentBestTime = userData.itemTrainerRecords?.[deckName] || Infinity;

        if (newTime < currentBestTime) {
            await updateDoc(userRef, {
                [`itemTrainerRecords.${deckName}`]: newTime
            });
            console.log(`Новый рекорд для ${deckName}: ${newTime} с.!`);
        }
    }
};

/**
 * Загружает все записи о мастерстве предметов для пользователя.
 * @param {string} userId ID пользователя
 * @returns {Map<string, object>} Карта, где ключ - ID предмета, значение - данные о его изучении.
 */
export const fetchUserMastery = async (userId) => {
    if (!userId) return new Map();

    const masteryCollectionRef = collection(db, "users", userId, "itemMastery");
    const querySnapshot = await getDocs(masteryCollectionRef);
    
    const masteryMap = new Map();
    querySnapshot.forEach(doc => {
        masteryMap.set(doc.id, doc.data());
    });
    
    return masteryMap;
};