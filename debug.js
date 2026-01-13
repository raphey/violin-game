// Debug Panel
// On-screen debugging for iPad and other devices where console is hard to access
const Debug = {
    enabled: false,
    panel: null,
    content: null,
    currentData: {},

    init: function() {
        // Create debug panel
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.className = 'debug-panel hidden';

        // Create header with toggle button
        const header = document.createElement('div');
        header.className = 'debug-header';
        header.innerHTML = '<h3>Debug Info</h3><div class="debug-header-buttons"><button id="debug-clear" class="debug-clear-btn">Clear</button><button id="debug-close">×</button></div>';

        // Create scrollable content area
        this.content = document.createElement('div');
        this.content.className = 'debug-content';

        this.panel.appendChild(header);
        this.panel.appendChild(this.content);
        document.body.appendChild(this.panel);

        // Create toggle button in settings
        const settingsBtn = document.getElementById('settings-btn');
        const debugToggle = document.createElement('button');
        debugToggle.id = 'debug-toggle';
        debugToggle.className = 'settings-btn';
        debugToggle.textContent = '🐛 Debug';
        debugToggle.style.marginLeft = '10px';
        settingsBtn.parentNode.insertBefore(debugToggle, settingsBtn.nextSibling);

        // Event listeners
        document.getElementById('debug-toggle').addEventListener('click', () => {
            this.toggle();
        });

        document.getElementById('debug-close').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('debug-clear').addEventListener('click', () => {
            this.clear();
        });

        console.log('Debug panel initialized');
    },

    toggle: function() {
        if (this.enabled) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function() {
        this.enabled = true;
        this.panel.classList.remove('hidden');
        this.log('Debug mode enabled');

        // Show microphone settings if available
        if (typeof Recording !== 'undefined' && Recording.micSettings) {
            this.section('🎤 MICROPHONE SETTINGS');
            const s = Recording.micSettings;
            this.log(`Echo Cancellation: ${s.echoCancellation !== undefined ? s.echoCancellation : 'N/A'}`);
            this.log(`Auto Gain Control: ${s.autoGainControl !== undefined ? s.autoGainControl : 'N/A'}`);
            this.log(`Noise Suppression: ${s.noiseSuppression !== undefined ? s.noiseSuppression : 'N/A'}`);
            this.log(`Sample Rate: ${s.sampleRate || 'N/A'} Hz`);
            this.log(`Channel Count: ${s.channelCount || 'N/A'}`);
            this.log(`Device: ${s.deviceId ? 'Detected' : 'N/A'}`);

            // Warn if iOS is applying audio processing
            if (s.echoCancellation || s.autoGainControl || s.noiseSuppression) {
                this.log('<span class="debug-highlight">⚠️ WARNING: iOS is applying audio processing despite our constraints!</span>');
            }
        }
    },

    hide: function() {
        this.enabled = false;
        this.panel.classList.add('hidden');
    },

    clear: function() {
        this.content.innerHTML = '';
        this.currentData = {};
        this.log('Debug panel cleared');
    },

    log: function(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'debug-entry';

        let html = `<span class="debug-time">[${timestamp}]</span> ${message}`;

        if (data !== null && typeof data === 'object') {
            html += `<pre class="debug-data">${JSON.stringify(data, null, 2)}</pre>`;
        }

        entry.innerHTML = html;
        this.content.appendChild(entry);

        // Auto-scroll to bottom
        this.content.scrollTop = this.content.scrollHeight;
    },

    section: function(title) {
        const section = document.createElement('div');
        section.className = 'debug-section';
        const timestamp = new Date().toLocaleTimeString();
        section.innerHTML = `<strong>${title}</strong> <span class="debug-section-time">[${timestamp}]</span>`;
        this.content.appendChild(section);
        this.content.scrollTop = this.content.scrollHeight;
    },

    separator: function() {
        const sep = document.createElement('div');
        sep.className = 'debug-separator';
        sep.innerHTML = '─'.repeat(50);
        this.content.appendChild(sep);
        this.content.scrollTop = this.content.scrollHeight;
    },

    // Store timing data for display
    setTimingData: function(data) {
        this.currentData.timing = data;
        this.updateTimingDisplay();
    },

    // Store pitch data for display
    setPitchData: function(data) {
        this.currentData.pitch = data;
        this.updatePitchDisplay();
    },

    updateTimingDisplay: function() {
        if (!this.currentData.timing) return;

        const t = this.currentData.timing;

        this.section('⏱️ TIMING INFORMATION');
        this.log(`Recording start: ${t.recordingStartTime.toFixed(3)}s (AudioContext time)`);
        this.log(`GO! SCHEDULED at: ${t.goClickScheduledTime.toFixed(3)}s into recording`);
        this.log(`<span class="debug-highlight">Best alignment: Offset ${t.bestOffset} (+${t.bestOffsetMs.toFixed(0)}ms)</span>`);
        this.log(`User playing starts at: ${t.userPlayStartTime.toFixed(3)}s into recording`);
        this.log(`Analysis window: ${t.userPlayStartTime.toFixed(3)}s - ${t.userPlayEndTime.toFixed(3)}s`);
        this.log(`Tempo: ${t.tempo} BPM (beat = ${t.beatDuration.toFixed(3)}s)`);
        this.log(`Slice interval: ${t.sliceInterval.toFixed(3)}s (8th notes)`);
    },

    updatePitchDisplay: function() {
        if (!this.currentData.pitch) return;

        const p = this.currentData.pitch;

        this.section('🎵 PITCH DETECTION');
        this.log(`Total slices analyzed: ${p.slices.length}`);

        // Create a detailed table view
        let tableHtml = '<table class="debug-table"><thead><tr><th>Slice</th><th>Time</th><th>Expected</th><th>Detected</th><th>RMS</th><th>Error</th></tr></thead><tbody>';

        p.slices.forEach((slice, i) => {
            const timeMs = (slice.startTime * 1000).toFixed(0);
            const expected = slice.expected ? `${slice.expectedNote} (${slice.expected.toFixed(1)} Hz)` : 'silence';
            const detected = slice.detected ? `${slice.detected.toFixed(1)} Hz` : 'silence';
            const error = slice.error !== undefined ? slice.error.toFixed(2) : 'N/A';

            // Show RMS with color coding
            let rmsDisplay = 'N/A';
            let rmsClass = '';
            if (slice.rms !== undefined) {
                rmsDisplay = slice.rms.toFixed(4);
                if (slice.rms < 0.005) {
                    rmsClass = 'rms-too-low'; // Red - below threshold
                } else if (slice.rms < 0.01) {
                    rmsClass = 'rms-low'; // Yellow - marginal
                } else {
                    rmsClass = 'rms-good'; // Green - good signal
                }

                // Add reason indicator
                if (slice.reason === 'rms_too_low') {
                    rmsDisplay += ' ⚠️';
                } else if (slice.reason === 'no_correlation') {
                    rmsDisplay += ' ❌';
                }
            }

            const errorClass = slice.error > 2 ? 'error-high' : (slice.error > 1 ? 'error-medium' : 'error-low');

            tableHtml += `<tr>
                <td>${i + 1}</td>
                <td>${timeMs}ms</td>
                <td>${expected}</td>
                <td>${detected}</td>
                <td class="${rmsClass}">${rmsDisplay}</td>
                <td class="${errorClass}">${error}</td>
            </tr>`;
        });

        tableHtml += '</tbody></table>';

        const tableEntry = document.createElement('div');
        tableEntry.className = 'debug-entry';
        tableEntry.innerHTML = tableHtml;
        this.content.appendChild(tableEntry);

        this.log(`<span class="debug-highlight">Total error: ${p.totalError.toFixed(2)} (avg: ${p.avgError.toFixed(2)})</span>`);
        this.log(`Tolerance: ${p.tolerance.toFixed(2)}`);
        this.log(`Result: ${p.passed ? '✓ PASS' : '✗ FAIL'}`);

        this.content.scrollTop = this.content.scrollHeight;
    },

    // Quick method to log GO! click search info
    logGoClickSearch: function(searchStart, searchEnd, expectedTime, tempo) {
        this.section('🔍 GO! CLICK SEARCH');
        this.log(`Expected GO! at: ${expectedTime.toFixed(2)}s (7 beats @ ${tempo} BPM)`);
        this.log(`Search window: ${searchStart.toFixed(3)}s - ${searchEnd.toFixed(3)}s (±300ms)`);
        this.log(`Window width: ${((searchEnd - searchStart) * 1000).toFixed(0)}ms`);
    },

    // Log RMS levels during GO! search
    logGoClickRMS: function(timeMs, rms, isMax) {
        if (!this.enabled) return;
        const marker = isMax ? '← MAX' : '';
        this.log(`  ${timeMs.toFixed(1)}ms: RMS=${rms.toFixed(4)} ${marker}`);
    },

    // Log autocorrelation results for a slice
    logAutoCorrelate: function(sliceIndex, freq, rms, correlation) {
        if (!this.enabled) return;
        const freqStr = freq > 0 ? `${freq.toFixed(1)} Hz` : 'silence';
        this.log(`Slice ${sliceIndex}: ${freqStr} (RMS=${rms.toFixed(4)}, corr=${correlation ? correlation.toFixed(3) : 'N/A'})`);
    }
};

// Initialize debug panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Debug.init());
} else {
    Debug.init();
}
