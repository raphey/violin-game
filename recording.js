// Recording
// Handles microphone access, recording, and pitch detection
const Recording = {
    microphoneStream: null,
    micPermissionGranted: false,
    audioRecorder: null,
    recordedChunks: [],
    recordingStartTime: null,
    goClickTime: null,

    // Initialize microphone access (request permission)
    init: async function() {
        try {
            console.log('Requesting microphone access...');
            this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            });
            this.micPermissionGranted = true;
            console.log('Microphone access granted');
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
    // Returns frequency in Hz, or -1 if no pitch detected
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

        // If signal is too weak, return -1
        if (rms < 0.01) return -1;

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

        if (bestOffset === -1) return -1;

        return sampleRate / bestOffset;
    }
};
