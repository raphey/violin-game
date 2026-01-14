// Instrument Configuration
// Centralized configuration for all instrument-specific settings
// This makes it easy to create versions for different instruments (violin, piano, etc.)

const InstrumentConfig = {
    // Basic instrument info
    name: 'Violin',
    key: 'A', // A major

    // Default settings
    defaultTolerance: 7,

    // Audio sample configuration
    sampleDirectory: 'samples/',
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

    // Game patterns (notes and durations for each category/level)
    patterns: {
        "open-strings": {
            "level1": [
                { "notes": ["G3"], "durations": [4] },
                { "notes": ["D4"], "durations": [4] },
                { "notes": ["A4"], "durations": [4] },
                { "notes": ["E5"], "durations": [4] }
            ],
            "level2": [],
            "level3": [],
            "level4": []
        },
        "see-saw": {
            "level1": [
                { "notes": ["A4", "A4"], "durations": [2, 2] },
                { "notes": ["B4", "B4"], "durations": [2, 2] },
                { "notes": ["E5", "E5"], "durations": [2, 2] }
            ],
            "level2": [
                { "notes": ["A4", "A4"], "durations": [2, 2] },
                { "notes": ["A4", "B4"], "durations": [2, 2] },
                { "notes": ["A4", "E5"], "durations": [2, 2] },
                { "notes": ["B4", "B4"], "durations": [2, 2] },
                { "notes": ["B4", "A4"], "durations": [2, 2] },
                { "notes": ["B4", "E5"], "durations": [2, 2] },
                { "notes": ["E5", "E5"], "durations": [2, 2] },
                { "notes": ["E5", "A4"], "durations": [2, 2] },
                { "notes": ["E5", "B4"], "durations": [2, 2] }
            ],
            "level3": [
                { "notes": ["A4", "A4", "A4"], "durations": [1, 1, 2] },
                { "notes": ["A4", "B4", "E5"], "durations": [1, 1, 2] },
                { "notes": ["B4", "B4", "A4"], "durations": [1, 1, 2] },
                { "notes": ["E5", "E5", "B4"], "durations": [1, 1, 2] },
                { "notes": ["A4", "A4", "B4"], "durations": [1, 2, 1] },
                { "notes": ["B4", "B4", "E5"], "durations": [1, 2, 1] },
                { "notes": ["E5", "A4", "A4"], "durations": [1, 2, 1] },
                { "notes": ["A4", "E5", "A4"], "durations": [1, 2, 1] },
                { "notes": ["A4", "B4", "A4"], "durations": [2, 1, 1] },
                { "notes": ["B4", "A4", "E5"], "durations": [2, 1, 1] },
                { "notes": ["E5", "E5", "A4"], "durations": [2, 1, 1] },
                { "notes": ["A4", "A4", "E5"], "durations": [2, 1, 1] }
            ],
            "level4": [
                { "notes": ["A4", "A4", "B4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "B4", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "B4", "B4", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "B4", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "B4", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "E5", "A4", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "E5", "E5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "A4", "B4", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "E5", "A4", "B4"], "durations": [1, 1, 1, 1] }
            ]
        },
        "twinkle": {
            "level1": [
                { "notes": ["A4", "B4"], "durations": [2, 2] },
                { "notes": ["A4", "C#5"], "durations": [2, 2] },
                { "notes": ["A4", "D5"], "durations": [2, 2] },
                { "notes": ["A4", "E5"], "durations": [2, 2] },
                { "notes": ["A4", "F#5"], "durations": [2, 2] }
            ],
            "level2": [
                { "notes": ["A4", "A4"], "durations": [2, 2] },
                { "notes": ["B4", "B4"], "durations": [2, 2] },
                { "notes": ["C#5", "C#5"], "durations": [2, 2] },
                { "notes": ["D5", "D5"], "durations": [2, 2] },
                { "notes": ["E5", "E5"], "durations": [2, 2] },
                { "notes": ["F#5", "F#5"], "durations": [2, 2] }
            ],
            "level3": [
                { "notes": ["A4", "E5"], "durations": [2, 2] },
                { "notes": ["E5", "F#5"], "durations": [2, 2] },
                { "notes": ["F#5", "E5"], "durations": [2, 2] },
                { "notes": ["E5", "D5"], "durations": [2, 2] },
                { "notes": ["D5", "C#5"], "durations": [2, 2] },
                { "notes": ["C#5", "B4"], "durations": [2, 2] },
                { "notes": ["B4", "A4"], "durations": [2, 2] }
            ],
            "level4": [
                { "notes": ["A4", "A4", "E5"], "durations": [1, 1, 2] },
                { "notes": ["A4", "A4", "E5"], "durations": [1, 2, 1] },
                { "notes": ["A4", "A4", "E5"], "durations": [2, 1, 1] },
                { "notes": ["E5", "F#5", "E5"], "durations": [1, 1, 2] },
                { "notes": ["E5", "F#5", "E5"], "durations": [1, 2, 1] },
                { "notes": ["E5", "F#5", "E5"], "durations": [2, 1, 1] },
                { "notes": ["D5", "C#5", "B4"], "durations": [1, 1, 2] },
                { "notes": ["D5", "C#5", "B4"], "durations": [1, 2, 1] },
                { "notes": ["D5", "C#5", "B4"], "durations": [2, 1, 1] },
                { "notes": ["F#5", "E5", "D5"], "durations": [1, 1, 2] },
                { "notes": ["F#5", "E5", "D5"], "durations": [1, 2, 1] },
                { "notes": ["F#5", "E5", "D5"], "durations": [2, 1, 1] },
                { "notes": ["C#5", "B4", "A4"], "durations": [1, 1, 2] },
                { "notes": ["C#5", "B4", "A4"], "durations": [1, 2, 1] },
                { "notes": ["C#5", "B4", "A4"], "durations": [2, 1, 1] },
                { "notes": ["E5", "D5", "C#5"], "durations": [1, 1, 2] },
                { "notes": ["E5", "D5", "C#5"], "durations": [1, 2, 1] },
                { "notes": ["E5", "D5", "C#5"], "durations": [2, 1, 1] }
            ],
            "level5": [
                { "notes": ["A4", "A4", "E5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "E5", "F#5", "F#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["F#5", "F#5", "E5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "D5", "C#5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "C#5", "B4", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "B4", "A4", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "F#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "F#5", "E5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "B4", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "D5", "C#5", "B4"], "durations": [1, 1, 1, 1] }
            ]
        },
        "lightly-row": {
            "level1": [
                { "notes": ["E5", "A4"], "durations": [2, 2] },
                { "notes": ["E5", "B4"], "durations": [2, 2] },
                { "notes": ["E5", "C#5"], "durations": [2, 2] },
                { "notes": ["E5", "D5"], "durations": [2, 2] },
                { "notes": ["E5", "E5"], "durations": [2, 2] }
            ],
            "level2": [
                { "notes": ["A4", "C#5"], "durations": [2, 2] },
                { "notes": ["B4", "D5"], "durations": [2, 2] },
                { "notes": ["C#5", "E5"], "durations": [2, 2] },
                { "notes": ["C#5", "A4"], "durations": [2, 2] },
                { "notes": ["D5", "B4"], "durations": [2, 2] },
                { "notes": ["E5", "C#5"], "durations": [2, 2] },
                { "notes": ["B4", "C#5"], "durations": [2, 2] },
                { "notes": ["C#5", "D5"], "durations": [2, 2] },
                { "notes": ["D5", "E5"], "durations": [2, 2] }
            ],
            "level3": [
                { "notes": ["A4", "C#5", "A4"], "durations": [1, 1, 2] },
                { "notes": ["A4", "C#5", "A4"], "durations": [1, 2, 1] },
                { "notes": ["A4", "C#5", "A4"], "durations": [2, 1, 1] },
                { "notes": ["C#5", "A4", "C#5"], "durations": [1, 1, 2] },
                { "notes": ["C#5", "A4", "C#5"], "durations": [1, 2, 1] },
                { "notes": ["C#5", "A4", "C#5"], "durations": [2, 1, 1] },
                { "notes": ["B4", "D5", "B4"], "durations": [1, 1, 2] },
                { "notes": ["B4", "D5", "B4"], "durations": [1, 2, 1] },
                { "notes": ["B4", "D5", "B4"], "durations": [2, 1, 1] },
                { "notes": ["D5", "B4", "D5"], "durations": [1, 1, 2] },
                { "notes": ["D5", "B4", "D5"], "durations": [1, 2, 1] },
                { "notes": ["D5", "B4", "D5"], "durations": [2, 1, 1] },
                { "notes": ["C#5", "E5", "C#5"], "durations": [1, 1, 2] },
                { "notes": ["C#5", "E5", "C#5"], "durations": [1, 2, 1] },
                { "notes": ["C#5", "E5", "C#5"], "durations": [2, 1, 1] },
                { "notes": ["E5", "C#5", "E5"], "durations": [1, 1, 2] },
                { "notes": ["E5", "C#5", "E5"], "durations": [1, 2, 1] },
                { "notes": ["E5", "C#5", "E5"], "durations": [2, 1, 1] },
                { "notes": ["B4", "C#5", "D5"], "durations": [1, 1, 2] },
                { "notes": ["B4", "C#5", "D5"], "durations": [1, 2, 1] },
                { "notes": ["B4", "C#5", "D5"], "durations": [2, 1, 1] },
                { "notes": ["C#5", "D5", "E5"], "durations": [1, 1, 2] },
                { "notes": ["C#5", "D5", "E5"], "durations": [1, 2, 1] },
                { "notes": ["C#5", "D5", "E5"], "durations": [2, 1, 1] },
                { "notes": ["A4", "C#5", "E5"], "durations": [1, 1, 2] },
                { "notes": ["A4", "C#5", "E5"], "durations": [1, 2, 1] },
                { "notes": ["A4", "C#5", "E5"], "durations": [2, 1, 1] }
            ],
            "level4": [
                { "notes": ["A4", "C#5", "A4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "C#5", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "C#5", "E5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "C#5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "A4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "C#5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["A4", "E5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "A4", "C#5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "A4", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "A4", "E5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "A4", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "A4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "C#5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "A4", "C#5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "A4", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "A4", "E5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "A4", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "A4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "A4", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "E5", "A4"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "C#5", "B4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "C#5", "B4", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "C#5", "D5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "C#5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "D5", "B4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "D5", "B4", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "D5", "C#5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["B4", "D5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "B4", "C#5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "B4", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "B4", "D5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "B4", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "B4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "B4", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "C#5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "B4", "C#5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "B4", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "B4", "D5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "B4", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "B4", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "B4", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "D5", "B4"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "D5", "E5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["C#5", "E5", "D5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "D5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "C#5", "E5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "E5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "E5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "E5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["D5", "E5", "D5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "D5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "D5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "C#5", "E5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "D5", "C#5", "D5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "D5", "C#5", "E5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "D5", "E5", "C#5"], "durations": [1, 1, 1, 1] },
                { "notes": ["E5", "D5", "E5", "D5"], "durations": [1, 1, 1, 1] }
            ]
        },
        "wind": {
            "level1": [],
            "level2": [],
            "level3": [],
            "level4": []
        }
    },

    // Victory sound patterns (frequencies in Hz) for each category
    victoryPatterns: {
        'open-strings': {
            notes: [196.00, 293.66, 440.00, 659.25, 987.77, 1479.98, 2217.46, 3322.44],
            description: 'Ascending by fifths from G3'
        },
        'see-saw': {
            notes: [493.88, 493.88, 493.88, 493.88, 493.88, 493.88, 440.00, 554.37, 659.25, 880.00],
            description: 'Triplet eighth notes: B B B B B B A C# E A',
            triplet: true
        },
        'twinkle': {
            notes: [587.33, 587.33, 554.37, 554.37, 493.88, 659.25, 880.00],
            description: 'Eighth notes: D D C# C# B E A'
        },
        'lightly-row': {
            notes: [440.00, 554.37, 659.25, 659.25, 554.37, 659.25, 880.00],
            description: 'Scale degrees 1 3 5 5 3 5 8 in A major'
        },
        'default': {
            notes: [440.00, 554.37, 659.25, 830.61, 880.00, 1108.73, 1318.51, 1661.22,
                    1760.00, 2217.46, 2637.02, 3322.44, 1760.00, 2217.46, 2637.02, 3322.44],
            description: 'A major 7th arpeggio with repeat'
        }
    }
};
