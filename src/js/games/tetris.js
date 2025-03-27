class Tetris extends Game {
    constructor() {
        super();
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.highscore = parseInt(localStorage.getItem('tetrisHighscore')) || 0;
        this.gameInterval = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]] // J
        ];
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.bag = []; // Neuer Beutel für das Bag-System
        this.nextPiece = this.getRandomPiece(); // Initialisiere den ersten nächsten Block
        this.onGameEnd = null; // Callback für Spielende
        this.renderBoard();
        this.updateInfo();
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // Funktion zum Auffüllen des Beutels
    fillBag() {
        this.bag = [...this.pieces]; // Kopiere alle Stücke in den Beutel
        // Mische den Beutel
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; // Tausche Elemente
        }
    }

    getRandomPiece() {
        // Wenn der Beutel leer ist, auffüllen
        if (this.bag.length === 0) {
            this.fillBag();
        }
        // Nimm das erste Stück aus dem Beutel und entferne es
        const piece = this.bag.shift();
        return piece.map(row => [...row]); // Erstelle eine Kopie des Stücks
    }

    startGame() {
        if (this.isGameOver) this.resetGame();
        if (!this.gameInterval) {
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
            this.currentX = 4;
            this.currentY = 0;
            this.gameInterval = setInterval(() => this.update(), 500 - (this.level - 1) * 50);
            this.updateInfo();
            this.renderBoard();
            document.getElementById('tetris-status').textContent = translations[gameManager.language].tetrisStart;
        }
    }

    update() {
        if (this.isPaused) return;
        if (!this.moveDown()) {
            this.mergePiece();
            this.clearLines();
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
            this.currentX = 4;
            this.currentY = 0;
            if (this.checkCollision()) {
                this.gameOver();
                return;
            }
            this.renderBoard();
        }
    }

    moveDown() {
        this.currentY++;
        if (this.checkCollision()) {
            this.currentY--;
            return false;
        }
        this.renderBoard();
        return true;
    }

    moveLeft() {
        this.currentX--;
        if (this.checkCollision()) this.currentX++;
        else this.renderBoard();
    }

    moveRight() {
        this.currentX++;
        if (this.checkCollision()) this.currentX--;
        else this.renderBoard();
    }

    rotatePiece() {
        const rotated = this.currentPiece[0].map((_, index) =>
            this.currentPiece.map(row => row[index]).reverse()
        );
        const previous = this.currentPiece;
        this.currentPiece = rotated;
        if (this.checkCollision()) this.currentPiece = previous;
        else this.renderBoard();
    }

    handleKeyPress(e) {
        if (this.isGameOver || !this.gameInterval) return;
        switch (e.key) {
            case 'ArrowLeft': this.moveLeft(); break;
            case 'ArrowRight': this.moveRight(); break;
            case 'ArrowDown': this.moveDown(); break;
            case 'ArrowUp': this.rotatePiece(); break;
            case ' ': this.togglePause(); break;
        }
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    const newX = this.currentX + x;
                    const newY = this.currentY + y;
                    if (newX < 0 || newX >= 10 || newY >= 20 || (newY >= 0 && this.board[newY][newX])) return true;
                }
            }
        }
        return false;
    }

    mergePiece() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x]) {
                    this.board[this.currentY + y][this.currentX + x] = 1;
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.board.length - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared) {
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.score / 1000) + 1;
            if (this.score > this.highscore) {
                this.highscore = this.score;
                localStorage.setItem('tetrisHighscore', this.highscore);
            }
            showToast(translations[gameManager.language].tetrisLevelUp.replace('{level}', this.level), 'success');
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => this.update(), 500 - (this.level - 1) * 50);
        }
        this.updateInfo();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('tetris-status').textContent = this.isPaused
            ? translations[gameManager.language].tetrisPaused
            : translations[gameManager.language].playerTurn.replace('{player}', 'You');
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        this.gameInterval = null;
        soundManager.playDraw();
        showToast(translations[gameManager.language].tetrisGameOver.replace('{score}', this.score), 'info');
        this.updateInfo();
        if (this.onGameEnd) {
            this.onGameEnd('Player', this.score); // Spielername und Punkte
        }
    }

    resetGame() {
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.bag = []; // Beutel zurücksetzen
        this.nextPiece = this.getRandomPiece();
        clearInterval(this.gameInterval);
        this.gameInterval = null;
        this.renderBoard();
        this.updateInfo();
    }

    renderBoard() {
        const board = document.getElementById('tetris-board');
        board.innerHTML = '';
        const newBoard = this.board.map(row => [...row]);
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x]) {
                        const newY = this.currentY + y;
                        const newX = this.currentX + x;
                        if (newY >= 0 && newY < 20 && newX >= 0 && newX < 10) {
                            newBoard[newY][newX] = 1;
                        }
                    }
                }
            }
        }
        newBoard.forEach(row => {
            row.forEach(cell => {
                const block = document.createElement('div');
                block.classList.add('tetris-block');
                if (cell) block.classList.add('filled');
                board.appendChild(block);
            });
        });

        const nextBoard = document.getElementById('next-piece-board');
        nextBoard.innerHTML = '';
        const rows = this.nextPiece.length;
        const cols = this.nextPiece[0].length;
        nextBoard.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
        nextBoard.style.width = `${cols * 25}px`;
        nextBoard.style.height = `${rows * 25}px`;

        this.nextPiece.forEach(row => {
            row.forEach(cell => {
                const block = document.createElement('div');
                block.classList.add('tetris-block');
                if (cell) block.classList.add('filled');
                nextBoard.appendChild(block);
            });
        });
    }

    updateInfo() {
        document.getElementById('tetris-score').textContent = this.score;
        document.getElementById('tetris-level').textContent = this.level;
        document.getElementById('tetris-highscore').textContent = this.highscore;
    }
}