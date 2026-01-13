// Matching Algorithm
// Core pattern matching logic extracted from matching-test.html
const Matching = {
    // Tempo is managed by Audio object - reference it from there
    get tempo() { return Audio.tempo; },
    get beatDuration() { return Audio.beatDuration; },
    get sliceInterval() { return Audio.beatDuration / 2; }, // 8th note slices (half a beat)

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

    // Convert MIDI to frequency
    midiToFrequency: function(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    },

    // Generate reference time series from pattern
    // Returns array of frequencies (one per slice)
    generateReferenceTimeSeries: function(pattern) {
        const series = [];
        let currentTime = 0;

        console.log('Generating reference time series:');
        console.log('tempo:', this.tempo, 'BPM');
        console.log('beatDuration:', this.beatDuration, 'seconds');
        console.log('sliceInterval:', this.sliceInterval, 'seconds');

        pattern.notes.forEach((note, index) => {
            const duration = pattern.durations[index];
            const durationInSeconds = duration * this.beatDuration;
            const numSlices = Math.round(durationInSeconds / this.sliceInterval);
            const midi = this.noteToMidi(note);
            const frequency = this.midiToFrequency(midi);

            console.log(`Note ${index}: ${note} (MIDI ${midi}), duration=${duration} beats, durationInSeconds=${durationInSeconds}, numSlices=${numSlices}, freq=${frequency.toFixed(2)} Hz`);

            for (let i = 0; i < numSlices; i++) {
                series.push(frequency);
                currentTime += this.sliceInterval;
            }
        });

        console.log('Total reference slices:', series.length);
        return series;
    },

    // Detect where the GO! click appears in the recording
    findGoClickInRecording: function(audioData, sampleRate) {
        // GO! should be at: pattern duration (4 beats) + 3 countdown beats = 7 beats total
        const expectedGoTimeSeconds = 7 * this.beatDuration;
        // Search window: ±300ms around expected time
        const searchStartMs = (expectedGoTimeSeconds - 0.3) * 1000;
        const searchEndMs = (expectedGoTimeSeconds + 0.3) * 1000;
        const searchStartSample = Math.floor((searchStartMs / 1000) * sampleRate);
        const searchEndSample = Math.floor((searchEndMs / 1000) * sampleRate);

        console.log(`Searching for GO! click around ${expectedGoTimeSeconds.toFixed(2)}s (${searchStartMs.toFixed(0)}-${searchEndMs.toFixed(0)}ms) at ${this.tempo} BPM`);

        // Debug: Log search window
        if (typeof Debug !== 'undefined') {
            Debug.logGoClickSearch(searchStartMs / 1000, searchEndMs / 1000, expectedGoTimeSeconds, this.tempo);
        }

        const checkInterval = 0.01; // Check every 10ms
        const checkSamples = Math.round(checkInterval * sampleRate);

        let lastClickPosition = -1;
        let maxRms = 0;

        // Find the loudest transient in the search window
        for (let windowStart = searchStartSample; windowStart < searchEndSample; windowStart += checkSamples) {
            const windowEnd = Math.min(windowStart + checkSamples, audioData.length);

            let rms = 0;
            for (let i = windowStart; i < windowEnd; i++) {
                rms += audioData[i] * audioData[i];
            }
            rms = Math.sqrt(rms / (windowEnd - windowStart));

            // Debug: Log RMS levels (only if debug enabled to avoid spam)
            if (typeof Debug !== 'undefined' && Debug.enabled) {
                const isMax = rms > maxRms && rms > 0.02;
                if (isMax || rms > 0.015) { // Only log significant RMS values
                    Debug.logGoClickRMS(windowStart / sampleRate * 1000, rms, isMax);
                }
            }

            if (rms > maxRms && rms > 0.02) {
                maxRms = rms;
                lastClickPosition = windowStart;
            }
        }

        if (lastClickPosition >= 0) {
            console.log(`Found GO! click at sample ${lastClickPosition} (${(lastClickPosition / sampleRate * 1000).toFixed(1)}ms, RMS: ${maxRms.toFixed(4)})`);
            return { sample: lastClickPosition, rms: maxRms };
        }

        console.log('Could not detect GO! click in recording');
        return { sample: searchStartSample, rms: 0 }; // Default to expected position
    },

    // Analyze recorded audio and extract pitch time series
    analyzeRecording: function(audioBuffer, goClickTime, recordingStartTime) {
        const sampleRate = audioBuffer.sampleRate;
        const audioData = audioBuffer.getChannelData(0);
        const sliceSamples = Math.round(this.sliceInterval * sampleRate);
        const windowSize = 4096;

        console.log(`Sample rate: ${sampleRate} Hz`);
        console.log(`Slice samples: ${sliceSamples} (${(sliceSamples / sampleRate * 1000).toFixed(3)}ms per slice)`);
        console.log(`Total recording duration: ${(audioData.length / sampleRate * 1000).toFixed(1)}ms`);

        // We know when we SCHEDULED the GO! click
        const goClickScheduledTime = goClickTime - recordingStartTime; // seconds into recording
        const goClickScheduledSample = Math.round(goClickScheduledTime * sampleRate);
        console.log(`GO! click SCHEDULED at ${(goClickScheduledTime * 1000).toFixed(1)}ms into recording`);

        // Detect where GO! click ACTUALLY appears in the recording
        const goClickResult = this.findGoClickInRecording(audioData, sampleRate);
        const goClickDetectedSample = goClickResult.sample;
        const goClickRms = goClickResult.rms;
        const goClickDetectedTime = goClickDetectedSample / sampleRate;
        console.log(`GO! click DETECTED at ${(goClickDetectedTime * 1000).toFixed(1)}ms into recording`);

        // The difference is the round-trip latency (output + input)
        const latencyMs = (goClickDetectedTime - goClickScheduledTime) * 1000;
        console.log(`Round-trip latency: ${latencyMs.toFixed(1)}ms`);

        // User plays one beat after the detected GO! click
        const beatSamples = Math.round(this.beatDuration * sampleRate);
        const startSample = goClickDetectedSample + beatSamples;

        console.log(`Starting analysis at sample ${startSample} (detected GO! + one beat = ${(startSample / sampleRate * 1000).toFixed(1)}ms)`);

        // Extract pitch at each time slice
        const recordedTimeSeries = [];

        // We'll analyze for the same number of slices as the reference
        // This will be set by the caller based on the pattern
        const expectedSlices = Math.round((4 * this.beatDuration) / this.sliceInterval); // 4 beats total

        console.log(`Analyzing ${expectedSlices} slices`);
        console.log(`Recording has ${Math.floor(audioData.length / sliceSamples)} potential slices`);

        // Debug: Send timing data
        if (typeof Debug !== 'undefined') {
            Debug.clear();
            Debug.setTimingData({
                recordingStartTime: recordingStartTime,
                goClickScheduledTime: goClickScheduledTime,
                goClickDetectedTime: goClickDetectedTime,
                latencyMs: latencyMs,
                userPlayStartTime: startSample / sampleRate,
                userPlayEndTime: (startSample + expectedSlices * sliceSamples) / sampleRate,
                goClickRms: goClickRms,
                tempo: this.tempo,
                beatDuration: this.beatDuration,
                sliceInterval: this.sliceInterval
            });
        }

        for (let sliceIndex = 0; sliceIndex < expectedSlices; sliceIndex++) {
            const slicePosition = startSample + (sliceIndex * sliceSamples);

            // Analyze FORWARD from this slice position
            const windowStart = slicePosition;
            const windowEnd = Math.min(slicePosition + windowSize, audioData.length);
            const slice = audioData.slice(windowStart, windowEnd);

            // Detect pitch for this slice (using Recording's autoCorrelate)
            const frequency = Recording.autoCorrelate(slice, sampleRate);
            recordedTimeSeries.push(frequency > 0 ? frequency : null);
        }

        console.log('Recorded time series:', recordedTimeSeries.map(f => f ? f.toFixed(1) : 'silence'));
        return recordedTimeSeries;
    },

    // Normalize frequency to a base octave (between 200-400 Hz range)
    normalizeToOctave: function(freq) {
        if (freq === null || freq <= 0) return null;

        // Bring frequency into the 200-400 Hz range (roughly octave 3)
        while (freq < 200) freq *= 2;
        while (freq >= 400) freq /= 2;

        return freq;
    },

    // Calculate error between reference and recorded
    calculateError: function(reference, recorded, pattern) {
        // Make sure they're the same length
        const minLength = Math.min(reference.length, recorded.length);
        let totalError = 0;

        // Debug: Prepare slice-by-slice data
        const sliceData = [];

        for (let i = 0; i < minLength; i++) {
            const refFreq = reference[i];
            const recFreq = recorded[i];
            let sliceError = 0;

            if (refFreq === null && recFreq === null) {
                // Both silence - perfect match
                sliceError = 0;
            } else if (refFreq === null || recFreq === null) {
                // One is silence, one is not - large error
                sliceError = 10;
                totalError += 10;
            } else {
                // Both have pitch - find closest octave match
                // Calculate which octave shift of recFreq is closest to refFreq
                const octaveShift = Math.round(Math.log2(refFreq / recFreq));
                const recFreqShifted = recFreq * Math.pow(2, octaveShift);

                // Calculate frequency difference in cents (musical distance)
                const cents = Math.abs(1200 * Math.log2(recFreqShifted / refFreq));

                // Convert cents to error score (0 cents = 0 error, 100 cents = ~8.3 error)
                // This makes it more forgiving for small pitch variations
                sliceError = Math.min(cents / 12, 10); // Cap at 10 per slice
                totalError += sliceError;
            }

            // Debug: Store slice data
            sliceData.push({
                startTime: i * this.sliceInterval,
                expected: refFreq,
                expectedNote: refFreq ? this.frequencyToNote(refFreq) : null,
                detected: recFreq,
                error: sliceError
            });
        }

        // Average error per slice
        const avgError = minLength > 0 ? totalError / minLength : 100;

        // Debug: Send pitch data
        if (typeof Debug !== 'undefined') {
            Debug.setPitchData({
                slices: sliceData,
                totalError: totalError,
                avgError: avgError,
                tolerance: Game.tolerance,
                passed: avgError <= Game.tolerance
            });
        }

        return avgError;
    },

    // Convert frequency to note name (for debug display)
    frequencyToNote: function(freq) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const midi = 69 + 12 * Math.log2(freq / 440);
        const midiRounded = Math.round(midi);
        const octave = Math.floor(midiRounded / 12) - 1;
        const note = noteNames[midiRounded % 12];
        return `${note}${octave}`;
    }
};
