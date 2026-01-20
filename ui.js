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

        // Level buttons are now dynamically created in showLevelScreen()
        // Event listeners are attached when buttons are created

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

        // Reset completion button
        const resetCompletionBtn = document.getElementById('reset-completion-btn');
        resetCompletionBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }
            if (confirm('Are you sure you want to reset all level completion data? This cannot be undone.')) {
                if (typeof CompletionTracker !== 'undefined') {
                    CompletionTracker.resetAll();
                    this.updateCategoryCompletionIndicators();
                    alert('All completion data has been reset!');
                }
            }
        });

        // Home button
        const homeBtn = document.getElementById('home-btn');
        homeBtn.addEventListener('click', () => {
            if (typeof Sounds !== 'undefined') {
                Sounds.playClick();
            }

            // Stop recording if in progress
            if (typeof Recording !== 'undefined' && Recording.audioRecorder && Recording.audioRecorder.state === 'recording') {
                console.log('Stopping recording due to home button click');
                Recording.audioRecorder.stop();
            }

            // Reset game state
            if (typeof Game !== 'undefined') {
                Game.isPlaying = false;
            }

            this.showCategoryScreen();
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
            const value = parseFloat(e.target.value);
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

        // Show notes checkbox
        const showNotesCheckbox = document.getElementById('show-notes-checkbox');
        showNotesCheckbox.addEventListener('change', (e) => {
            const value = e.target.checked;
            Settings.set('showNotes', value);
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

        document.getElementById('show-notes-checkbox').checked = Settings.get('showNotes');
    },

    // Update the pattern display
    updatePattern: function(pattern) {
        const patternDisplay = document.getElementById('pattern-display');
        const patternNotes = document.getElementById('pattern-notes');

        // Only show notes if setting is enabled
        if (Settings.get('showNotes')) {
            patternDisplay.style.display = 'block';
            const notesText = pattern.notes.map((note, i) => {
                const beats = pattern.durations[i];
                return `${note} (${beats}♩)`;
            }).join(' - ');
            patternNotes.textContent = notesText;
        } else {
            patternDisplay.style.display = 'none';
            patternNotes.textContent = '';
        }
    },

    // Clear the pattern display
    clearPattern: function() {
        const patternDisplay = document.getElementById('pattern-display');
        const patternNotes = document.getElementById('pattern-notes');

        if (!Settings.get('showNotes')) {
            patternDisplay.style.display = 'none';
        }
        patternNotes.textContent = '';
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
        const homeBtn = document.getElementById('home-btn');

        gameScreen.classList.add('hidden');
        celebrationScreen.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        homeBtn.classList.remove('hidden');

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
        const homeBtn = document.getElementById('home-btn');

        categoryScreen.classList.add('hidden');
        settingsScreen.classList.remove('hidden');
        levelScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        celebrationScreen.classList.add('hidden');
        progressContainer.classList.add('hidden');
        homeBtn.classList.remove('hidden');

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
        const homeBtn = document.getElementById('home-btn');

        categoryScreen.classList.remove('hidden');
        settingsScreen.classList.add('hidden');
        levelScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        celebrationScreen.classList.add('hidden');
        progressContainer.classList.add('hidden');
        homeBtn.classList.add('hidden');

        // Update category completion indicators
        this.updateCategoryCompletionIndicators();
    },

    // Update completion indicators on category buttons
    updateCategoryCompletionIndicators: function() {
        if (typeof CompletionTracker === 'undefined') return;

        const categoryButtons = document.querySelectorAll('.menu-btn[data-category]');
        categoryButtons.forEach(btn => {
            if (btn.classList.contains('disabled')) return;

            const category = btn.getAttribute('data-category');
            const completion = CompletionTracker.getCategoryCompletion(category);

            // Store original text if not already stored
            if (!btn.hasAttribute('data-original-text')) {
                btn.setAttribute('data-original-text', btn.innerHTML);
            }

            const originalText = btn.getAttribute('data-original-text');

            // Add checkmark if all levels completed
            if (completion.complete && completion.total > 0) {
                btn.innerHTML = `${originalText} ✓`;
            } else {
                btn.innerHTML = originalText;
            }
        });
    },

    // Show level selection screen
    showLevelScreen: function() {
        const categoryScreen = document.getElementById('category-screen');
        const levelScreen = document.getElementById('level-screen');
        const progressContainer = document.getElementById('progress-container');
        const homeBtn = document.getElementById('home-btn');

        categoryScreen.classList.add('hidden');
        levelScreen.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        homeBtn.classList.remove('hidden');

        // Dynamically create level buttons based on available patterns
        const levelButtonsContainer = document.getElementById('level-buttons-container');
        levelButtonsContainer.innerHTML = ''; // Clear existing buttons

        if (typeof Patterns !== 'undefined' && Patterns.allPatterns) {
            const categoryPatterns = Patterns.allPatterns[this.selectedCategory];

            if (categoryPatterns) {
                // Find all levels that have patterns
                const availableLevels = [];
                for (let i = 1; i <= 10; i++) { // Check up to level 10
                    const levelKey = `level${i}`;
                    if (categoryPatterns[levelKey] && categoryPatterns[levelKey].length > 0) {
                        availableLevels.push(i);
                    }
                }

                // Create a button for each available level
                availableLevels.forEach(level => {
                    const btn = document.createElement('button');
                    btn.className = 'menu-btn';
                    btn.setAttribute('data-level', level);

                    // Get completion status
                    let completionIcon = '';
                    if (typeof CompletionTracker !== 'undefined') {
                        const status = CompletionTracker.getCompletion(
                            this.selectedCategory,
                            level
                        );
                        console.log(`Level ${level} completion status:`, {
                            category: this.selectedCategory,
                            level,
                            status,
                            PERFECT: CompletionTracker.PERFECT,
                            ADEQUATE: CompletionTracker.ADEQUATE,
                            matchesPerfect: status === CompletionTracker.PERFECT,
                            matchesAdequate: status === CompletionTracker.ADEQUATE
                        });
                        if (status === CompletionTracker.PERFECT) {
                            completionIcon = ' ⭐';
                        } else if (status === CompletionTracker.ADEQUATE) {
                            completionIcon = ' ✓';
                        }
                    }

                    btn.textContent = `Level ${level}${completionIcon}`;

                    // Attach event listener
                    btn.addEventListener('click', () => {
                        this.selectedLevel = level;

                        if (typeof Sounds !== 'undefined') {
                            Sounds.playClick();
                        }

                        this.startGame();
                    });

                    levelButtonsContainer.appendChild(btn);
                });
            }
        }
    },

    // Start the game
    startGame: function() {
        const levelScreen = document.getElementById('level-screen');
        const gameScreen = document.getElementById('game-screen');
        const progressContainer = document.getElementById('progress-container');
        const homeBtn = document.getElementById('home-btn');

        levelScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
        homeBtn.classList.remove('hidden');

        // Initialize the game with selected settings
        Game.init(this.selectedCategory, this.selectedLevel);
    }
};

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
