// Sternenschauer erstellen
const createStars = () => { /* Erstellt fallende Sterne */
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}vw`;
        const duration = Math.random() * 10 + 5;
        star.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 5;
        star.style.animationDelay = `-${delay}s`;
        starsContainer.appendChild(star);
    }
};

// Theme ändern
function changeNeonColor() { /* Ändert die Neonfarbe */
    const selectedColor = document.getElementById('neon-color').value;
    const colorMap = {
        cyan: '#00ffff',
        blue: '#1e90ff',
        green: '#00ff00'
    };
    document.documentElement.style.setProperty('--primary-color', colorMap[selectedColor]);
}

function changeGameSpeed() { /* Ändert die Spielgeschwindigkeit */
    const selectedSpeed = document.getElementById('game-speed').value;
    console.log(`Spielgeschwindigkeit geändert zu: ${selectedSpeed}`);
    // Hier kannst du die Logik für die Spielgeschwindigkeit implementieren
}

// Chat-Funktionen
function toggleChat() { /* Öffnet/Schließt den Chat */
    const chatContent = document.getElementById('chatContent');
    chatContent.classList.toggle('active');
}

function sendChat() { /* Sendet eine Chatnachricht */
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    if (chatInput.value.trim()) {
        const message = document.createElement('p');
        message.textContent = chatInput.value;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';
    }
}

// Uhr aktualisieren (wird jetzt in ClockManager gehandhabt, hier nur als Fallback)
function updateClock() { /* Aktualisiert die Uhr (Fallback) */
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    document.querySelector('.hour-hand').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.querySelector('.minute-hand').style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    document.querySelector('.second-hand').style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

    document.getElementById('clockTime').textContent = now.toLocaleTimeString();
}

// Game Manager
class GameManager { /* Verwaltet das gesamte Spiel */
    constructor() {
        this.currentGame = null;
        this.language = 'de'; // Standard-Sprache
        this.soundManager = soundManager;
        this.clockManager = clockManager;
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        this.initialize();
        createStars();
    }

    initialize() { /* Initialisiert das Spiel */
        this.showScreen('menu-screen');
        document.querySelectorAll('.neon-button-game').forEach(button => {
            button.addEventListener('click', () => this.handleGameSelection(button.dataset.game));
        });
        document.getElementById('menu-title').textContent = translations[this.language].title;

        // Event-Listener für zusätzliche Funktionen
        document.getElementById('themeToggle')?.addEventListener('click', () => themeManager.toggleTheme());
        document.getElementById('musicToggle')?.addEventListener('click', () => soundManager.toggleMusic());
        document.getElementById('ttt-start-btn')?.addEventListener('click', () => this.startTicTacToe());
        document.getElementById('reset-leaderboard')?.addEventListener('click', () => this.resetLeaderboard());
        document.getElementById('language-menu')?.addEventListener('change', () => this.changeLanguage());
        document.querySelectorAll('.back-to-menu').forEach(btn => {
            btn.addEventListener('click', () => this.showMainMenu());
        });
    }

    handleGameSelection(gameType) { /* Handhabt die Spielauswahl */
        switch (gameType) {
            case 'tictactoe':
                this.showScreen('tictactoe-start-screen');
                break;
            case 'connect4':
                this.currentGame = new ConnectFour();
                this.currentGame.onGameEnd = (winner, score) => {
                    if (winner) {
                        this.addToLeaderboard(winner, 'connect4', score);
                        showToast(translations[this.language].c4Win.replace('{player}', winner), 'success');
                    } else {
                        showToast(translations[this.language].c4Draw, 'info');
                    }
                };
                this.showScreen('connect4-screen');
                break;
            case 'tetris':
                // Tetris-Logik fehlt hier im Code
                break;
            case 'snake':
                this.currentGame = new Snake();
                this.currentGame.onGameEnd = (player, score) => {
                    this.addToLeaderboard(player, 'snake', score);
                    showToast(translations[this.language].snakeGameOver.replace('{score}', score), 'info');
                };
                this.showScreen('snake-screen');
                break;
            case 'memory':
                this.currentGame = new Memory();
                this.currentGame.onGameEnd = (player, pairs) => {
                    this.addToLeaderboard(player, 'memory', pairs);
                    showToast(translations[this.language].memoryWin.replace('{pairs}', pairs), 'success');
                };
                this.showScreen('memory-screen');
                break;
            case 'leaderboard':
                this.showLeaderboard();
                break;
            case 'profile':
                this.showProfile();
                break;
            default:
                console.error('Spiel nicht gefunden:', gameType);
        }
    }

    startTicTacToe() { /* Startet Tic Tac Toe */
        const playerXName = document.getElementById('playerX').value || 'Player X';
        const playerOName = document.getElementById('playerO').value || 'Player O';
        const symbolX = document.getElementById('symbolX').value || 'X';
        const symbolO = document.getElementById('symbolO').value || 'O';
        const gameMode = document.getElementById('game-mode').value || 'human';
        const difficulty = gameMode === 'bot' ? document.getElementById('difficulty').value : null;
        const bestOf = parseInt(document.getElementById('best-of').value) || 3;

        const playerX = new Player(playerXName, symbolX);
        const playerO = gameMode === 'human' ? new Player(playerOName, symbolO) : new Player('Bot', symbolO);

        this.currentGame = new TicTacToe(playerX, playerO, bestOf, difficulty);
        this.currentGame.onGameEnd = (winner, points) => {
            if (winner) {
                this.addToLeaderboard(winner, 'tictactoe', points);
                showToast(translations[this.language].toastWin.replace('{player}', winner), 'success');
            } else {
                showToast(translations[this.language].toastDraw, 'info');
            }
        };
        this.showScreen('tictactoe-game-screen');
    }

    showScreen(screenId) { /* Zeigt einen bestimmten Bildschirm */
        document.querySelectorAll('.container').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    showMainMenu() { /* Zeigt das Hauptmenü */
        this.currentGame = null;
        this.showScreen('menu-screen');
    }

    toggleMenu(close = false) { /* Öffnet/Schließt das Menü */
        const menu = document.getElementById('sliding-menu');
        const overlay = document.getElementById('overlay');
        if (close || menu.classList.contains('active')) {
            menu.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            menu.classList.add('active');
            overlay.classList.add('active');
        }
    }

    changeLanguage() { /* Ändert die Sprache */
        this.language = document.getElementById('language-menu').value;
        document.getElementById('menu-title').textContent = translations[this.language].title;
        if (this.currentGame && this.currentGame.updateStatus) this.currentGame.updateStatus();
        this.showProfiles();
        this.displayLeaderboard();
    }

    showLeaderboard() { /* Zeigt die Bestenliste */
        this.showScreen('leaderboard-screen');
        this.displayLeaderboard();
    }

    addToLeaderboard(player, game, score) { /* Fügt einen Eintrag zur Bestenliste hinzu */
        const entry = {
            id: Date.now(),
            player: player,
            game: game,
            score: score,
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        };

        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    displayLeaderboard() { /* Zeigt die Bestenliste an */
        const leaderboardEntries = document.getElementById('leaderboard-entries');
        leaderboardEntries.innerHTML = '';

        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

        if (leaderboard.length === 0) {
            leaderboardEntries.innerHTML = `<tr><td colspan="4" class="neon-text">${translations[this.language].noProfiles || "Keine Einträge vorhanden."}</td></tr>`;
            return;
        }

        leaderboard.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.player}</td>
                <td>${entry.game}</td>
                <td>${entry.score}</td>
                <td>${entry.date}</td>
            `;
            leaderboardEntries.appendChild(row);
        });
    }

    resetLeaderboard() { /* Setzt die Bestenliste zurück */
        localStorage.removeItem('leaderboard');
        this.displayLeaderboard();
        showToast(translations[this.language].resetLeaderboard || "Leaderboard wurde zurückgesetzt!", 'success');
    }

    showProfile() { /* Zeigt das Profil */
        this.showScreen('profile-screen');
        this.showProfiles();
    }

    createProfile() { /* Erstellt ein Profil */
        const name = document.getElementById('profile-name').value;
        const age = document.getElementById('profile-age').value;

        if (!name || !age) {
            showToast(translations[this.language].profileError, 'error');
            return;
        }

        const profile = {
            id: Date.now(),
            name: name,
            age: age
        };

        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.push(profile);
        localStorage.setItem('profiles', JSON.stringify(profiles));

        document.getElementById('profile-name').value = '';
        document.getElementById('profile-age').value = '';

        showToast(translations[this.language].profileCreated, 'success');
        this.showProfiles();
    }

    showProfiles() { /* Zeigt alle Profile */
        const profilesList = document.getElementById('profiles-list');
        profilesList.innerHTML = '';

        const profiles = JSON.parse(localStorage.getItem('profiles')) || [];

        if (profiles.length === 0) {
            profilesList.innerHTML = `<p class="neon-text">${translations[this.language].noProfiles}</p>`;
            return;
        }

        profiles.forEach(profile => {
            const profileDiv = document.createElement('div');
            profileDiv.classList.add('profile-item');
            profileDiv.innerHTML = `
                <p><strong>${translations[this.language].name}:</strong> ${profile.name}</p>
                <p><strong>${translations[this.language].age}:</strong> ${profile.age}</p>
                <button class="neon-button" onclick="gameManager.deleteProfile(${profile.id})">${translations[this.language].delete}</button>
            `;
            profilesList.appendChild(profileDiv);
        });
    }

    deleteProfile(id) { /* Löscht ein Profil */
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles = profiles.filter(profile => profile.id !== id);
        localStorage.setItem('profiles', JSON.stringify(profiles));
        this.showProfiles();
        showToast(translations[this.language].profileDeleted, 'success');
    }

    exportTicTacToeStats() { /* Exportiert Tic Tac Toe Statistiken */
        const stats = localStorage.getItem('tttStats');
        if (stats) {
            const blob = new Blob([stats], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ticTacToeStats.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    togglePlayerOInput() { /* Schaltet Player O Eingabe ein/aus */
        const gameMode = document.getElementById('game-mode').value;
        const playerOInput = document.getElementById('playerO');
        const difficultySelect = document.querySelector('.difficulty-select');
        if (gameMode === 'bot') {
            playerOInput.disabled = true;
            playerOInput.value = 'Bot';
            difficultySelect.hidden = false;
        } else {
            playerOInput.disabled = false;
            playerOInput.value = '';
            difficultySelect.hidden = true;
        }
    }
}

// Spiele starten
document.addEventListener('DOMContentLoaded', () => { /* Startet GameManager nach DOM-Laden */
    window.gameManager = new GameManager();
});