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

    // Play fireworks sounds (triumphant A major 7th arpeggio)
    playFireworks: function() {
        this.init();

        // A major 7th arpeggio: A-C#-E-G# across octaves
        const notes = [
            440.00,  // A4
            554.37,  // C#5
            659.25,  // E5
            830.61,  // G#5
            880.00,  // A5
            1108.73, // C#6
            1318.51, // E6
            1661.22, // G#6
            1760.00, // A6
            2217.46, // C#7
            2637.02, // E7
            3322.44, // G#7
            // Repeat last 4 notes for emphasis
            1760.00, // A6
            2217.46, // C#7
            2637.02, // E7
            3322.44  // G#7
        ];

        const noteDuration = 0.15;

        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';

            const startTime = this.audioContext.currentTime + (i * 0.1);

            gainNode.gain.setValueAtTime(0.25, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }
};
