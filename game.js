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
    tolerance: 7.0,

    isPlaying: false,

    // Initialize game (don't auto-start)
    init: function(category, level) {
        this.category = category;
        this.level = level;
        this.currentQuestionNum = 0;
        this.correctCount = 0;
        this.isPlaying = false;

        console.log(`Game initialized: ${category} Level ${level}`);

        // Show initial state
        UI.clearPattern();
        UI.updateProgress(1, this.totalQuestions);
        UI.showStatus('Click Start to begin');
        UI.enableStartButton();
    },

    // Start the game (called when Start button clicked)
    startGame: async function() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        UI.disableStartButton();

        await this.nextQuestion();
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
            UI.showStatus('Listen...');
            await Audio.playPattern(this.currentPattern);

            // Step 3: Play countdown (4 quiet + 4 loud clicks)
            const goClickTime = await Audio.playCountdown();
            Recording.setGoClickTime(goClickTime);

            // Step 4: User plays (recording continues)
            UI.showStatus('Play!');
            UI.showRecordingIndicator(true);

            // Wait for pattern duration + 1 extra beat (to allow for timing alignment search)
            const patternDuration = this.currentPattern.durations.reduce((sum, d) => sum + d, 0) * Audio.beatDuration;
            const recordingDuration = patternDuration + Audio.beatDuration; // Extra beat for alignment
            await new Promise(resolve => setTimeout(resolve, recordingDuration * 1000));

            // Step 5: Stop recording and get audio buffer
            UI.showRecordingIndicator(false);
            const recordingInfo = await Recording.stopRecording();

            // Step 6: Analyze recording
            // Store reference for alignment search
            Matching.currentReference = this.referenceTimeSeries;

            const recordedTimeSeries = Matching.analyzeRecording(
                recordingInfo.audioBuffer,
                recordingInfo.goClickTime,
                recordingInfo.recordingStartTime,
                this.currentPattern
            );

            // Step 7: Check answer
            const { avgError, maxNoteError } = Matching.calculateError(
                this.referenceTimeSeries,
                recordedTimeSeries,
                this.currentPattern
            );
            console.log(`Overall error: ${avgError.toFixed(2)}, Max note error: ${maxNoteError.toFixed(2)}, Tolerance: ${this.tolerance}`);
            console.log('Reference:', this.referenceTimeSeries.map(f => f ? f.toFixed(1) : 'null'));
            console.log('Recorded:', recordedTimeSeries.map(f => f ? f.toFixed(1) : 'null'));

            const passed = avgError <= this.tolerance && maxNoteError <= this.tolerance;

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

        UI.showStatus('Correct!');

        // Play coin sound
        if (typeof Sounds !== 'undefined') {
            Sounds.playCorrect();
        }

        // Auto-advance after 1300ms
        setTimeout(() => {
            this.nextQuestion();
        }, 1300);
    },

    // Handle wrong answer
    onWrongAnswer: function() {
        console.log(`✗ WRONG (${this.correctCount}/${this.currentQuestionNum})`);

        UI.showStatus('Try another one!');

        // No sound for wrong answer (per requirements)

        // Auto-advance after 1500ms
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    },

    // End game and show celebration
    endGame: function() {
        console.log(`\n=== GAME OVER ===`);
        console.log(`Score: ${this.correctCount}/${this.totalQuestions}`);

        // Determine celebration level based on percentage
        const percentage = (this.correctCount / this.totalQuestions) * 100;
        let celebrationLevel;

        if (percentage === 100) {
            celebrationLevel = 'perfect';
        } else if (percentage >= 90) {
            celebrationLevel = 'great';
        } else if (percentage >= 80) {
            celebrationLevel = 'good';
        } else if (percentage >= 70) {
            celebrationLevel = 'okay';
        } else {
            celebrationLevel = 'keep_trying';
        }

        // Save completion status (if CompletionTracker is available)
        if (typeof CompletionTracker !== 'undefined') {
            const completionStatus = CompletionTracker.getStatusFromScore(
                this.correctCount,
                this.totalQuestions
            );
            CompletionTracker.setCompletion(
                this.category,
                this.level,
                completionStatus
            );
        }

        // Show celebration screen
        UI.showCelebration(this.correctCount, this.totalQuestions, celebrationLevel);

        // Play fireworks sound for good scores
        if (celebrationLevel !== 'keep_trying') {
            if (typeof Sounds !== 'undefined') {
                setTimeout(() => {
                    Sounds.playFireworks(this.category);
                }, 100);
            }

            // Start fireworks animation
            if (typeof Celebrations !== 'undefined') {
                Celebrations.start(celebrationLevel);
            }
        }
    }
};
