// Audio Playback
// Handles all audio output: violin samples, clicks, countdowns
const Audio = {
    audioContext: null,
    audioBuffers: {},
    tempo: 90, // BPM (configurable via Settings)
    beatDuration: 0.667, // seconds per beat (60/90)

    // Available samples and their MIDI note numbers
    sampleNotes: {
        'G3': 55,
        'A3': 57,
        'B3': 59,
        'D4': 62,
        'E4': 64,
        'A4': 69,
        'E5': 76,
        'A5': 81
    },

    // Initialize audio context and load samples
    init: async function() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioContext initialized');

        // Load all samples
        console.log('Loading samples...');
        for (const sampleName of Object.keys(this.sampleNotes)) {
            try {
                const response = await fetch(`samples/${sampleName}.wav`);
                const arrayBuffer = await response.arrayBuffer();
                this.audioBuffers[sampleName] = await this.audioContext.decodeAudioData(arrayBuffer);
                console.log(`Loaded sample: ${sampleName}`);
            } catch (error) {
                console.error(`Error loading sample ${sampleName}:`, error);
            }
        }
        console.log('All samples loaded');
    },

    // Convert note name to MIDI number
    noteToMidi: function(noteName) {
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };

        const match = noteName.match(/^([A-G]#?|[A-G]b?)(\d+)$/);
        if (!match) return null;

        const note = match[1];
        const octave = parseInt(match[2]);

        return (octave + 1) * 12 + noteMap[note];
    },

    // Find the closest sample for a target MIDI note
    findClosestSample: function(targetMidi) {
        let closestSample = null;
        let minDistance = Infinity;

        for (const [sampleName, sampleMidi] of Object.entries(this.sampleNotes)) {
            const distance = Math.abs(targetMidi - sampleMidi);
            if (distance < minDistance) {
                minDistance = distance;
                closestSample = sampleName;
            }
        }

        return {
            sample: closestSample,
            shift: targetMidi - this.sampleNotes[closestSample]
        };
    },

    // Calculate playback rate for pitch shifting
    getPitchShiftRate: function(semitones) {
        return Math.pow(2, semitones / 12);
    },

    // Play a pattern (array of notes with durations)
    playPattern: async function(pattern) {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const startTime = this.audioContext.currentTime;
        let currentTime = startTime;

        // Schedule each note
        pattern.notes.forEach((note, index) => {
            const duration = pattern.durations[index];
            const durationInSeconds = duration * this.beatDuration;

            // Find best sample and calculate pitch shift
            const targetMidi = this.noteToMidi(note);
            const { sample, shift } = this.findClosestSample(targetMidi);

            // Create and schedule audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers[sample];

            // Apply pitch shifting if needed
            if (shift !== 0) {
                source.playbackRate.value = this.getPitchShiftRate(shift);
            }

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.8;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start(currentTime);
            source.stop(currentTime + durationInSeconds);

            currentTime += durationInSeconds;
        });

        // Return total duration
        const totalDuration = pattern.durations.reduce((sum, d) => sum + d, 0) * this.beatDuration;
        console.log(`Playing pattern for ${totalDuration}s`);

        // Wait for playback to complete
        return new Promise(resolve => {
            setTimeout(resolve, totalDuration * 1000);
        });
    },

    // Play metronome click
    playClick: function(loud = false) {
        const clickOsc = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();

        clickOsc.connect(clickGain);
        clickGain.connect(this.audioContext.destination);

        clickOsc.frequency.value = 1000;
        clickGain.gain.value = loud ? 0.3 : 0.1; // Loud for countdown, quiet for silent

        clickOsc.start(this.audioContext.currentTime);
        clickOsc.stop(this.audioContext.currentTime + 0.05);
    },

    // Play countdown: 4 loud clicks with visual updates (no silent countdown)
    playCountdown: async function() {
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // 4 loud clicks with countdown text
        UI.showStatus('Get ready... 1');
        this.playClick(true);
        await new Promise(resolve => setTimeout(resolve, this.beatDuration * 1000));

        UI.showStatus('2');
        this.playClick(true);
        await new Promise(resolve => setTimeout(resolve, this.beatDuration * 1000));

        UI.showStatus('Ready');
        this.playClick(true);
        await new Promise(resolve => setTimeout(resolve, this.beatDuration * 1000));

        UI.showStatus('GO!');
        const goClickTime = this.audioContext.currentTime;
        this.playClick(true);

        await new Promise(resolve => setTimeout(resolve, this.beatDuration * 1000));

        return goClickTime; // Return time of GO! click for recording alignment
    },

    // Update tempo (called from Settings)
    setTempo: function(bpm) {
        this.tempo = bpm;
        this.beatDuration = 60 / bpm;
        console.log(`Tempo updated: ${bpm} BPM (${this.beatDuration.toFixed(3)}s per beat)`);
    }
};

// Initialize audio when page loads
window.addEventListener('DOMContentLoaded', async () => {
    await Audio.init();
});
