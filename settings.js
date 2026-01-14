// Settings Manager
// Manages global game settings with localStorage persistence
const Settings = {
    // Default values
    defaults: {
        tempo: 90,                                    // BPM (60-120)
        tolerance: InstrumentConfig.defaultTolerance, // Error threshold (2-10)
        levelLength: 10,                              // Questions per level (5-15)
        showNotes: false                              // Show note names (true/false)
    },

    // Current values (loaded from localStorage or defaults)
    current: {},

    // Initialize settings from localStorage or defaults
    init: function() {
        const storedShowNotes = localStorage.getItem('violin-game-showNotes');

        this.current = {
            tempo: parseInt(localStorage.getItem('violin-game-tempo')) || this.defaults.tempo,
            tolerance: parseFloat(localStorage.getItem('violin-game-tolerance')) || this.defaults.tolerance,
            levelLength: parseInt(localStorage.getItem('violin-game-levelLength')) || this.defaults.levelLength,
            showNotes: storedShowNotes !== null ? storedShowNotes === 'true' : this.defaults.showNotes
        };

        // Validate ranges
        this.current.tempo = Math.max(60, Math.min(120, this.current.tempo));
        this.current.tolerance = Math.max(2, Math.min(10, this.current.tolerance));
        this.current.levelLength = Math.max(5, Math.min(15, this.current.levelLength));

        // Apply to Audio and Game
        this.apply();

        console.log('Settings loaded:', this.current);
    },

    // Apply current settings to game systems
    apply: function() {
        if (typeof Audio !== 'undefined') {
            Audio.setTempo(this.current.tempo);
        }
        if (typeof Game !== 'undefined') {
            Game.tolerance = this.current.tolerance;
            Game.totalQuestions = this.current.levelLength;
        }
    },

    // Update a setting and persist
    set: function(key, value) {
        this.current[key] = value;
        localStorage.setItem(`violin-game-${key}`, value);
        this.apply();
        console.log(`Setting updated: ${key} = ${value}`);
    },

    // Get a setting value
    get: function(key) {
        return this.current[key];
    },

    // Reset all settings to defaults
    reset: function() {
        this.current = { ...this.defaults };
        localStorage.removeItem('violin-game-tempo');
        localStorage.removeItem('violin-game-tolerance');
        localStorage.removeItem('violin-game-levelLength');
        localStorage.removeItem('violin-game-showNotes');
        this.apply();
        console.log('Settings reset to defaults');
    }
};

// Initialize settings when page loads
window.addEventListener('DOMContentLoaded', () => {
    Settings.init();
});
