// Pattern Generation
// Loads patterns from InstrumentConfig and provides random selection
const Patterns = {
    allPatterns: null,

    // Load patterns from InstrumentConfig
    init: async function() {
        // Load patterns from instrument configuration
        this.allPatterns = InstrumentConfig.patterns;
        console.log('Patterns loaded from InstrumentConfig:', this.allPatterns);
    },

    // Generate (select) a random pattern for the given category and level
    // Selection with replacement (can pick same pattern multiple times)
    generate: function(category, level) {
        if (!this.allPatterns) {
            console.error('Patterns not loaded yet');
            return { notes: ['A4', 'A4'], durations: [2, 2] };
        }

        const levelKey = `level${level}`;
        const categoryPatterns = this.allPatterns[category];

        if (!categoryPatterns || !categoryPatterns[levelKey]) {
            console.error(`No patterns found for ${category} ${levelKey}`);
            return { notes: ['A4', 'A4'], durations: [2, 2] };
        }

        const levelPatterns = categoryPatterns[levelKey];

        if (levelPatterns.length === 0) {
            console.error(`Empty pattern list for ${category} ${levelKey}`);
            return { notes: ['A4', 'A4'], durations: [2, 2] };
        }

        // Random selection with replacement
        const randomIndex = Math.floor(Math.random() * levelPatterns.length);
        const selected = levelPatterns[randomIndex];

        console.log(`Selected pattern for ${category} ${levelKey}:`, selected);
        return selected;
    }
};

// Load patterns when the page loads
window.addEventListener('DOMContentLoaded', async () => {
    await Patterns.init();
});
