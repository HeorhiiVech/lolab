import React from 'react';
import proData from '../data/pro_data.json';
import teamData from '../data/team_data.json'; // Импортируем данные команд
import './UserCabinet.css';

function UserCabinet({ userData, onPlayerSelect, onTeamSelect }) { // Добавляем onTeamSelect
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

    return (
        <div className="card cabinet-container">
            <h2>Профиль: {userData.nickname}</h2>
            
            <div className="cabinet-section">
                <h3>Рекорды Тренажера Смайтов</h3>
                <div className="smite-records">
                    <div className="record-item">
                        <span className="record-label">Лучшая реакция</span>
                        <span className="record-value">{userData.highScore ? `${userData.highScore} мс` : 'Нет рекорда'}</span>
                    </div>
                    <div className="record-item">
                        <span className="record-label">Лучший стрик побед</span>
                        <span className="record-value">{userData.winStreak || 0}</span>
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

            {/* НОВАЯ СЕКЦИЯ ДЛЯ КОМАНД */}
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