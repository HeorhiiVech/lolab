// src/components/Home.js
import React from 'react';
import './Home.css'; // Подключаем стили для этого компонента

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Добро пожаловать на LOLab</h1>

      <p className="home-description">
        Тренируйся, анализируй и улучшай свои навыки в League of Legends, используя полный набор инструментов в одном месте.
      </p>

      <p className="home-description">
        Сравнивай свой CS с идеальным в <strong>калькуляторе фарма</strong>, подбирай самый эффективный билд в <strong>калькуляторе предметов</strong> и проверяй, сколько выстрелов ты переживёшь под <strong>башней</strong>. Оттачивай реакцию в <strong>тренажёре смайта</strong>, изучай статистику игроков <strong>про-сцены</strong> и создавай собственные рейтинги в <strong>тирлист-мейкере</strong>.
      </p>

      <p className="home-description">
        Сайт постоянно обновляется — всё, что нужно для LoL, в одном месте.
      </p>

      {/* --- НАЧАЛО НОВОГО БЛОКА --- */}
      <div className="home-credits">
        <p>Автор: heovech</p>
        <p>Спасибо за помощь: rehznby, Flarps</p>
      </div>
      {/* --- КОНЕЦ НОВОГО БЛОКА --- */}
      
    </div>
  );
}

export default Home;