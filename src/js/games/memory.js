class Memory extends Game {
    constructor() {
        super();
        this.boardSize = 4; // Größe des Spielfelds (4x4)
        this.cards = []; // Array der Karten
        this.flippedCards = []; // Aufgedeckte Karten
        this.matchedPairs = 0; // Anzahl gefundener Paare
        this.totalPairs = (this.boardSize * this.boardSize) / 2; // Gesamtanzahl Paare (8 bei 4x4)
        this.time = 0; // Spielzeit in Sekunden
        this.timerInterval = null; // Timer-Intervall
        this.onGameEnd = null; // Callback für Spielende
        this.initializeCards(); // Karten initialisieren
        this.renderBoard(); // Spielbrett rendern
        this.startTimer(); // Timer starten
    }

    // Karten initialisieren
    initializeCards() {
        const uniqueSymbols = ['★', '♥', '♠', '♣', '♦', '●', '▲', '▼']; // Eindeutige Symbole
        const symbols = [...uniqueSymbols, ...uniqueSymbols]; // Jedes Symbol verdoppeln
        this.cards = symbols
            .sort(() => Math.random() - 0.5) // Karten mischen
            .map((symbol, index) => ({
                id: index,
                symbol,
                isFlipped: false,
                isMatched: false
            }));
    }

    // Spiel starten
    startGame() {
        this.matchedPairs = 0; // Paare zurücksetzen
        this.time = 0; // Zeit zurücksetzen
        this.flippedCards = []; // Aufgedeckte Karten leeren
        this.initializeCards(); // Neue Karten generieren
        this.renderBoard(); // Spielbrett rendern
        this.startTimer(); // Timer starten
    }

    // Spielbrett rendern
    renderBoard() {
        const board = document.getElementById('memory-board');
        if (!board) {
            console.error('memory-board nicht gefunden');
            return;
        }
        board.innerHTML = ''; // Brett leeren
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            if (card.isFlipped || card.isMatched) {
                cardElement.textContent = card.symbol; // Symbol anzeigen
                if (card.isMatched) cardElement.classList.add('matched'); // Stil für gefundene Paare
                else cardElement.classList.add('flipped'); // Stil für aufgedeckte Karten
            }
            cardElement.addEventListener('click', () => this.flipCard(card));
            board.appendChild(cardElement);
        });
        this.updateScoreboard(); // Punktestand aktualisieren
    }

    // Karte umdrehen
    flipCard(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped && !card.isMatched) {
            card.isFlipped = true; // Karte umdrehen
            this.flippedCards.push(card); // Karte zur Liste hinzufügen
            soundManager.playClick(); // Klicksound abspielen
            this.renderBoard(); // Brett neu rendern
            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkMatch(), 1000); // Nach 1 Sekunde Übereinstimmung prüfen
            }
        }
    }

    // Übereinstimmung prüfen
    checkMatch() {
        if (this.flippedCards[0].symbol === this.flippedCards[1].symbol) {
            this.flippedCards.forEach(card => card.isMatched = true); // Paar als gefunden markieren
            this.matchedPairs++; // Anzahl gefundener Paare erhöhen
            soundManager.playWin(); // Gewinnsound abspielen
            if (this.matchedPairs === this.totalPairs) { // Wenn alle Paare gefunden
                this.stopTimer(); // Timer stoppen
                showToast(translations[gameManager.language].memoryWin.replace('{pairs}', this.matchedPairs), 'success'); // Sieg-Meldung
                if (this.onGameEnd) {
                    this.onGameEnd('Spieler', this.matchedPairs); // Punkte ans Leaderboard übergeben
                }
            }
        } else {
            this.flippedCards.forEach(card => card.isFlipped = false); // Karten zurückdrehen
            soundManager.playDraw(); // Fehlsound abspielen
        }
        this.flippedCards = []; // Aufgedeckte Karten leeren
        this.renderBoard(); // Brett neu rendern
    }

    // Timer starten
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.time++;
            document.getElementById('memory-time').textContent = this.time; // Zeit anzeigen
        }, 1000);
    }

    // Timer stoppen
    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    // Spiel zurücksetzen
    resetGame() {
        this.matchedPairs = 0; // Paare zurücksetzen
        this.time = 0; // Zeit zurücksetzen
        this.flippedCards = []; // Aufgedeckte Karten leeren
        this.initializeCards(); // Neue Karten generieren
        this.renderBoard(); // Spielbrett rendern
        this.startTimer(); // Timer starten
    }

    // Punktestand aktualisieren
    updateScoreboard() {
        document.getElementById('memory-pairs').textContent = this.matchedPairs; // Gefundene Paare anzeigen
        document.getElementById('memory-time').textContent = this.time; // Zeit anzeigen
    }
}