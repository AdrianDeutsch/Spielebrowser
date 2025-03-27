// Übersetzungen für verschiedene Sprachen
const translations = {
    de: { /* Deutsche Übersetzungen */
        title: "Spielebrowser",
        menu: "Menü",
        themeToggle: "Thema wechseln",
        stats: "Statistiken",
        leaderboard: "Leaderboard",
        backToMenu: "Zum Hauptmenü",
        language: "Sprache:",
        startGame: "Spiel Starten",
        restart: "Neustart",
        undo: "Rückgängig",
        exportStats: "Statistiken exportieren",
        playerX: "Name Spieler X",
        playerO: "Name Spieler O",
        gameMode: "Spielmodus:",
        human: "Gegen echten Gegner",
        bot: "Gegen Bot",
        difficulty: "Schwierigkeit:",
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
        impossible: "Unbesiegbar",
        bestOf: "Best of:",
        round: "Runde",
        rounds: "Runden",
        playerTurn: "{player} ist am Zug",
        timePlayerX: "Zeit Spieler X: ",
        timePlayerO: "Zeit Spieler O: ",
        win: "{player} gewinnt!",
        draw: "Unentschieden!",
        moveHistory: "Zuggeschichte:",
        musicToggle: "Musik ein/aus",
        toastWin: "{player} hat gewonnen!",
        toastDraw: "Das Spiel endete unentschieden!",
        toastError: "Ungültiger Zug!",
        c4Win: "Spieler {player} gewinnt!",
        c4Draw: "Unentschieden!",
        tetrisStart: "Drücke Start oder eine Taste!",
        tetrisGameOver: "Spiel vorbei! Punkte: {score}",
        tetrisLevelUp: "Level {level} erreicht!",
        tetrisPaused: "Spiel pausiert! (Leertaste zum Fortsetzen)",
        snakeGameOver: "Spiel vorbei! Punkte: {score}",
        memoryWin: "Spiel gewonnen! Paare: {pairs}",
        profile: "Profil",
        chatPlaceholder: "Nachricht eingeben...",
        profileError: "Bitte Name und Alter eingeben!",
        profileCreated: "Profil wurde erstellt!",
        noProfiles: "Keine Profile vorhanden.",
        name: "Name",
        age: "Alter",
        delete: "Löschen",
        profileDeleted: "Profil wurde gelöscht!"
    },
    en: { /* Englische Übersetzungen */
        title: "Game Browser",
        menu: "Menu",
        themeToggle: "Toggle Theme",
        stats: "Statistics",
        leaderboard: "Leaderboard",
        backToMenu: "Back to Main Menu",
        language: "Language:",
        startGame: "Start Game",
        restart: "Restart",
        undo: "Undo",
        exportStats: "Export Statistics",
        playerX: "Player X Name",
        playerO: "Player O Name",
        gameMode: "Game Mode:",
        human: "Against Human",
        bot: "Against Bot",
        difficulty: "Difficulty:",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        impossible: "Impossible",
        bestOf: "Best of:",
        round: "Round",
        rounds: "Rounds",
        playerTurn: "{player}'s turn",
        timePlayerX: "Time Player X: ",
        timePlayerO: "Time Player O: ",
        win: "{player} wins!",
        draw: "Draw!",
        moveHistory: "Move History:",
        musicToggle: "Toggle Music",
        toastWin: "{player} has won!",
        toastDraw: "The game ended in a draw!",
        toastError: "Invalid move!",
        c4Win: "Player {player} wins!",
        c4Draw: "Draw!",
        tetrisStart: "Press Start or a key!",
        tetrisGameOver: "Game Over! Score: {score}",
        tetrisLevelUp: "Level {level} reached!",
        tetrisPaused: "Game paused! (Space to resume)",
        snakeGameOver: "Game Over! Score: {score}",
        memoryWin: "Game won! Pairs: {pairs}",
        profile: "Profile",
        chatPlaceholder: "Enter message...",
        profileError: "Please enter name and age!",
        profileCreated: "Profile created!",
        noProfiles: "No profiles available.",
        name: "Name",
        age: "Age",
        delete: "Delete",
        profileDeleted: "Profile deleted!"
    }
};

// Hilfsfunktion für Benachrichtigungen
const showToast = (message, type = 'info') => { /* Zeigt eine Benachrichtigung an */
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    if (type === 'success') toast.style.background = 'rgba(57, 255, 20, 0.8)';
    else if (type === 'error') toast.style.background = 'rgba(255, 0, 0, 0.8)';
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Sound-Manager-Klasse
class SoundManager { /* Verwaltet Audio */
    constructor() {
        this.backgroundMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        this.backgroundMusic.loop = true;
        this.clickSound = new Audio('https://www.freesound.org/data/previews/66/66104_634166-lq.mp3');
        this.winSound = new Audio('https://www.freesound.org/data/previews/171/171671_2437358-lq.mp3');
        this.drawSound = new Audio('https://www.freesound.org/data/previews/156/156031_2704208-lq.mp3');
        this.isMusicPlaying = false;
    }

    playClick() { this.clickSound.play().catch(err => console.error('Click sound error:', err)); } /* Spielt Klick-Sound */
    playWin() { this.winSound.play().catch(err => console.error('Win sound error:', err)); } /* Spielt Gewinn-Sound */
    playDraw() { this.drawSound.play().catch(err => console.error('Draw sound error:', err)); } /* Spielt Unentschieden-Sound */
    toggleMusic() { /* Schaltet Musik ein/aus */
        if (this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.isMusicPlaying = false;
        } else {
            this.backgroundMusic.play().catch(err => console.error('Music play error:', err));
            this.isMusicPlaying = true;
        }
    }
}

// Theme-Manager-Klasse
class ThemeManager { /* Verwaltet das Theme */
    constructor() {
        this.theme = 'dark';
        this.mainElement = document.querySelector('main');
    }

    toggleTheme() { /* Wechselt zwischen Themes */
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.mainElement.classList.toggle('theme-dark');
        this.mainElement.classList.toggle('theme-light');
        document.body.classList.toggle('theme-dark');
        document.body.classList.toggle('theme-light');
    }
}

// Clock-Manager-Klasse
class ClockManager { /* Verwaltet die Uhr */
    constructor() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() { /* Aktualisiert die Uhranzeige */
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');

        const hourDeg = (hours % 12 + minutes / 60) * 30;
        const minuteDeg = minutes * 6;
        const secondDeg = seconds * 6;

        hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
        secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;

        document.getElementById('clockTime').textContent = now.toLocaleTimeString();
    }
}

// Basis-Spielklasse
class Game { /* Abstrakte Klasse für Spiele */
    constructor() {
        if (this.constructor === Game) throw new Error("Abstract class 'Game' cannot be instantiated directly.");
    }
    startGame() {} /* Startet das Spiel */
    resetGame() {} /* Setzt das Spiel zurück */
    showStats() {} /* Zeigt Statistiken */
}

// Spielerklasse
class Player { /* Verwaltet Spielerinformationen */
    constructor(name, symbol) {
        this.name = name;
        this.symbol = symbol;
        this.score = 0;
        this.time = 0;
        this.moves = [];
    }

    makeMove(index) { this.moves.push(index); } /* Fügt Zug hinzu */
}

// Globale Instanzen
const soundManager = new SoundManager(); /* Instanz für Sound */
const themeManager = new ThemeManager(); /* Instanz für Theme */
const clockManager = new ClockManager(); /* Instanz für Uhr */