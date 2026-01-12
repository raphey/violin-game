// Settings Manager
// Manages global game settings with localStorage persistence
const Settings = {
    // Default values
    defaults: {
        tempo: 90,        // BPM (60-120)
        tolerance: 6,     // Error threshold (2-8)
        levelLength: 10   // Questions per level (5-15)
    },

    // Current values (loaded from localStorage or defaults)
    current: {},

    // Initialize settings from localStorage or defaults
    init: function() {
        this.current = {
            tempo: parseInt(localStorage.getItem('violin-game-tempo')) || this.defaults.tempo,
            tolerance: parseInt(localStorage.getItem('violin-game-tolerance')) || this.defaults.tolerance,
            levelLength: parseInt(localStorage.getItem('violin-game-levelLength')) || this.defaults.levelLength
        };

        // Validate ranges
        this.current.tempo = Math.max(60, Math.min(120, this.current.tempo));
        this.current.tolerance = Math.max(2, Math.min(8, this.current.tolerance));
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
        this.apply();
        console.log('Settings reset to defaults');
    }
};

// Initialize settings when page loads
window.addEventListener('DOMContentLoaded', () => {
    Settings.init();
});
