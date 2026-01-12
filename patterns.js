// Pattern Generation
// Loads patterns from JSON and provides random selection
const Patterns = {
    allPatterns: null,

    // Load patterns from JSON file
    init: async function() {
        try {
            const response = await fetch('patterns.json');
            this.allPatterns = await response.json();
            console.log('Patterns loaded:', this.allPatterns);
        } catch (error) {
            console.error('Error loading patterns:', error);
            // Fallback patterns if loading fails
            this.allPatterns = {
                'see-saw': {
                    'level1': [
                        { notes: ['A4', 'A4'], durations: [2, 2] }
                    ],
                    'level2': [
                        { notes: ['A4', 'B4'], durations: [2, 2] }
                    ],
                    'level3': [
                        { notes: ['A4', 'A4', 'A4'], durations: [1, 1, 2] },
                        { notes: ['A4', 'A4', 'B4'], durations: [1, 2, 1] },
                        { notes: ['A4', 'B4', 'A4'], durations: [2, 1, 1] }
                    ],
                    'level4': [
                        { notes: ['A4', 'B4', 'A4', 'E5'], durations: [1, 1, 1, 1] }
                    ]
                }
            };
        }
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
