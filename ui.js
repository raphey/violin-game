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

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            this.showSettingsScreen();
        });

        // Close settings button
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        closeSettingsBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            this.showCategoryScreen();
        });

        // Reset settings button
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        resetSettingsBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            Settings.reset();
            this.updateSettingsUI();
        });

        // Tempo slider
        const tempoSlider = document.getElementById('tempo-slider');
        const tempoValue = document.getElementById('tempo-value');
        tempoSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            tempoValue.textContent = value;
            Settings.set('tempo', value);
        });

        // Tolerance slider
        const toleranceSlider = document.getElementById('tolerance-slider');
        const toleranceValue = document.getElementById('tolerance-value');
        toleranceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            toleranceValue.textContent = value;
            Settings.set('tolerance', value);
        });

        // Level length slider
        const lengthSlider = document.getElementById('length-slider');
        const lengthValue = document.getElementById('length-value');
        lengthSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            lengthValue.textContent = value;
            Settings.set('levelLength', value);
        });
    },

    // Update settings UI to reflect current values
    updateSettingsUI: function() {
        document.getElementById('tempo-slider').value = Settings.get('tempo');
        document.getElementById('tempo-value').textContent = Settings.get('tempo');

        document.getElementById('tolerance-slider').value = Settings.get('tolerance');
        document.getElementById('tolerance-value').textContent = Settings.get('tolerance');

        document.getElementById('length-slider').value = Settings.get('levelLength');
        document.getElementById('length-value').textContent = Settings.get('levelLength');
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

    // Show settings screen
    showSettingsScreen: function() {
        const categoryScreen = document.getElementById('category-screen');
        const settingsScreen = document.getElementById('settings-screen');
        const levelScreen = document.getElementById('level-screen');
        const gameScreen = document.getElementById('game-screen');
        const celebrationScreen = document.getElementById('celebration-screen');
        const progressContainer = document.getElementById('progress-container');

        categoryScreen.classList.add('hidden');
        settingsScreen.classList.remove('hidden');
        levelScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        celebrationScreen.classList.add('hidden');
        progressContainer.classList.add('hidden');

        // Update UI to reflect current settings
        this.updateSettingsUI();
    },

    // Show category selection screen
    showCategoryScreen: function() {
        const categoryScreen = document.getElementById('category-screen');
        const settingsScreen = document.getElementById('settings-screen');
        const levelScreen = document.getElementById('level-screen');
        const gameScreen = document.getElementById('game-screen');
        const celebrationScreen = document.getElementById('celebration-screen');
        const progressContainer = document.getElementById('progress-container');

        categoryScreen.classList.remove('hidden');
        settingsScreen.classList.add('hidden');
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

        // Enable/disable level buttons based on available patterns
        if (typeof Patterns !== 'undefined' && Patterns.allPatterns) {
            const categoryPatterns = Patterns.allPatterns[this.selectedCategory];
            const levelButtons = document.querySelectorAll('.menu-btn[data-level]');

            levelButtons.forEach(btn => {
                const level = parseInt(btn.getAttribute('data-level'));
                const levelKey = `level${level}`;
                const hasPatterns = categoryPatterns &&
                                  categoryPatterns[levelKey] &&
                                  categoryPatterns[levelKey].length > 0;

                if (hasPatterns) {
                    btn.classList.remove('disabled');
                    btn.disabled = false;
                } else {
                    btn.classList.add('disabled');
                    btn.disabled = true;
                }
            });
        }
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
