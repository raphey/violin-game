// UI Controller
// Handles all user interface updates and interactions

const UI = {
    selectedCategory: null,
    selectedLevel: null,

    // Initialize UI and set up event listeners
    init: function() {
        this.setupEventListeners();
        this.showCategoryScreen();
    },

    // Set up all button click handlers
    setupEventListeners: function() {
        // Category buttons
        const categoryButtons = document.querySelectorAll('.menu-btn[data-category]');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                if (btn.classList.contains('disabled')) return;

                const category = btn.getAttribute('data-category');
                this.selectedCategory = category;

                if (typeof Sounds !== 'undefined') {
                    Sounds.playClick();
                }

                // Request microphone permission here (not during gameplay)
                try {
                    await Recording.init();
                    this.showLevelScreen();
                } catch (error) {
                    alert('Microphone access is required to play. Please allow microphone access and try again.');
                    console.error('Microphone error:', error);
                }
            });
        });

        // Level buttons
        const levelButtons = document.querySelectorAll('.menu-btn[data-level]');
        levelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('disabled')) return;

                const level = parseInt(btn.getAttribute('data-level'));
                this.selectedLevel = level;

                if (typeof Sounds !== 'undefined') {
                    Sounds.playClick();
                }

                this.startGame();
            });
        });

        // Play again button
        const playAgainBtn = document.getElementById('play-again-btn');
        playAgainBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            this.showCategoryScreen();
        });

        // Start button
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            if (startBtn.disabled) return;

            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            Game.startGame();
        });
    },

    // Update the pattern display
    updatePattern: function(pattern) {
        const patternDisplay = document.getElementById('pattern-notes');
        // Display notes in a readable format
        const notesText = pattern.notes.map((note, i) => {
            const beats = pattern.durations[i];
            return `${note} (${beats}♩)`;
        }).join(' - ');
        patternDisplay.textContent = notesText;
    },

    // Update the progress bar
    updateProgress: function(current, total) {
        const counter = document.getElementById('question-counter');
        counter.textContent = `Question ${current} of ${total}`;

        const progressFill = document.getElementById('progress-fill');
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
    },

    // Show status message
    showStatus: function(message) {
        const statusDisplay = document.getElementById('status-display');
        statusDisplay.textContent = message;
    },

    // Show/hide recording indicator
    showRecordingIndicator: function(show) {
        const indicator = document.getElementById('recording-indicator');
        if (show) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    },

    // Show visual feedback for correct answer
    showCorrectFeedback: function() {
        const feedback = document.getElementById('feedback-visual');
        feedback.classList.add('correct');

        // Clear after animation
        setTimeout(() => {
            feedback.classList.remove('correct');
        }, 700);
    },

    // Show visual feedback for wrong answer
    showWrongFeedback: function() {
        const feedback = document.getElementById('feedback-visual');
        feedback.classList.add('wrong');

        // Clear after animation
        setTimeout(() => {
            feedback.classList.remove('wrong');
        }, 900);
    },

    // Enable/disable start button
    enableStartButton: function() {
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
    },

    disableStartButton: function() {
        const startBtn = document.getElementById('start-btn');
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
    },

    // Show the celebration screen
    showCelebration: function(score, total, level) {
        const gameScreen = document.getElementById('game-screen');
        const celebrationScreen = document.getElementById('celebration-screen');
        const progressContainer = document.getElementById('progress-container');

        gameScreen.classList.add('hidden');
        celebrationScreen.classList.remove('hidden');
        progressContainer.classList.add('hidden');

        // Update celebration text
        const title = document.getElementById('celebration-title');
        const scoreText = document.getElementById('celebration-score');

        if (level === 'perfect') {
            title.textContent = 'PERFECT! 🌟🎻🦄';
            scoreText.textContent = `You got ${score} out of ${total}.\nLet's play again!`;
        } else if (level === 'great') {
            title.textContent = 'Amazing! ✨🎵';
            scoreText.textContent = `You got ${score} out of ${total}.\nLet's play again!`;
        } else if (level === 'good') {
            title.textContent = 'Great Job! 🎉';
            scoreText.textContent = `You got ${score} out of ${total}.\nLet's play again!`;
        } else if (level === 'okay') {
            title.textContent = 'Good Job! 🎉';
            scoreText.textContent = `You got ${score} out of ${total}.\nLet's play again!`;
        } else {
            title.textContent = '';
            scoreText.textContent = `You got ${score} out of ${total}.\nLet's play again!`;
        }
    },

    // Show category selection screen
    showCategoryScreen: function() {
        const categoryScreen = document.getElementById('category-screen');
        const levelScreen = document.getElementById('level-screen');
        const gameScreen = document.getElementById('game-screen');
        const celebrationScreen = document.getElementById('celebration-screen');
        const progressContainer = document.getElementById('progress-container');

        categoryScreen.classList.remove('hidden');
        levelScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        celebrationScreen.classList.add('hidden');
        progressContainer.classList.add('hidden');
    },

    // Show level selection screen
    showLevelScreen: function() {
        const categoryScreen = document.getElementById('category-screen');
        const levelScreen = document.getElementById('level-screen');
        const progressContainer = document.getElementById('progress-container');

        categoryScreen.classList.add('hidden');
        levelScreen.classList.remove('hidden');
        progressContainer.classList.add('hidden');
    },

    // Start the game
    startGame: function() {
        const levelScreen = document.getElementById('level-screen');
        const gameScreen = document.getElementById('game-screen');
        const progressContainer = document.getElementById('progress-container');

        levelScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        progressContainer.classList.remove('hidden');

        // Initialize the game with selected settings
        Game.init(this.selectedCategory, this.selectedLevel);
    }
};

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
