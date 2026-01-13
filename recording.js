// Recording
// Handles microphone access, recording, and pitch detection
const Recording = {
    microphoneStream: null,
    micPermissionGranted: false,
    audioRecorder: null,
    recordedChunks: [],
    recordingStartTime: null,
    goClickTime: null,
    micSettings: null,

    // Initialize microphone access (request permission)
    init: async function() {
        try {
            console.log('Requesting microphone access...');

            // Use advanced constraints for better control on iPad/iOS
            const constraints = {
                audio: {
                    echoCancellation: { exact: false },
                    autoGainControl: { exact: false },
                    noiseSuppression: { exact: false },
                    // Additional constraints that might help on iOS
                    channelCount: { ideal: 1 }, // Mono
                    sampleRate: { ideal: 48000 }, // High sample rate
                    latency: { ideal: 0 }, // Low latency
                }
            };

            console.log('Audio constraints:', constraints);
            this.microphoneStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.micPermissionGranted = true;

            // Log what we actually got
            const track = this.microphoneStream.getAudioTracks()[0];
            const settings = track.getSettings();
            console.log('Microphone access granted with settings:', settings);

            // Store settings for debug panel
            this.micSettings = settings;

        } catch (error) {
            console.error('Microphone access denied:', error);
            throw error;
        }
    },

    // Start recording before countdown (to eliminate MediaRecorder startup delay)
    startRecording: function() {
        this.recordedChunks = [];
        this.audioRecorder = new MediaRecorder(this.microphoneStream);

        return new Promise((resolve) => {
            this.audioRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.recordingStartTime = Audio.audioContext.currentTime;
            console.log(`Recording started at: ${this.recordingStartTime.toFixed(3)}s`);
            this.audioRecorder.start();

            resolve(this.recordingStartTime);
        });
    },

    // Store GO! click time for later alignment
    setGoClickTime: function(time) {
        this.goClickTime = time;
        console.log(`GO! click at: ${time.toFixed(3)}s (${((time - this.recordingStartTime) * 1000).toFixed(1)}ms into recording)`);
    },

    // Stop recording and return decoded audio buffer
    stopRecording: async function() {
        return new Promise(async (resolve) => {
            this.audioRecorder.onstop = async () => {
                // Combine chunks into blob
                const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });

                // Decode to audio buffer
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioBuffer = await Audio.audioContext.decodeAudioData(arrayBuffer);

                console.log(`Recording stopped. Duration: ${(audioBuffer.length / audioBuffer.sampleRate * 1000).toFixed(1)}ms`);

                // Return complete recording info
                resolve({
                    audioBuffer: audioBuffer,
                    recordingStartTime: this.recordingStartTime,
                    goClickTime: this.goClickTime
                });
            };

            this.audioRecorder.stop();
        });
    },

    // Autocorrelation pitch detection algorithm
    // Returns object with frequency, rms, and correlation info
    autoCorrelate: function(buffer, sampleRate) {
        // Minimum and maximum frequencies we care about (violin range)
        const minFreq = 80;  // ~E2
        const maxFreq = 2000; // ~B6

        const minSamples = Math.floor(sampleRate / maxFreq);
        const maxSamples = Math.floor(sampleRate / minFreq);

        // Calculate RMS (root mean square) to check if there's enough signal
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);

        // Lower threshold for iPad compatibility (was 0.01, now 0.005)
        if (rms < 0.005) {
            return { frequency: -1, rms: rms, correlation: 0, reason: 'rms_too_low' };
        }

        // Autocorrelation
        let bestCorrelation = 0;
        let bestOffset = -1;

        for (let offset = minSamples; offset <= maxSamples; offset++) {
            let correlation = 0;
            for (let i = 0; i < buffer.length - offset; i++) {
                correlation += Math.abs(buffer[i] - buffer[i + offset]);
            }
            correlation = 1 - (correlation / (buffer.length - offset));

            if (correlation > 0.9 && correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestOffset = offset;
            }
        }

        if (bestOffset === -1) {
            return { frequency: -1, rms: rms, correlation: bestCorrelation, reason: 'no_correlation' };
        }

        const frequency = sampleRate / bestOffset;
        return { frequency: frequency, rms: rms, correlation: bestCorrelation, reason: 'success' };
    }
};
