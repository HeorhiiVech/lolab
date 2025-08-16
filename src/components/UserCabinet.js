import React from 'react';
import proData from '../data/pro_data.json';
import teamData from '../data/team_data.json';
import './UserCabinet.css';

// ИЗМЕНЕНО: Функция теперь возвращает всю информацию для прогресс-бара
const getRankInfo = (points) => {
    const pts = points || 1000;

    const ranks = [
        { threshold: 0, name: 'Железо', color: '#817364' },
        { threshold: 3000, name: 'Бронза', color: '#CD7F32' },
        { threshold: 6000, name: 'Серебро', color: '#C0C0C0' },
        { threshold: 9000, name: 'Платина', color: '#E5E4E2' },
        { threshold: 12000, name: 'Изумруд', color: '#50C878' },
        { threshold: 15000, name: 'Даймонд', color: '#B9F2FF' },
        { threshold: 20000, name: 'Мастер', color: '#9d00ff' },
        { threshold: 25000, name: 'Грандмастер', color: '#ff0000' },
        { threshold: 30000, name: 'Челленджер', color: '#F4C430' }
    ];

    let currentRank = ranks[0];
    let nextRank = ranks[1];

    for (let i = 0; i < ranks.length; i++) {
        if (pts >= ranks[i].threshold) {
            currentRank = ranks[i];
            nextRank = (i < ranks.length - 1) ? ranks[i + 1] : null;
        }
    }

    if (!nextRank) {
        return {
            ...currentRank,
            nextRankName: 'Максимум',
            nextRankIn: null,
            progress: 100,
            totalPoints: pts
        };
    }

    const rankStartPoints = currentRank.threshold;
    const rankEndPoints = nextRank.threshold;
    const pointsInCurrentRank = pts - rankStartPoints;
    const pointsNeededForRank = rankEndPoints - rankStartPoints;
    
    const progress = (pointsInCurrentRank / pointsNeededForRank) * 100;
    const nextRankIn = rankEndPoints - pts;

    return {
        ...currentRank,
        nextRankName: nextRank.name,
        nextRankIn,
        progress,
        totalPoints: pts
    };
};

function UserCabinet({ userData, onPlayerSelect, onTeamSelect }) {
    if (!userData) {
        return (
            <div className="card cabinet-container">
                <h2>Профиль</h2>
                <p>Загрузка данных пользователя...</p>
            </div>
        );
    }

    const favoritePlayersData = (userData.favoritePlayers || [])
        .map(playerName => proData.find(p => p.Player === playerName))
        .filter(Boolean);

    const favoriteTeamsData = (userData.favoriteTeams || [])
        .map(teamName => teamData.find(t => t.Team === teamName))
        .filter(Boolean);

    const userRank = getRankInfo(userData.rating);

    return (
        <div className="card cabinet-container">
            <h2>Профиль: {userData.nickname}</h2>
            
            {/* ИЗМЕНЕНО: Полностью новый блок рейтинга */}
            <div className="cabinet-section">
                <h3>Прогресс ранга</h3>
                <div className="rank-progress-container">
                    <div className="rank-progress-header">
                        <span>Всего очков: <strong>{userRank.totalPoints} pt.</strong></span>
                        {userRank.nextRankIn !== null && (
                            <span>До следующего ранга: <strong>{userRank.nextRankIn} pt.</strong></span>
                        )}
                    </div>
                    <div className="progress-bar-background">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${userRank.progress}%`, backgroundColor: userRank.color }}
                        ></div>
                    </div>
                    <div className="rank-labels">
                        <span style={{ color: userRank.color }}>{userRank.name}</span>
                        <span>{userRank.nextRankName}</span>
                    </div>
                </div>
            </div>

            <div className="cabinet-section">
                <h3>Избранные игроки</h3>
                {favoritePlayersData.length > 0 ? (
                    <div className="favorites-grid">
                        {favoritePlayersData.map(player => (
                            <div key={player.Player} className="favorite-player-card" onClick={() => onPlayerSelect(player)}>
                                <span className="player-name">{player.Player}</span>
                                <span className="player-team">{player.Team} - {player.Pos}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Вы еще не добавили игроков в избранное.</p>
                )}
            </div>

            <div className="cabinet-section">
                <h3>Избранные команды</h3>
                {favoriteTeamsData.length > 0 ? (
                    <div className="favorites-grid">
                        {favoriteTeamsData.map(team => (
                            <div key={team.Team} className="favorite-player-card" onClick={() => onTeamSelect(team)}>
                                <span className="player-name">{team.Team}</span>
                                <span className="player-team">{team.Tournament}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Вы еще не добавили команды в избранное.</p>
                )}
            </div>
        </div>
    );
}

export default UserCabinet;
