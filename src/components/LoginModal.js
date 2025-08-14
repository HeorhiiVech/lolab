import React, { useState } from 'react';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        background: '#1e2833', padding: '25px', borderRadius: '10px',
        color: 'white', width: '320px', textAlign: 'center',
        border: '1px solid #c89b3c',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    },
    input: {
        width: 'calc(100% - 22px)', padding: '11px', margin: '8px 0',
        borderRadius: '5px', border: '1px solid #555', background: '#0a1014', color: 'white',
    },
    buttonContainer: {
        display: 'flex', justifyContent: 'space-between', marginTop: '15px',
    },
    button: {
        fontFamily: "'Cinzel', serif", padding: '10px 15px', cursor: 'pointer', border: '1px solid #c89b3c',
        borderRadius: '5px', background: '#111', color: '#c8aa6e',
    }
};

function LoginModal({ isOpen, onClose }) {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleRegister = async () => {
        if (!nickname.trim()) {
            alert("Пожалуйста, введите никнейм.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // При регистрации создаем документ со всеми необходимыми полями
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: userCredential.user.email,
                nickname: nickname,
                highScore: null,
                winStreak: 0,
                favoritePlayers: [],
                favoriteTeams: [] // Добавляем поле для команд
            });
            onClose();
        } catch (error) {
            alert("Ошибка регистрации: " + error.message);
        }
    };

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (error) {
            alert("Ошибка входа: " + error.message);
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                <h2>Вход или Регистрация</h2>
                <input style={modalStyles.input} type="text" placeholder="Никнейм (только при регистрации)" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <input style={modalStyles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input style={modalStyles.input} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div style={modalStyles.buttonContainer}>
                    <button style={modalStyles.button} onClick={handleLogin}>Войти</button>
                    <button style={modalStyles.button} onClick={handleRegister}>Регистрация</button>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;