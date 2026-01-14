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
        // Search window: 0ms to +500ms (only forward - recording starts early, so latency is always positive)
        // Audio cannot appear before it's scheduled to play, only after due to system latency
        const searchStartMs = expectedGoTimeSeconds * 1000;
        const searchEndMs = (expectedGoTimeSeconds + 0.5) * 1000;
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

    // Helper: Extract pitch time series starting from a specific sample position
    extractTimeSeries: function(audioData, sampleRate, startSample, expectedSlices, includeDebugInfo = false) {
        const sliceSamples = Math.round(this.sliceInterval * sampleRate);
        const windowSize = 4096;
        const timeSeries = [];
        const debugInfo = includeDebugInfo ? [] : null;

        for (let sliceIndex = 0; sliceIndex < expectedSlices; sliceIndex++) {
            const slicePosition = startSample + (sliceIndex * sliceSamples);

            // Analyze FORWARD from this slice position
            const windowStart = slicePosition;
            const windowEnd = Math.min(slicePosition + windowSize, audioData.length);

            // Safety check
            if (windowStart >= audioData.length) {
                timeSeries.push(null);
                if (debugInfo) debugInfo.push({ rms: 0, correlation: 0, reason: 'out_of_bounds' });
                continue;
            }

            const slice = audioData.slice(windowStart, windowEnd);

            // Detect pitch for this slice (using Recording's autoCorrelate)
            const result = Recording.autoCorrelate(slice, sampleRate);
            timeSeries.push(result.frequency > 0 ? result.frequency : null);

            if (debugInfo) {
                debugInfo.push({
                    rms: result.rms,
                    correlation: result.correlation,
                    reason: result.reason
                });
            }
        }

        return includeDebugInfo ? { timeSeries, debugInfo } : timeSeries;
    },

    // Analyze recorded audio using multi-offset alignment search
    analyzeRecording: function(audioBuffer, goClickTime, recordingStartTime, pattern) {
        const sampleRate = audioBuffer.sampleRate;
        const audioData = audioBuffer.getChannelData(0);
        const sliceSamples = Math.round(this.sliceInterval * sampleRate);

        console.log(`Sample rate: ${sampleRate} Hz`);
        console.log(`Slice samples: ${sliceSamples} (${(sliceSamples / sampleRate * 1000).toFixed(3)}ms per slice)`);
        console.log(`Total recording duration: ${(audioData.length / sampleRate * 1000).toFixed(1)}ms`);

        // We know when we SCHEDULED the GO! click
        const goClickScheduledTime = goClickTime - recordingStartTime;
        console.log(`GO! click SCHEDULED at ${(goClickScheduledTime * 1000).toFixed(1)}ms into recording`);

        // User should start playing one beat after the GO! click
        // We'll use the scheduled time as our baseline (no need for precise detection)
        const beatSamples = Math.round(this.beatDuration * sampleRate);
        const baselineStartSample = Math.round(goClickScheduledTime * sampleRate) + beatSamples;

        console.log(`Baseline analysis start: ${(baselineStartSample / sampleRate * 1000).toFixed(1)}ms`);

        // We'll analyze for the same number of slices as the reference (4 beats)
        const expectedSlices = Math.round((4 * this.beatDuration) / this.sliceInterval);

        // Try 5 different alignments: 0, 1, 2, 3, 4 sixteenth notes offset
        // A sixteenth note = beatDuration / 4
        const sixteenthNoteSamples = Math.round((this.beatDuration / 4) * sampleRate);
        const attempts = [];

        console.log('\n=== TRYING MULTIPLE ALIGNMENTS ===');
        console.log(`Sixteenth note = ${(sixteenthNoteSamples / sampleRate * 1000).toFixed(1)}ms`);

        for (let offset = 0; offset < 5; offset++) {
            const startSample = baselineStartSample + (offset * sixteenthNoteSamples);
            const timeSeries = this.extractTimeSeries(audioData, sampleRate, startSample, expectedSlices);

            // Calculate error for this alignment (compare against stored reference)
            // Note: reference is stored by game.js before calling analyzeRecording
            const { avgError, maxNoteError } = this.calculateErrorForAlignment(
                this.currentReference || [],
                timeSeries,
                pattern
            );

            // Use max of both errors to optimize for passing dual threshold
            const worstError = Math.max(avgError, maxNoteError);

            const offsetMs = (offset * sixteenthNoteSamples / sampleRate * 1000);
            console.log(`Offset ${offset} (${offsetMs.toFixed(0)}ms): avg=${avgError.toFixed(2)}, maxNote=${maxNoteError.toFixed(2)}, worst=${worstError.toFixed(2)}`);

            attempts.push({
                offset: offset,
                offsetMs: offsetMs,
                startSample: startSample,
                timeSeries: timeSeries,
                avgError: avgError,
                maxNoteError: maxNoteError,
                worstError: worstError
            });
        }

        // Find the best alignment (minimize worst-case error for best chance of passing)
        attempts.sort((a, b) => a.worstError - b.worstError);
        const bestAttempt = attempts[0];

        console.log(`\nBEST ALIGNMENT: Offset ${bestAttempt.offset} (${bestAttempt.offsetMs.toFixed(0)}ms) with avg=${bestAttempt.avgError.toFixed(2)}, maxNote=${bestAttempt.maxNoteError.toFixed(2)}, worst=${bestAttempt.worstError.toFixed(2)}`);

        // Extract detailed debug info for the best attempt
        let bestAttemptDebugInfo = null;
        if (typeof Debug !== 'undefined') {
            const detailedResult = this.extractTimeSeries(audioData, sampleRate, bestAttempt.startSample, expectedSlices, true);
            bestAttemptDebugInfo = detailedResult.debugInfo;
        }

        // Debug: Send alignment search data
        if (typeof Debug !== 'undefined') {
            // Add separator between questions (but not before first question)
            if (typeof Game !== 'undefined' && Game.currentQuestionNum > 1) {
                Debug.separator();
            }
            Debug.section(`📊 QUESTION ${typeof Game !== 'undefined' ? Game.currentQuestionNum : '?'}`);

            // Log alignment attempts
            Debug.section('🎯 ALIGNMENT SEARCH');
            attempts.forEach((attempt, i) => {
                const marker = i === 0 ? ' ← BEST' : '';
                Debug.log(`Offset ${attempt.offset} (+${attempt.offsetMs.toFixed(0)}ms): avg=${attempt.avgError.toFixed(2)}, maxNote=${attempt.maxNoteError.toFixed(2)}, worst=${attempt.worstError.toFixed(2)}${marker}`);
            });

            Debug.setTimingData({
                recordingStartTime: recordingStartTime,
                goClickScheduledTime: goClickScheduledTime,
                bestOffset: bestAttempt.offset,
                bestOffsetMs: bestAttempt.offsetMs,
                userPlayStartTime: bestAttempt.startSample / sampleRate,
                userPlayEndTime: (bestAttempt.startSample + expectedSlices * sliceSamples) / sampleRate,
                tempo: this.tempo,
                beatDuration: this.beatDuration,
                sliceInterval: this.sliceInterval,
                debugInfo: bestAttemptDebugInfo
            });
        }

        return bestAttempt.timeSeries;
    },

    // Normalize frequency to a base octave (between 200-400 Hz range)
    normalizeToOctave: function(freq) {
        if (freq === null || freq <= 0) return null;

        // Bring frequency into the 200-400 Hz range (roughly octave 3)
        while (freq < 200) freq *= 2;
        while (freq >= 400) freq /= 2;

        return freq;
    },

    // Calculate error for alignment search (no debug output)
    // Returns both avgError and maxNoteError to optimize for passing dual threshold
    calculateErrorForAlignment: function(reference, recorded, pattern) {
        const minLength = Math.min(reference.length, recorded.length);
        let totalError = 0;
        const sliceErrors = [];

        for (let i = 0; i < minLength; i++) {
            const refFreq = reference[i];
            const recFreq = recorded[i];
            let sliceError = 0;

            if (refFreq === null && recFreq === null) {
                sliceError = 0;
            } else if (refFreq === null || recFreq === null) {
                sliceError = 10;
                totalError += 10;
            } else {
                // Check for 3x subharmonic issue before octave shifting
                let correctedRecFreq = recFreq;
                const ratio = refFreq / recFreq;

                // If ratio is close to 3, apply 3x correction (subharmonic detection error)
                if (ratio >= 2.85 && ratio <= 3.15) {
                    correctedRecFreq = recFreq * 3;
                }

                // Now do octave normalization on the corrected frequency
                const octaveShift = Math.round(Math.log2(refFreq / correctedRecFreq));
                const recFreqShifted = correctedRecFreq * Math.pow(2, octaveShift);
                const cents = Math.abs(1200 * Math.log2(recFreqShifted / refFreq));
                sliceError = Math.min(cents / 12, 10);
                totalError += sliceError;
            }

            sliceErrors.push(sliceError);
        }

        const avgError = minLength > 0 ? totalError / minLength : 100;

        // Calculate per-note errors by grouping slices
        let maxNoteError = 0;

        if (pattern && pattern.notes && pattern.durations) {
            let sliceIndex = 0;

            pattern.notes.forEach((note, noteIndex) => {
                const duration = pattern.durations[noteIndex];
                const numSlices = Math.round(
                    (duration * this.beatDuration) / this.sliceInterval
                );

                let noteError = 0;
                let slicesProcessed = 0;

                for (let i = 0; i < numSlices && sliceIndex < minLength; i++, sliceIndex++) {
                    noteError += sliceErrors[sliceIndex];
                    slicesProcessed++;
                }

                const noteAvgError = slicesProcessed > 0 ? noteError / slicesProcessed : 0;

                if (noteAvgError > maxNoteError) {
                    maxNoteError = noteAvgError;
                }
            });
        } else {
            // Fallback if pattern not provided
            maxNoteError = avgError;
        }

        return { avgError, maxNoteError };
    },

    // Calculate error between reference and recorded (with debug output)
    calculateError: function(reference, recorded, pattern) {
        // Make sure they're the same length
        const minLength = Math.min(reference.length, recorded.length);
        let totalError = 0;

        // Debug: Prepare slice-by-slice data
        const sliceData = [];

        // Get debug info from timing data if available
        const debugInfo = (typeof Debug !== 'undefined' && Debug.currentData.timing)
            ? Debug.currentData.timing.debugInfo
            : null;

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
                // Check for 3x subharmonic issue before octave shifting
                let correctedRecFreq = recFreq;
                const ratio = refFreq / recFreq;

                // If ratio is close to 3, apply 3x correction (subharmonic detection error)
                if (ratio >= 2.85 && ratio <= 3.15) {
                    correctedRecFreq = recFreq * 3;
                }

                // Calculate which octave shift of correctedRecFreq is closest to refFreq
                const octaveShift = Math.round(Math.log2(refFreq / correctedRecFreq));
                const recFreqShifted = correctedRecFreq * Math.pow(2, octaveShift);

                // Calculate frequency difference in cents (musical distance)
                const cents = Math.abs(1200 * Math.log2(recFreqShifted / refFreq));

                // Convert cents to error score (0 cents = 0 error, 100 cents = ~8.3 error)
                // This makes it more forgiving for small pitch variations
                sliceError = Math.min(cents / 12, 10); // Cap at 10 per slice
                totalError += sliceError;
            }

            // Debug: Store slice data with RMS and correlation info
            const sliceInfo = {
                startTime: i * this.sliceInterval,
                expected: refFreq,
                expectedNote: refFreq ? this.frequencyToNote(refFreq) : null,
                detected: recFreq,
                error: sliceError
            };

            // Add RMS and correlation data if available
            if (debugInfo && debugInfo[i]) {
                sliceInfo.rms = debugInfo[i].rms;
                sliceInfo.correlation = debugInfo[i].correlation;
                sliceInfo.reason = debugInfo[i].reason;
            }

            sliceData.push(sliceInfo);
        }

        // Average error per slice (overall)
        const avgError = minLength > 0 ? totalError / minLength : 100;

        // Calculate per-note errors by grouping slices
        let maxNoteError = 0;
        const noteErrors = [];

        if (pattern && pattern.notes && pattern.durations) {
            let sliceIndex = 0;

            pattern.notes.forEach((note, noteIndex) => {
                const duration = pattern.durations[noteIndex];
                const numSlices = Math.round(
                    (duration * this.beatDuration) / this.sliceInterval
                );

                let noteError = 0;
                let slicesProcessed = 0;

                for (let i = 0; i < numSlices && sliceIndex < minLength; i++, sliceIndex++) {
                    noteError += sliceData[sliceIndex].error;
                    slicesProcessed++;
                }

                const noteAvgError = slicesProcessed > 0 ? noteError / slicesProcessed : 0;
                noteErrors.push(noteAvgError);

                if (noteAvgError > maxNoteError) {
                    maxNoteError = noteAvgError;
                }
            });

            console.log('Per-note errors:', noteErrors.map(e => e.toFixed(2)));
            console.log('Max note error:', maxNoteError.toFixed(2));
        } else {
            // Fallback if pattern not provided
            maxNoteError = avgError;
        }

        // Debug: Send pitch data
        if (typeof Debug !== 'undefined') {
            Debug.setPitchData({
                slices: sliceData,
                totalError: totalError,
                avgError: avgError,
                maxNoteError: maxNoteError,
                noteErrors: noteErrors,
                tolerance: Game.tolerance,
                passed: avgError <= Game.tolerance && maxNoteError <= Game.tolerance
            });
        }

        return { avgError, maxNoteError };
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
