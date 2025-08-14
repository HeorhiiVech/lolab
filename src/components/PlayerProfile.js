import React, { useState, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import proData from '../data/pro_data.json';
import GlobalSearch from './GlobalSearch'; // Используем GlobalSearch

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const baseStatsToExclude = ['Player', 'Team', 'Pos', 'GP', 'K', 'D', 'A'];
const allStats = Object.keys(proData[0] || {}).filter(stat => !baseStatsToExclude.includes(stat) && stat !== 'Tournament');

const ComparisonSearchModal = ({ onSelect, onClose, currentPlayer }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Выберите игрока для сравнения</h3>
            <GlobalSearch onPlayerSelect={(player) => {
                if (player.Player !== currentPlayer.Player) {
                    onSelect(player);
                    onClose();
                }
                
            }}
            onTeamSelect={() => {}}  
            isForModal={true} />
            <button onClick={onClose} className="modal-close-button">Закрыть</button>
        </div>
    </div>
);


const PlayerProfile = ({ players, onBack, onPlayerSelect, onTeamSelect, onAddCompare, onRemoveCompare, currentUser, userData }) => {
    const [comparisonTournament, setComparisonTournament] = useState('All');
    const [isSearching, setIsSearching] = useState(false);

    const player1 = players[0];
    const player2 = players.length > 1 ? players[1] : null;

    const comparisonData = useMemo(() => {
        let data = proData.filter(p => p.Pos === player1.Pos);
        if (comparisonTournament !== 'All') {
            return data.filter(p => p.Tournament === comparisonTournament);
        }
        return data;
    }, [comparisonTournament, player1.Pos]);

    const isLPL = player1.Tournament === 'LPL';
    const lplRadarStats = ['KDA', 'CSPM', 'DPM', 'EGPM'];
    const otherRadarStats = ['KDA', 'KP', 'CSPM', 'EGPM', 'DPM', 'GD10', 'XPD10', 'CSD10'];
    const radarLabels = isLPL ? lplRadarStats : otherRadarStats;

    let detailedStats;
    if (isLPL) {
        const lplStatsToRemove = ['FB%', 'GD10', 'CSD10', 'CS%P15', 'D%P15', 'STL', 'XPD10', 'TDPG'];
        detailedStats = allStats.filter(stat => !lplStatsToRemove.includes(stat));
    } else {
        detailedStats = allStats.filter(stat => !radarLabels.includes(stat));
    }
    
    const getNormalizedValue = (stat, value) => {
        const allValues = comparisonData.map(p => parseFloat(p[stat])).filter(v => !isNaN(v));
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        if (max === min) return 50;
        return ((value - min) / (max - min)) * 100;
    };
    
    const radarDatasets = players.map((p, index) => {
        const color = index === 0 ? 'rgba(200, 155, 60, 0.4)' : 'rgba(60, 155, 200, 0.4)';
        const borderColor = index === 0 ? '#C89B3C' : '#3CA0C8';
        return {
            label: p.Player,
            data: radarLabels.map(stat => getNormalizedValue(stat, parseFloat(p[stat]) || 0).toFixed(0)),
            backgroundColor: color,
            borderColor: borderColor,
            pointBackgroundColor: borderColor,
        };
    });

    const radarChartData = { labels: radarLabels, datasets: radarDatasets };
    const radarOptions = {
        scales: { r: { angleLines: { color: 'rgba(240, 230, 210, 0.2)' }, grid: { color: 'rgba(240, 230, 210, 0.2)' }, pointLabels: { font: { size: 13 }, color: '#F0E6D2' }, ticks: { display: false, stepSize: 20 } } },
        plugins: {
            legend: { display: !!player2, position: 'top', labels: { color: '#F0E6D2', font: { size: 14 } } },
            tooltip: { callbacks: { label: function(context) { const player = players[context.datasetIndex]; return `${player.Player}: ${player[context.label]}`; } } }
        },
        maintainAspectRatio: true
    };

    const getStatWinnerClass = (stat, val1, val2) => {
        const v1 = parseFloat(val1); const v2 = parseFloat(val2);
        if (isNaN(v1) || isNaN(v2)) return '';
        if (stat === 'DTH%') { return v1 < v2 ? 'better' : (v2 < v1 ? 'worse' : 'equal'); } 
        else { return v1 > v2 ? 'better' : (v2 > v1 ? 'worse' : 'equal'); }
    };
    
    const getStatRank = (stat, value) => {
        const allValues = comparisonData.map(p => parseFloat(p[stat])).filter(v => !isNaN(v));
        allValues.sort((a, b) => b - a);
        const rank = allValues.indexOf(parseFloat(value));
        return rank === -1 ? null : rank + 1;
    };


    return (
        <div className="content-wrapper profile-page-wrapper">
            {isSearching && <ComparisonSearchModal onSelect={onAddCompare} onClose={() => setIsSearching(false)} currentPlayer={player1}/>}

            <div className={`player-profile-card ${player2 ? 'comparison-mode' : ''}`}>
                <div className="profile-header-controls">
                    <button onClick={onBack} className="back-button">← Назад</button>
                    {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: Передаем все необходимые props */}
                    <GlobalSearch 
                        onPlayerSelect={onPlayerSelect} 
                        onTeamSelect={onTeamSelect}
                        currentUser={currentUser}
                        userData={userData}
                        isForHeader={true} 
                    />
                </div>
                
                <div className="profile-filter-bar">
                    <span className="filter-label">Сравнить с другими игроками ({player1.Pos}) из:</span>
                    <div className="role-filter">
                        <button className={comparisonTournament === 'All' ? 'active' : ''} onClick={() => setComparisonTournament('All')}>Всех лиг</button>
                        <button className={comparisonTournament === 'LCK' ? 'active' : ''} onClick={() => setComparisonTournament('LCK')}>LCK</button>
                        <button className={comparisonTournament === 'LEC' ? 'active' : ''} onClick={() => setComparisonTournament('LEC')}>LEC</button>
                        <button className={comparisonTournament === 'LPL' ? 'active' : ''} onClick={() => setComparisonTournament('LPL')}>LPL</button>
                    </div>
                </div>

                <div className="profile-content">
                    <div className="profile-left">
                        <div className="player-cards-wrapper">
                            <PlayerInfoCard player={player1} />
                            {player2 ? (
                                <PlayerInfoCard player={player2} onRemove={onRemoveCompare} isComparison />
                            ) : (
                                <div className="add-compare-placeholder">
                                    <button onClick={() => setIsSearching(true)} className="compare-button-small" title="Сравнить">vs</button>
                                </div>
                            )}
                        </div>
                        
                        <div className="radar-chart-container">
                            <Radar data={radarChartData} options={radarOptions} />
                            {player2 && (
                                <div className="radar-stats-comparison">
                                    {radarLabels.map(stat => {
                                        const winnerClass = getStatWinnerClass(stat, player1[stat], player2[stat]);
                                        return (
                                            <React.Fragment key={stat}>
                                                <div className={`stat-value ${winnerClass}`}>{player1[stat]}</div>
                                                <div className="stat-name">{stat}</div>
                                                <div className={`stat-value ${winnerClass === 'better' ? 'worse' : (winnerClass === 'worse' ? 'better' : '')}`}>{player2[stat]}</div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-right">
                        <h3>Подробная статистика</h3>
                        <div className={`stats-grid ${player2 ? 'comparison-mode' : ''}`}>
                            {player2 && (
                                <>
                                    <div className="stats-header">Показатель</div>
                                    <div className="stats-header">{player1.Player}</div>
                                    <div className="stats-header">{player2.Player}</div>
                                </>
                            )}
                            {detailedStats.map(stat => {
                                const val1 = player1[stat];
                                const rank = getStatRank(stat, val1);

                                if (player2) {
                                    const val2 = player2[stat];
                                    const winnerClass = getStatWinnerClass(stat, val1, val2);
                                    return (
                                        <React.Fragment key={stat}>
                                            <div className="stat-name">{stat}</div>
                                            <div className={`stat-value ${winnerClass}`}>{val1}</div>
                                            <div className={`stat-value ${winnerClass === 'better' ? 'worse' : (winnerClass === 'worse' ? 'better' : '')}`}>{val2}</div>
                                        </React.Fragment>
                                    );
                                } else {
                                    return (
                                        <div className="stat-item" key={stat}>
                                            {rank && <span className="stat-rank">#{rank}</span>}
                                            <span className="stat-name">{stat}</span>
                                            <span className="stat-value">{val1}</span>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlayerInfoCard = ({ player, onRemove, isComparison = false }) => (
    <div className="player-main-info">
        {isComparison && <button onClick={onRemove} className="remove-compare-button">×</button>}
        <div className="player-details">
            <h2>{player.Player}</h2>
            <p><strong>Команда:</strong> {player.Team}</p>
            <p><strong>Позиция:</strong> {player.Pos}</p>
        </div>
    </div>
);

export default PlayerProfile;