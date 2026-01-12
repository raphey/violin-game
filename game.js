// Game Controller
// Manages game state and orchestrates the full game loop
const Game = {
    totalQuestions: 10,
    currentQuestionNum: 0,
    correctCount: 0,
    currentPattern: null,
    referenceTimeSeries: null,
    category: null,
    level: null,
    tolerance: 5.0,

    isPaused: false,
    isPlaying: false,

    // Initialize game (don't auto-start)
    init: function(category, level) {
        this.category = category;
        this.level = level;
        this.currentQuestionNum = 0;
        this.correctCount = 0;
        this.isPaused = false;
        this.isPlaying = false;

        console.log(`Game initialized: ${category} Level ${level}`);

        // Show initial state
        UI.updateProgress(1, this.totalQuestions);
        UI.showStatus('Click Start to begin');
        UI.showStartButton();
    },

    // Start the game (called when Start button clicked)
    startGame: async function() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        UI.hideStartButton();
        UI.showPauseButton();

        await this.nextQuestion();
    },

    // Pause the game
    pauseGame: function() {
        this.isPaused = true;
        UI.showStatus('⏸️ Paused - Click Start to continue');
        UI.hidePauseButton();
        UI.showStartButton();
    },

    // Resume from pause
    resumeGame: async function() {
        this.isPaused = false;
        UI.hideStartButton();
        UI.showPauseButton();
        // Current question will continue when user clicks Start again
    },

    // Play next question in sequence
    nextQuestion: async function() {
        this.currentQuestionNum++;

        if (this.currentQuestionNum > this.totalQuestions) {
            // Game over
            this.endGame();
            return;
        }

        console.log(`\n=== Question ${this.currentQuestionNum} of ${this.totalQuestions} ===`);

        // Update progress
        UI.updateProgress(this.currentQuestionNum, this.totalQuestions);

        // Get random pattern for this level
        this.currentPattern = Patterns.generate(this.category, this.level);
        console.log('Selected pattern:', this.currentPattern);

        // Show pattern to user
        UI.updatePattern(this.currentPattern);

        // Generate reference time series
        this.referenceTimeSeries = Matching.generateReferenceTimeSeries(this.currentPattern);

        // Play the sequence: reference → countdown → record → analyze
        await this.playAndRecord();
    },

    // Main game flow for one problem
    playAndRecord: async function() {
        try {
            // Step 1: Start recording (before reference, to avoid startup delay)
            UI.showStatus('Starting...');
            UI.showRecordingIndicator(false);
            await Recording.startRecording();

            // Step 2: Play reference pattern
            UI.showStatus('🎻 Listen to the reference pattern...');
            await Audio.playPattern(this.currentPattern);

            // Step 3: Play countdown (4 quiet + 4 loud clicks)
            const goClickTime = await Audio.playCountdown();
            Recording.setGoClickTime(goClickTime);

            // Step 4: User plays (recording continues)
            UI.showStatus('🔴 PLAY NOW!');
            UI.showRecordingIndicator(true);

            // Wait for pattern duration
            const patternDuration = this.currentPattern.durations.reduce((sum, d) => sum + d, 0) * Audio.beatDuration;
            await new Promise(resolve => setTimeout(resolve, patternDuration * 1000));

            // Step 5: Stop recording and get audio buffer
            UI.showRecordingIndicator(false);
            UI.showStatus('Analyzing...');
            const recordingInfo = await Recording.stopRecording();

            // Step 6: Analyze recording
            const recordedTimeSeries = Matching.analyzeRecording(
                recordingInfo.audioBuffer,
                recordingInfo.goClickTime,
                recordingInfo.recordingStartTime
            );

            // Step 7: Check answer
            const error = Matching.calculateError(this.referenceTimeSeries, recordedTimeSeries);
            console.log(`Error: ${error.toFixed(2)}, Tolerance: ${this.tolerance}`);
            console.log('Reference:', this.referenceTimeSeries.map(f => f ? f.toFixed(1) : 'null'));
            console.log('Recorded:', recordedTimeSeries.map(f => f ? f.toFixed(1) : 'null'));

            const passed = error <= this.tolerance;

            if (passed) {
                this.onCorrectAnswer();
            } else {
                this.onWrongAnswer();
            }

        } catch (error) {
            console.error('Error during play and record:', error);
            UI.showStatus('Error: ' + error.message);

            // Wait a bit then move to next question
            setTimeout(() => {
                this.nextQuestion();
            }, 2000);
        }
    },

    // Handle correct answer
    onCorrectAnswer: function() {
        this.correctCount++;
        console.log(`✓ CORRECT! (${this.correctCount}/${this.currentQuestionNum})`);

        UI.showStatus('✓ Correct!');
        UI.showCorrectFeedback();

        // Play coin sound
        if (typeof Sounds !== 'undefined') {
            Sounds.playCorrect();
        }

        // Auto-advance after 800ms
        setTimeout(() => {
            this.nextQuestion();
        }, 800);
    },

    // Handle wrong answer
    onWrongAnswer: function() {
        console.log(`✗ WRONG (${this.correctCount}/${this.currentQuestionNum})`);

        UI.showStatus('✗ Try again!');
        UI.showWrongFeedback();

        // No sound for wrong answer (per requirements)

        // Auto-advance after 1000ms
        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    },

    // End game and show celebration
    endGame: function() {
        console.log(`\n=== GAME OVER ===`);
        console.log(`Score: ${this.correctCount}/${this.totalQuestions}`);

        // Determine celebration level
        let celebrationLevel;
        if (this.correctCount === this.totalQuestions) {
            celebrationLevel = 'perfect';
        } else if (this.correctCount >= 9) {
            celebrationLevel = 'great';
        } else if (this.correctCount >= 8) {
            celebrationLevel = 'good';
        } else if (this.correctCount >= 7) {
            celebrationLevel = 'okay';
        } else {
            celebrationLevel = 'keep_trying';
        }

        // Show celebration screen
        UI.showCelebration(this.correctCount, this.totalQuestions, celebrationLevel);

        // Play fireworks sound for good scores
        if (celebrationLevel !== 'keep_trying') {
            if (typeof Sounds !== 'undefined') {
                Sounds.playFireworks();
            }

            // Start fireworks animation
            if (typeof Celebrations !== 'undefined') {
                Celebrations.start(celebrationLevel);
            }
        }
    }
};
