// Completion Tracker
// Manages level completion status with localStorage persistence
const CompletionTracker = {
    // Completion types
    NONE: 'none',
    ADEQUATE: 'adequate',  // Checkmark (≥70%)
    PERFECT: 'perfect',     // Star (100%)

    // Get completion status for a specific level
    // Returns: 'none', 'adequate', or 'perfect'
    getCompletion: function(category, level) {
        const key = `violin-game-completion-${category}-level${level}`;
        return localStorage.getItem(key) || this.NONE;
    },

    // Set completion status for a specific level
    // Only updates if the new status is better than existing
    setCompletion: function(category, level, status) {
        const key = `violin-game-completion-${category}-level${level}`;
        const currentStatus = this.getCompletion(category, level);

        // Hierarchy: perfect > adequate > none
        const statusValue = {
            none: 0,
            adequate: 1,
            perfect: 2
        };

        console.log('CompletionTracker.setCompletion:', {
            category,
            level,
            newStatus: status,
            currentStatus,
            newValue: statusValue[status],
            currentValue: statusValue[currentStatus],
            willUpdate: statusValue[status] > statusValue[currentStatus]
        });

        // Only update if new status is better
        if (statusValue[status] > statusValue[currentStatus]) {
            localStorage.setItem(key, status);
            console.log(`Completion updated: ${category} Level ${level} = ${status}`);
            return true;
        }

        console.log(`Completion NOT updated (current is already ${currentStatus})`);
        return false;
    },

    // Determine completion status from score percentage
    getStatusFromScore: function(correctCount, totalQuestions) {
        const percentage = (correctCount / totalQuestions) * 100;

        console.log('CompletionTracker.getStatusFromScore:', {
            correctCount,
            totalQuestions,
            percentage,
            isPerfect: percentage === 100
        });

        if (percentage === 100) {
            return this.PERFECT;
        } else if (percentage >= 70) {
            return this.ADEQUATE;
        } else {
            return this.NONE;
        }
    },

    // Check if all levels in a category are at least adequate
    // Returns: { complete: boolean, allPerfect: boolean, total: number, completed: number }
    getCategoryCompletion: function(category) {
        let total = 0;
        let completed = 0;
        let perfectCount = 0;

        // Check all possible levels (up to 10)
        for (let i = 1; i <= 10; i++) {
            // Check if this level exists in patterns
            if (typeof Patterns !== 'undefined' &&
                Patterns.allPatterns &&
                Patterns.allPatterns[category] &&
                Patterns.allPatterns[category][`level${i}`] &&
                Patterns.allPatterns[category][`level${i}`].length > 0) {

                total++;
                const status = this.getCompletion(category, i);
                if (status === this.ADEQUATE || status === this.PERFECT) {
                    completed++;
                }
                if (status === this.PERFECT) {
                    perfectCount++;
                }
            }
        }

        return {
            complete: total > 0 && completed === total,
            allPerfect: total > 0 && perfectCount === total,
            total: total,
            completed: completed,
            perfectCount: perfectCount
        };
    },

    // Reset all completion data
    resetAll: function() {
        // Find all violin-game-completion keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('violin-game-completion-')) {
                keysToRemove.push(key);
            }
        }

        // Remove them
        keysToRemove.forEach(key => localStorage.removeItem(key));

        console.log(`Completion data reset: ${keysToRemove.length} entries cleared`);
    },

    // Reset completion for a specific category
    resetCategory: function(category) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`violin-game-completion-${category}-`)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        console.log(`Completion reset for ${category}: ${keysToRemove.length} levels cleared`);
    },

    // Get all completion data for debugging
    getAllCompletions: function() {
        const completions = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('violin-game-completion-')) {
                completions[key] = localStorage.getItem(key);
            }
        }
        return completions;
    }
};
