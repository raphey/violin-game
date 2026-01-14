// Sound system using Web Audio API
// Generates simple sound effects for game interactions
const Sounds = {
    audioContext: null,

    // Initialize audio context (use shared Audio.audioContext if available)
    init: function() {
        if (!this.audioContext) {
            if (typeof Audio !== 'undefined' && Audio.audioContext) {
                this.audioContext = Audio.audioContext;
            } else {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }
    },

    // Play a button click sound
    playClick: function() {
        this.init();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 659.25; // E5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    },

    // Play a correct answer sound (Mario coin-style)
    playCorrect: function() {
        this.init();

        const notes = [1318.51, 1760.00]; // E6, A6 (perfect fourth in A major)
        const durations = [0.08, 0.2]; // Second note has longer decay

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'square';

            const startTime = this.audioContext.currentTime + (i * 0.08);
            const duration = durations[i];

            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    },

    // Play category-specific victory sounds
    playFireworks: function(category = 'default') {
        this.init();

        let notes, noteDuration, noteDelay, oscillatorType;

        // Get current tempo's beat duration
        const beatDuration = (typeof Audio !== 'undefined' && Audio.beatDuration) ? Audio.beatDuration : 0.667;

        // Get victory pattern from InstrumentConfig
        const victoryPattern = InstrumentConfig.victoryPatterns[category] || InstrumentConfig.victoryPatterns['default'];
        notes = victoryPattern.notes;

        // Determine timing based on category/pattern
        if (category === 'open-strings') {
            noteDelay = beatDuration / 4; // Sixteenth notes
            noteDuration = noteDelay * 0.8; // Slightly shorter for articulation
            oscillatorType = 'triangle';
        } else if (category === 'see-saw' || victoryPattern.triplet) {
            noteDelay = beatDuration / 3; // Triplet eighth notes (3 per beat)
            noteDuration = noteDelay * 0.95; // More legato
            oscillatorType = 'triangle';
        } else if (category === 'twinkle') {
            noteDelay = beatDuration / 2; // Eighth notes (2 per beat)
            noteDuration = noteDelay * 0.8; // Slightly shorter for articulation
            oscillatorType = 'triangle';
        } else if (category === 'lightly-row') {
            noteDelay = beatDuration / 2; // Eighth notes (2 per beat)
            noteDuration = noteDelay * 0.85; // Smooth and flowing
            oscillatorType = 'triangle';
        } else {
            noteDuration = 0.15;
            noteDelay = 0.1;
            oscillatorType = 'triangle';
        }

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = oscillatorType;

            const startTime = this.audioContext.currentTime + (i * noteDelay);

            gainNode.gain.setValueAtTime(0.25, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }
};
