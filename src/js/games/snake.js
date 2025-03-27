class Snake extends Game {
    constructor() {
        super();
        this.canvas = document.getElementById('snake-board'); // Canvas-Element für das Spiel
        this.ctx = this.canvas.getContext('2d'); // 2D-Kontext für Rendering
        this.gridSize = 20; // Größe eines Gitters
        this.tileCount = this.canvas.width / this.gridSize; // Anzahl der Kacheln
        this.snake = [{ x: 10, y: 10 }]; // Startposition der Schlange
        this.food = { x: 15, y: 15 }; // Startposition des Futters
        this.dx = 0; // Bewegung X-Richtung
        this.dy = 0; // Bewegung Y-Richtung
        this.score = 0; // Punktestand
        this.time = 0; // Spielzeit
        this.gameInterval = null; // Spiel-Intervall
        this.timerInterval = null; // Timer-Intervall
        this.onGameEnd = null; // Callback für Spielende
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.render(); // Initiales Rendern
        this.startTimer(); // Timer starten
    }

    // Spiel starten
    startGame() {
        if (!this.gameInterval) {
            this.gameInterval = setInterval(() => this.update(), 100); // Spiel-Loop starten
            this.startTimer();
        }
    }

    // Spiel aktualisieren
    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head); // Kopf der Schlange bewegen

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10; // Punkte erhöhen
            soundManager.playWin(); // Gewinnsound abspielen
            this.generateFood(); // Neues Futter generieren
        } else {
            this.snake.pop(); // Schwanz kürzen, wenn kein Futter
        }

        if (this.checkCollision()) {
            this.gameOver(); // Spiel beenden bei Kollision
            return;
        }

        this.render(); // Spielbrett rendern
        this.updateScoreboard(); // Punktestand aktualisieren
    }

    // Tasteneingaben verarbeiten
    handleKeyPress(e) {
        if (!this.gameInterval) return;
        switch (e.key) {
            case 'ArrowUp': if (this.dy === 0) { this.dx = 0; this.dy = -1; } break; // Hoch
            case 'ArrowDown': if (this.dy === 0) { this.dx = 0; this.dy = 1; } break; // Runter
            case 'ArrowLeft': if (this.dx === 0) { this.dx = -1; this.dy = 0; } break; // Links
            case 'ArrowRight': if (this.dx === 0) { this.dx = 1; this.dy = 0; } break; // Rechts
        }
    }

    // Futter generieren
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }

    // Kollision prüfen
    checkCollision() {
        const head = this.snake[0];
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) return true; // Wandkollision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) return true; // Selbstkollision
        }
        return false;
    }

    // Spielende
    gameOver() {
        clearInterval(this.gameInterval); // Spiel-Loop stoppen
        this.gameInterval = null;
        this.stopTimer(); // Timer stoppen
        soundManager.playDraw(); // Niederlagensound
        showToast(translations[gameManager.language].snakeGameOver.replace('{score}', this.score), 'info'); // Toast anzeigen
        this.updateScoreboard(); // Punktestand aktualisieren
        if (this.onGameEnd) {
            this.onGameEnd('Spieler', this.score); // Punkte ans Leaderboard übergeben
        }
    }

    // Spiel zurücksetzen
    resetGame() {
        this.snake = [{ x: 10, y: 10 }]; // Schlange zurücksetzen
        this.food = { x: 15, y: 15 }; // Futter zurücksetzen
        this.dx = 0; // Bewegung zurücksetzen
        this.dy = 0;
        this.score = 0; // Punktestand zurücksetzen
        this.time = 0; // Zeit zurücksetzen
        clearInterval(this.gameInterval); // Spiel-Loop stoppen
        this.gameInterval = null;
        this.render(); // Spielbrett rendern
        this.updateScoreboard(); // Punktestand aktualisieren
    }

    // Timer starten
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.time++;
            document.getElementById('snake-time').textContent = this.time; // Zeit anzeigen
        }, 1000);
    }

    // Timer stoppen
    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    // Spielbrett rendern
    render() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Hintergrundfarbe
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'red'; // Futterfarbe
        this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);

        this.ctx.fillStyle = 'green'; // Schlangenfarbe
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
    }

    // Punktestand aktualisieren
    updateScoreboard() {
        document.getElementById('snake-score').textContent = this.score;
        document.getElementById('snake-time').textContent = this.time;
    }
}