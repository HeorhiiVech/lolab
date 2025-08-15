import React, { useState, useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import teamData from '../data/team_data.json';
import TeamSearch from './TeamSearch';

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Словарь с описаниями для статистик
const statDescriptions = {
    'EGR': 'Ерли гейм рейтинг',
    'MLR': 'Мид\\лейт рейтинг',
    'FB%': 'Первое убийство',
    'FT%': 'Первый тавер',
    'F3T%': '% игр, в которых команда забирает первой 3 вышки',
    'PPG': 'Сколько пластин в среднем за игру ломает команда',
    'HLD%': 'Контроль Герольдов',
    'GRB%': 'Контроль Грабсов',
    'FD%': 'Первый дракон',
    'FBN%': 'Первый Нашор',
    'LNE%': 'Средняя доля от общего количества крипов на лайнах за игру',
    'JNG%': 'Средняя доля от общего количества крипов в джангле за игру'
};


const ComparisonSearchModal = ({ onSelect, onClose, currentTeam }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Выберите команду для сравнения</h3>
            <TeamSearch onTeamSelect={(team) => {
                if (team.Team !== currentTeam.Team) {
                    onSelect(team);
                    onClose();
                }
            }} isForModal={true} />
            <button onClick={onClose} className="modal-close-button">Закрыть</button>
        </div>
    </div>
);

const TeamProfile = ({ teams, onBack, onTeamSelect, onAddCompare, onRemoveCompare }) => {
    const [comparisonTournament, setComparisonTournament] = useState('All');
    const [isSearching, setIsSearching] = useState(false);

    const team1 = teams[0];
    const team2 = teams.length > 1 ? teams[1] : null;

    const comparisonData = useMemo(() => {
        if (comparisonTournament === 'All') return teamData;
        return teamData.filter(t => t.Tournament === comparisonTournament);
    }, [comparisonTournament]);

    const isLPL = team1.Tournament === 'LPL';

    const radarLabels = ['KD', 'GSPD', 'FB%', 'FT%', 'HLD%', 'GRB%', 'FD%', 'LNE%', 'JNG%'];

    let detailedStats;
    if (isLPL) {
        detailedStats = ['KD', 'GSPD', 'FB%', 'FT%', 'HLD%', 'GRB%', 'FD%', 'LNE%', 'JNG%', 'WPM'];
    } else {
        detailedStats = ['KD', 'GSPD', 'EGR', 'MLR', 'GD15', 'FB%', 'FT%', 'F3T%', 'PPG', 'HLD%', 'GRB%', 'FD%', 'FBN%', 'LNE%', 'JNG%', 'WPM'];
    }
    
    const getNormalizedValue = (stat, value) => {
        const allValues = comparisonData
            .filter(p => p[stat] != null)
            .map(p => parseFloat(p[stat]))
            .filter(v => !isNaN(v));
        
        if (allValues.length === 0) return 0;

        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        if (max === min) return 50;
        return ((value - min) / (max - min)) * 100;
    };
    
    const radarDatasets = teams.map((t, index) => ({
        label: t.Team,
        data: radarLabels.map(stat => getNormalizedValue(stat, parseFloat(t[stat]) || 0).toFixed(0)),
        backgroundColor: index === 0 ? 'rgba(200, 155, 60, 0.4)' : 'rgba(60, 155, 200, 0.4)',
        borderColor: index === 0 ? '#C89B3C' : '#3CA0C8',
        pointBackgroundColor: index === 0 ? '#C89B3C' : '#3CA0C8',
    }));

    const radarChartData = { labels: radarLabels, datasets: radarDatasets };
    const radarOptions = {
        scales: { r: { angleLines: { color: 'rgba(240, 230, 210, 0.2)' }, grid: { color: 'rgba(240, 230, 210, 0.2)' }, pointLabels: { font: { size: 13 }, color: '#F0E6D2' }, ticks: { display: false, stepSize: 20 } } },
        plugins: {
            legend: { display: !!team2, position: 'top', labels: { color: '#F0E6D2', font: { size: 14 } } },
            tooltip: { callbacks: { label: (c) => `${teams[c.datasetIndex].Team}: ${teams[c.datasetIndex][c.label]}` } }
        },
        maintainAspectRatio: true
    };

    const getStatWinnerClass = (stat, val1, val2) => {
        const v1 = parseFloat(val1); const v2 = parseFloat(val2);
        if (isNaN(v1) || isNaN(v2)) return '';
        if (stat === 'MLR') { return v1 < v2 ? 'better' : (v2 < v1 ? 'worse' : 'equal'); } 
        else { return v1 > v2 ? 'better' : (v2 > v1 ? 'worse' : 'equal'); }
    };

    return (
        <div className="content-wrapper profile-page-wrapper">
            {isSearching && <ComparisonSearchModal onSelect={onAddCompare} onClose={() => setIsSearching(false)} currentTeam={team1}/>}
            <div className={`player-profile-card ${team2 ? 'comparison-mode' : ''}`}>
                <div className="profile-header-controls">
                    <button onClick={onBack} className="back-button">← Назад</button>
                    <TeamSearch onTeamSelect={onTeamSelect} isForHeader={true} />
                </div>
                <div className="profile-filter-bar">
                    <span className="filter-label">Сравнить с командами из:</span>
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
                            <TeamInfoCard team={team1} />
                            {team2 ? (
                                <TeamInfoCard team={team2} onRemove={onRemoveCompare} isComparison />
                            ) : (
                                <div className="add-compare-placeholder">
                                    <button onClick={() => setIsSearching(true)} className="compare-button-small" title="Сравнить">vs</button>
                                </div>
                            )}
                        </div>
                        <div className="radar-chart-container">
                            <Radar data={radarChartData} options={radarOptions} />
                            {team2 && (
                                <div className="radar-stats-comparison">
                                    {radarLabels.map(stat => {
                                        const winnerClass = getStatWinnerClass(stat, team1[stat], team2[stat]);
                                        return (
                                            <React.Fragment key={stat}>
                                                <div className={`stat-value ${winnerClass}`}>{team1[stat] != null ? team1[stat] : 'N/A'}</div>
                                                <div className="stat-name">{stat}</div>
                                                <div className={`stat-value ${winnerClass === 'better' ? 'worse' : (winnerClass === 'worse' ? 'better' : '')}`}>{team2[stat] != null ? team2[stat] : 'N/A'}</div>
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="profile-right">
                        <h3>Подробная статистика</h3>
                        <div className={`stats-grid ${team2 ? 'comparison-mode' : ''}`}>
                            {team2 && (
                                <>
                                    <div className="stats-header">Показатель</div>
                                    <div className="stats-header">{team1.Team}</div>
                                    <div className="stats-header">{team2.Team}</div>
                                </>
                            )}
                            {detailedStats.map(stat => {
                                const val1 = team1[stat];
                                const description = statDescriptions[stat]; // Получаем описание для стата

                                if (team2) {
                                    const val2 = team2[stat];
                                    const winnerClass = getStatWinnerClass(stat, val1, val2);
                                    return (
                                        <React.Fragment key={stat}>
                                            {/* Добавляем title, если есть описание */}
                                            <div className="stat-name" title={description}>{stat}</div>
                                            <div className={`stat-value ${winnerClass}`}>{val1 != null ? val1 : 'N/A'}</div>
                                            <div className={`stat-value ${winnerClass === 'better' ? 'worse' : (winnerClass === 'worse' ? 'better' : '')}`}>{val2 != null ? val2 : 'N/A'}</div>
                                        </React.Fragment>
                                    );
                                } else {
                                    return (
                                        // Добавляем title, если есть описание
                                        <div className="stat-item" key={stat} title={description}>
                                            <span className="stat-name">{stat}</span>
                                            <span className="stat-value">{val1 != null ? val1 : 'N/A'}</span>
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

const TeamInfoCard = ({ team, onRemove, isComparison = false }) => (
    <div className="player-main-info">
        {isComparison && <button onClick={onRemove} className="remove-compare-button">×</button>}
        <div className="player-details">
            <h2>{team.Team}</h2>
            <p><strong>Турнир:</strong> {team.Tournament}</p>
        </div>
    </div>
);

export default TeamProfile;