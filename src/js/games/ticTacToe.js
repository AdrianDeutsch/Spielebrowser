class TicTacToe extends Game { /* Tic Tac Toe Spielklasse */
    constructor(playerX, playerO, bestOf, difficulty) { /* Initialisiert das Spiel */
        super();
        this.playerX = playerX;
        this.playerO = playerO;
        this.bestOf = bestOf;
        this.difficulty = difficulty;
        this.currentPlayer = this.playerX;
        this.board = Array(9).fill(null);
        this.round = 1;
        this.gameOver = false;
        this.onGameEnd = null; // Callback für Spielende
        this.moveStack = []; // Für Undo
        this.timerX = 0;
        this.timerO = 0;
        this.timerInterval = null;
        this.initGame();
    }

    initGame() { /* Startet das Spiel */
        this.renderBoard();
        this.updateStatus();
        this.startTimer();
        this.updateSidebar();
    }

    renderBoard() { /* Zeichnet das Spielfeld */
        const board = document.getElementById('ttt-board');
        board.innerHTML = '';
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.textContent = cell;
            if (cell === this.playerX.symbol) cellElement.classList.add('X');
            if (cell === this.playerO.symbol) cellElement.classList.add('O');
            cellElement.addEventListener('click', () => this.handleClick(index));
            board.appendChild(cellElement);
        });
    }

    handleClick(index) { /* Behandelt Klicks auf Zellen */
        if (this.gameOver || this.board[index] || (this.difficulty && this.currentPlayer === this.playerO)) return;
        soundManager.playClick();
        this.makeMove(index);
    }

    makeMove(index) { /* Führt einen Zug aus */
        if (!this.board[index]) {
            this.board[index] = this.currentPlayer.symbol;
            this.currentPlayer.makeMove(index);
            this.moveStack.push({ player: this.currentPlayer, index });
            this.renderBoard();

            if (this.checkWin()) {
                this.handleWin();
            } else if (!this.board.includes(null)) {
                this.handleDraw();
            } else {
                this.switchPlayer();
                if (this.difficulty && this.currentPlayer === this.playerO) {
                    this.botMove();
                }
            }
        }
    }

    checkWin() { /* Prüft auf Sieg oder Unentschieden */
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.gameOver = true;
                pattern.forEach(idx => document.querySelectorAll('.cell')[idx].classList.add('winning-cell'));
                if (this.onGameEnd) {
                    this.onGameEnd(this.currentPlayer.symbol, this.playerX.score, this.playerO.score);
                }
                return true;
            }
        }
        if (!this.board.includes(null)) {
            this.gameOver = true;
            if (this.onGameEnd) {
                this.onGameEnd(null, this.playerX.score, this.playerO.score); // Unentschieden
            }
            return true;
        }
        return false;
    }

    handleWin() { /* Verarbeitet einen Sieg */
        this.currentPlayer.score++;
        soundManager.playWin();
        this.stopTimer();
        this.updateSidebar();
        if (this.round < this.bestOf && this.playerX.score <= Math.ceil(this.bestOf / 2) && this.playerO.score <= Math.ceil(this.bestOf / 2)) {
            setTimeout(() => this.nextRound(), 1000);
        } else {
            this.gameOver = true;
        }
    }

    handleDraw() { /* Verarbeitet ein Unentschieden */
        soundManager.playDraw();
        this.stopTimer();
        if (this.round < this.bestOf) {
            setTimeout(() => this.nextRound(), 1000);
        } else {
            this.gameOver = true;
        }
    }

    switchPlayer() { /* Wechselt den Spieler */
        this.currentPlayer = this.currentPlayer === this.playerX ? this.playerO : this.playerX;
        this.updateStatus();
    }

    botMove() { /* Führt einen Bot-Zug aus */
        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getBlockingMove() || this.getRandomMove();
                break;
            case 'hard':
                move = this.getWinningMove(this.playerO) || this.getBlockingMove() || this.getRandomMove();
                break;
            case 'impossible':
                move = this.minimax(this.board, this.playerO).index;
                break;
        }
        if (move !== undefined) {
            setTimeout(() => this.makeMove(move), 500);
        }
    }

    getRandomMove() { /* Wählt einen zufälligen Zug */
        const available = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    getWinningMove(player) { /* Findet einen Gewinnzug */
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                const testBoard = [...this.board];
                testBoard[i] = player.symbol;
                if (this.checkWinOnBoard(testBoard)) return i;
            }
        }
        return null;
    }

    getBlockingMove() { /* Findet einen Blockzug */
        return this.getWinningMove(this.playerX);
    }

    checkWinOnBoard(board) { /* Prüft Gewinn auf einem Testbrett */
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    }

    minimax(board, player, depth = 0) { /* Minimax-Algorithmus für Bot */
        const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (this.checkWinOnBoard(board)) {
            return { score: player === this.playerO ? 10 - depth : depth - 10 };
        }
        if (available.length === 0) return { score: 0 };

        let best = { score: player === this.playerO ? -Infinity : Infinity };
        for (let move of available) {
            const newBoard = [...board];
            newBoard[move] = player.symbol;
            const result = this.minimax(newBoard, player === this.playerO ? this.playerX : this.playerO, depth + 1);
            if (player === this.playerO) {
                if (result.score > best.score) best = { score: result.score, index: move };
            } else {
                if (result.score < best.score) best = { score: result.score, index: move };
            }
        }
        return best;
    }

    startTimer() { /* Startet den Timer */
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.currentPlayer === this.playerX) {
                this.timerX++;
                document.getElementById('timerX').textContent = this.timerX;
            } else {
                this.timerO++;
                document.getElementById('timerO').textContent = this.timerO;
            }
        }, 1000);
    }

    stopTimer() { /* Stoppt den Timer */
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatus() { /* Aktualisiert den Statustext */
        const status = document.getElementById('status');
        status.textContent = this.gameOver
            ? (this.board.includes(null) ? translations[gameManager.language].win.replace('{player}', this.currentPlayer.name) : translations[gameManager.language].draw)
            : translations[gameManager.language].playerTurn.replace('{player}', this.currentPlayer.name);
    }

    updateSidebar() { /* Aktualisiert die Seitenleiste */
        document.getElementById('playerXName').textContent = this.playerX.name;
        document.getElementById('playerOName').textContent = this.playerO.name;
        document.getElementById('scoreX').textContent = this.playerX.score;
        document.getElementById('scoreO').textContent = this.playerO.score;
        document.getElementById('timerX').textContent = this.timerX;
        document.getElementById('timerO').textContent = this.timerO;
        document.getElementById('playerXNameTimer').textContent = this.playerX.name;
        document.getElementById('playerONameTimer').textContent = this.playerO.name;
        document.getElementById('current-round').textContent = this.round;
        document.getElementById('total-rounds').textContent = this.bestOf;

        const history = document.getElementById('move-history');
        history.innerHTML = `<strong>${translations[gameManager.language].moveHistory}</strong><br>`;
        this.moveStack.forEach((move, idx) => {
            history.innerHTML += `${idx + 1}. ${move.player.name} -> ${move.index + 1}<br>`;
        });
    }

    nextRound() { /* Startet die nächste Runde */
        this.board = Array(9).fill(null);
        this.currentPlayer = this.playerX;
        this.round++;
        this.gameOver = false;
        this.moveStack = [];
        this.renderBoard();
        this.updateStatus();
        this.startTimer();
        this.updateSidebar();
    }

    resetGame() { /* Setzt das Spiel zurück */
        this.board = Array(9).fill(null);
        this.currentPlayer = this.playerX;
        this.round = 1;
        this.gameOver = false;
        this.playerX.score = 0;
        this.playerO.score = 0;
        this.timerX = 0;
        this.timerO = 0;
        this.moveStack = [];
        this.renderBoard();
        this.updateStatus();
        this.startTimer();
        this.updateSidebar();
    }

    undoMove() { /* Macht den letzten Zug rückgängig */
        if (this.moveStack.length === 0 || this.gameOver) return;
        const lastMove = this.moveStack.pop();
        this.board[lastMove.index] = null;
        this.currentPlayer = lastMove.player;
        this.renderBoard();
        this.updateStatus();
        this.updateSidebar();
    }

    showStats() { /* Zeigt Spielstatistiken */
        const statsScreen = document.getElementById('tictactoe-stats-screen');
        const statsContent = document.getElementById('ttt-stats-content');
        statsContent.innerHTML = `
            <p>${this.playerX.name}: ${this.playerX.score} wins, ${this.timerX}s</p>
            <p>${this.playerO.name}: ${this.playerO.score} wins, ${this.timerO}s</p>
            <p>Rounds played: ${this.round}</p>
        `;
        gameManager.showScreen('tictactoe-stats-screen');
    }
}