// Game state
let currentWord = '';
let guessedLetters = new Set();
let wrongGuesses = 0;
const maxWrongGuesses = 6;
const recentWords = [];
const maxRecentWords = 10;

// Streak tracking
let winStreak = 0;
let streakSpareGuesses = 0;

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const status = document.getElementById('status');
const guessesRemaining = document.getElementById('guessesRemaining');
const newGameBtn = document.getElementById('newGameBtn');
const wordListSelect = document.getElementById('wordList');

// Body parts to reveal in order
const bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// Initialize keyboard
function createKeyboard() {
    const rows = [
        'abcdefghi',
        'jklmnopqr',
        'stuvwxyz'
    ];

    keyboard.innerHTML = '';
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';

        row.split('').forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.dataset.letter = letter;
            key.addEventListener('click', () => handleGuess(letter));
            rowDiv.appendChild(key);
        });

        keyboard.appendChild(rowDiv);
    });
}

// Update word display
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    currentWord.split('').forEach(letter => {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        if (letter === ' ') {
            slot.style.border = 'none';
            slot.style.width = '20px';
        } else {
            slot.textContent = guessedLetters.has(letter.toLowerCase()) ? letter : '';
        }
        wordDisplay.appendChild(slot);
    });
}

// Update hangman drawing
function updateHangman() {
    bodyParts.forEach((part, index) => {
        const element = document.getElementById(part);
        if (index < wrongGuesses) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
}

// Update guesses remaining text
function updateGuessesRemaining() {
    const remaining = maxWrongGuesses - wrongGuesses;
    guessesRemaining.textContent = `${remaining} incorrect guess${remaining !== 1 ? 'es' : ''} remaining`;
}

// Check win condition
function checkWin() {
    return currentWord.split('').every(letter =>
        letter === ' ' || guessedLetters.has(letter.toLowerCase())
    );
}

// Handle letter guess
function handleGuess(letter) {
    if (guessedLetters.has(letter)) return;

    guessedLetters.add(letter);
    const key = document.querySelector(`[data-letter="${letter}"]`);

    if (currentWord.toLowerCase().includes(letter)) {
        key.classList.add('correct');
    } else {
        key.classList.add('wrong');
        wrongGuesses++;
        updateHangman();
    }

    key.disabled = true;
    updateWordDisplay();
    updateGuessesRemaining();

    // Check game end conditions
    if (checkWin()) {
        endGame(true);
    } else if (wrongGuesses >= maxWrongGuesses) {
        endGame(false);
    }
}

// End game
function endGame(won) {
    // Disable all keys
    document.querySelectorAll('.key').forEach(key => {
        key.disabled = true;
    });

    if (won) {
        const spareGuesses = maxWrongGuesses - wrongGuesses;
        winStreak++;
        streakSpareGuesses += spareGuesses;

        if (winStreak >= 2) {
            status.textContent = `You won! Streak: ${winStreak} wins, ${streakSpareGuesses} spare guesses`;
        } else {
            status.textContent = 'You won!';
        }
        status.className = 'status win';
    } else {
        // Reset streak on loss
        winStreak = 0;
        streakSpareGuesses = 0;

        status.textContent = `Game Over! The word was: ${currentWord}`;
        status.className = 'status lose';
        // Reveal the word
        wordDisplay.innerHTML = '';
        currentWord.split('').forEach(letter => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            if (letter === ' ') {
                slot.style.border = 'none';
                slot.style.width = '20px';
            } else {
                slot.textContent = letter;
            }
            wordDisplay.appendChild(slot);
        });
    }
    guessesRemaining.textContent = '';
}

// Select a word, avoiding recently used words
function selectWord(words) {
    let word;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        word = words[Math.floor(Math.random() * words.length)];
        attempts++;
    } while (recentWords.includes(word) && attempts < maxAttempts);

    // Add to recent words and trim to max size
    recentWords.push(word);
    if (recentWords.length > maxRecentWords) {
        recentWords.shift();
    }

    return word;
}

// Start new game
function newGame() {
    const selectedList = wordListSelect.value;
    const words = wordLists[selectedList];
    currentWord = selectWord(words);
    guessedLetters = new Set();
    wrongGuesses = 0;

    status.textContent = '';
    status.className = 'status';

    createKeyboard();
    updateWordDisplay();
    updateHangman();
    updateGuessesRemaining();
}

// Physical keyboard support
document.addEventListener('keydown', (e) => {
    const letter = e.key.toLowerCase();
    if (/^[a-z]$/.test(letter)) {
        const key = document.querySelector(`[data-letter="${letter}"]`);
        if (key && !key.disabled) {
            handleGuess(letter);
        }
    }
});

// Event listeners
newGameBtn.addEventListener('click', newGame);
wordListSelect.addEventListener('change', newGame);

// Start the game
newGame();
