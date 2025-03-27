class ConnectFour extends Game {
    constructor() {
        super();
        this.rows = 6; // Anzahl der Reihen
        this.cols = 7; // Anzahl der Spalten
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill('')); // Spielbrett initialisieren
        this.currentPlayer = 'red'; // Startspieler
        this.redScore = 0; // Anzahl Siege Rot
        this.yellowScore = 0; // Anzahl Siege Gelb
        this.redTime = 0; // Zeit Rot
        this.yellowTime = 0; // Zeit Gelb
        this.round = 1; // Aktuelle Runde
        this.timerInterval = null; // Timer-Intervall
        this.onGameEnd = null; // Callback für Spielende
        this.renderBoard(); // Spielbrett rendern
        this.startTimer(); // Timer starten
        this.updateScoreboard(); // Punktestand aktualisieren
        this.updateRoundInfo(); // Rundendaten aktualisieren
    }

    // Spielbrett rendern
    renderBoard() {
        const board = document.getElementById('c4-board');
        board.innerHTML = ''; // Brett leeren
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                if (this.board[row][col]) {
                    cellElement.classList.add(this.board[row][col]); // Farbe hinzufügen
                    cellElement.textContent = this.board[row][col] === 'red' ? 'R' : 'Y'; // Symbol anzeigen
                }
                cellElement.addEventListener('click', () => this.makeMove(col));
                board.appendChild(cellElement);
            }
        }
        this.updateStatus(); // Status aktualisieren
    }

    // Statusanzeige aktualisieren
    updateStatus() {
        document.getElementById('c4-status').textContent = translations[gameManager.language].playerTurn.replace('{player}', this.currentPlayer === 'red' ? 'Rot' : 'Gelb');
    }

    // Punktestand aktualisieren
    updateScoreboard() {
        document.getElementById('c4-score-red').textContent = this.redScore;
        document.getElementById('c4-score-yellow').textContent = this.yellowScore;
        document.getElementById('c4-timer-red').textContent = this.redTime;
        document.getElementById('c4-timer-yellow').textContent = this.yellowTime;
    }

    // Rundendaten aktualisieren
    updateRoundInfo() {
        document.getElementById('c4-round').textContent = this.round;
    }

    // Timer starten
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.currentPlayer === 'red') this.redTime++; // Zeit für Rot erhöhen
            else this.yellowTime++; // Zeit für Gelb erhöhen
            this.updateScoreboard();
        }, 1000);
    }

    // Timer stoppen
    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    // Zug machen
    makeMove(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.board[row][col]) {
                this.board[row][col] = this.currentPlayer; // Stein platzieren
                soundManager.playClick(); // Klicksound abspielen
                this.renderBoard(); // Brett neu rendern
                if (this.checkWinner(row, col)) return; // Gewinner prüfen
                if (this.checkDraw()) return; // Unentschieden prüfen
                this.switchPlayer(); // Spieler wechseln
                this.startTimer(); // Timer neu starten
                return;
            }
        }
        showToast(translations[gameManager.language].toastError, 'error'); // Fehlermeldung bei voller Spalte
    }

    // Spieler wechseln
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        this.updateStatus();
    }

    // Gewinner prüfen
    checkWinner(row, col) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // Richtungen: horizontal, vertikal, diagonal
        for (let [dr, dc] of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.board[r][c] !== this.currentPlayer) break;
                count++; // Steine in eine Richtung zählen
            }
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.board[r][c] !== this.currentPlayer) break;
                count++; // Steine in entgegengesetzter Richtung zählen
            }
            if (count >= 4) { // 4 oder mehr in einer Linie
                if (this.currentPlayer === 'red') this.redScore++; // Siege für Rot erhöhen
                else this.yellowScore++; // Siege für Gelb erhöhen
                this.round++; // Nächste Runde
                this.stopTimer(); // Timer stoppen
                this.updateScoreboard(); // Punktestand aktualisieren
                soundManager.playWin(); // Gewinnsound abspielen
                const timeTaken = this.currentPlayer === 'red' ? this.redTime : this.yellowTime;
                const points = Math.max(100 - timeTaken, 10); // Punkte: 100 - Zeit, mindestens 10
                showToast(translations[gameManager.language].c4Win.replace('{player}', this.currentPlayer === 'red' ? 'Rot' : 'Gelb'), 'success'); // Sieg-Meldung
                document.getElementById('c4-status').textContent = translations[gameManager.language].c4Win.replace('{player}', this.currentPlayer === 'red' ? 'Rot' : 'Gelb');
                if (this.onGameEnd) {
                    this.onGameEnd(this.currentPlayer === 'red' ? 'Rot' : 'Gelb', points); // Punkte ans Leaderboard
                }
                setTimeout(() => this.resetGame(), 2000); // Spiel nach 2 Sekunden zurücksetzen
                return true;
            }
        }
        return false;
    }

    // Unentschieden prüfen
    checkDraw() {
        if (this.board.every(row => row.every(cell => cell))) { // Brett voll?
            this.round++; // Nächste Runde
            this.stopTimer(); // Timer stoppen
            soundManager.playDraw(); // Unentschiedensound abspielen
            showToast(translations[gameManager.language].c4Draw, 'info'); // Unentschieden-Meldung
            document.getElementById('c4-status').textContent = translations[gameManager.language].c4Draw;
            if (this.onGameEnd) {
                this.onGameEnd(null, 0); // Unentschieden: 0 Punkte
            }
            setTimeout(() => this.resetGame(), 2000); // Spiel nach 2 Sekunden zurücksetzen
            return true;
        }
        return false;
    }

    // Spiel zurücksetzen
    resetGame() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill('')); // Brett leeren
        this.currentPlayer = 'red'; // Startspieler zurücksetzen
        this.redTime = 0; // Zeit Rot zurücksetzen
        this.yellowTime = 0; // Zeit Gelb zurücksetzen
        this.renderBoard(); // Brett rendern
        this.startTimer(); // Timer starten
    }
}