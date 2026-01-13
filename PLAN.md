# Violin Ear Training Game - Project Status

## Current State: ✅ COMPLETE AND DEPLOYED

Live at: https://raphey.github.io/violin-game/

## Game Overview

An ear training game where the computer plays a short musical pattern and the user plays it back on their violin. The game uses pitch detection to compare recorded audio against expected patterns.

## Game Structure

### Categories
1. **Open Strings** - G3, D4, A4, E5 (violin open strings)
   - Level 1 only: Single whole notes (4 beats)
2. **See-Saw** - A4, B4, E5 (from Suzuki Book 1)
   - Level 1: Two half notes (same note)
   - Level 2: Two half notes (can differ)
   - Level 3: Three notes with mixed rhythms (♩♩𝅗𝅥, ♩𝅗𝅥♩, 𝅗𝅥♩♩)
   - Level 4: Four quarter notes
3. **Twinkle, Lightly Row, Song of the Wind** - Coming Soon (disabled)

### Game Flow
1. User selects category and level
2. Click "Start" button to begin
3. For each problem (configurable 5-15 questions, default 10):
   - Computer plays reference pattern (4 beats)
   - Visual/audio countdown: "1 - 2 - Ready - GO!" with clicks (4 beats)
   - User plays while recording (4 beats)
   - Game analyzes match and shows result (✓ green or ✗ orange)
   - Auto-advance to next question
4. Celebration screen with fireworks and victory sound

### Settings (Configurable)
- **Tempo**: 60-120 BPM (default 90), step 5
- **Tolerance**: 2-8 error threshold (default 6), step 0.5
- **Level Length**: 5-15 questions (default 10), step 1

Settings persist in localStorage across sessions.

## Technical Implementation

### Audio System (`audio.js`)
- Loads violin samples from `/samples/` directory
- Plays patterns using Web Audio API with precise timing
- Supports pitch shifting (e.g., B4 from A4 sample)
- Metronome clicks for countdown
- Tempo: Configurable, affects beatDuration = 60/BPM

### Recording (`recording.js`)
- Captures microphone input via MediaRecorder
- Records entire sequence (pattern + countdown + user playing)
- Returns audio buffer for analysis

### Pitch Detection & Matching (`matching.js`)
- **Time Slicing**: Divides pattern into 8th-note slices (beatDuration/2)
- **Pitch Detection**: Autocorrelation algorithm on each slice
- **Octave Normalization**: Mathematically finds optimal octave shift to minimize error
  - Formula: `octaveShift = round(log₂(refFreq / recFreq))`
  - Eliminates boundary discontinuities from naive normalization
- **Error Calculation**: Per-slice comparison
  - Both silence: 0 error
  - One silence, one sound: +10 error
  - Both have pitch: Calculate cents difference, convert to error (cents/12)
  - Final error: Average across all slices
- **GO! Click Detection**: Dynamically scales search window with tempo
  - Expected time: 7 beats (4-beat pattern + 3 countdown beats)
  - Search window: ±300ms around expected time

### Pattern System (`patterns.js`, `patterns.json`)
- Patterns stored in JSON format (YAML removed as redundant)
- Each pattern: `{notes: [...], durations: [...]}`
- Notes: String notation (e.g., "A4", "B4", "E5")
- Durations: In beats (1 = quarter note, 2 = half note, 4 = whole note)
- Random selection with replacement for each question

### Game Controller (`game.js`)
- Orchestrates full game loop
- Manages state (score, current question)
- Applies settings (tempo, tolerance, level length)
- Percentage-based celebration levels:
  - Perfect: 100%
  - Great: 90-99%
  - Good: 80-89%
  - Okay: 70-79%
  - Keep Trying: <70%

### UI System (`ui.js`)
- Screen navigation (category → level → game → celebration)
- Settings screen with sliders
- Real-time visual feedback (green/orange)
- Progress bar updates
- Dynamically enables/disables level buttons based on pattern availability

### Settings System (`settings.js`)
- Manages global settings with localStorage persistence
- Validates ranges
- Applies to Audio and Game systems

### Audio Samples (`samples/`)
- WAV files extracted from SF2 soundfont using FluidSynth
- Current samples: G3, A3, B3, D4, E4, A4, E5, A5
- Extract script: `extract_samples.py`

### Celebrations (`celebrations.js`)
- Canvas-based fireworks animation
- Intensity scales with celebration level
- Victory sound: A major 7 arpeggio

### Sounds (`sounds.js`)
- Coin ding for correct answers (B5 → E6)
- Victory arpeggio (A major 7)
- No sound for wrong answers

## Key Design Decisions

### Tempo Management
- Single source of truth in `audio.js`
- All timing derived from `beatDuration = 60/tempo`
- `matching.js` references `Audio.tempo` via getters
- GO! click detection dynamically scales with tempo

### Error Tolerance
- Default: 6.0 (tuned for realistic performance)
- Configurable 2-8 with half-step precision
- Lower = harder (less forgiving of pitch/timing errors)

### Octave Handling
- Optimal octave shift algorithm prevents boundary discontinuities
- Example: Playing 401 Hz (slightly sharp) gives ~40 cents error, not ~1161
- A3, A4, A5 all treated as equivalent after shifting

### Pattern Complexity Progression
- Open Strings Level 1: Single whole notes (easiest)
- See-Saw Level 1: Repeated notes (introduce rhythm)
- See-Saw Level 2: Different notes (introduce intervals)
- See-Saw Level 3: Three notes with rhythm variations
- See-Saw Level 4: Four quarter notes (most complex)

### UI/UX
- Start button prevents accidental auto-start
- Settings easily accessible from main menu
- Compact layout fits without scrolling
- Dark settings panel for readability
- Auto-advance after feedback (800ms correct, 1000ms wrong)

## Browser Compatibility

- Requires: Web Audio API, MediaRecorder API, modern JavaScript (ES6+)
- Tested on: Chrome, Firefox, Safari
- Microphone permission required

## Development Tools

- **Local server**: `python3 -m http.server 8000`
- **Sample extraction**: `python3 extract_samples.py <soundfont.sf2>`
- **Git workflow**: Develop on `main`, auto-sync to `gh-pages`
- **Deployment**: GitHub Pages (automatic from `gh-pages` branch)

## Files

### Core Game
- `index.html` - HTML structure (category, level, game, celebration screens)
- `styles.css` - Purple/green gradient theme
- `game.js` - Game controller
- `ui.js` - UI controller
- `audio.js` - Audio playback
- `recording.js` - Microphone recording
- `matching.js` - Pitch detection and error calculation
- `patterns.js` - Pattern loading
- `sounds.js` - Sound effects
- `celebrations.js` - Fireworks animation
- `settings.js` - Settings management

### Data
- `patterns.json` - Pattern definitions (loaded by browser)

### Tools
- `extract_samples.py` - Extract samples from SF2 soundfont
- `samples/` - Violin WAV samples

### Development/Testing (not loaded by game)
- `matching-test.html` - Prototyping tool for matching algorithm
- `pitch-test.html` - Pitch detection testing tool
- `rhythm-test.html` - Rhythm playback testing tool
- `sample-test.html` - Sample playback testing tool

## Remaining TODOs

- [ ] Add patterns for Twinkle, Lightly Row, Song of the Wind
- [ ] Consider adding more note options (C#, F#, etc.)
- [ ] Mobile optimization/testing
- [ ] Accessibility improvements (keyboard navigation, screen readers)

## Success Metrics

✅ Pitch detection distinguishes adjacent notes reliably
✅ Timing detection catches early/late notes
✅ Violin synthesis sounds musical
✅ Game flow is intuitive and responsive
✅ Settings persist across sessions
✅ Works at multiple tempos (60-120 BPM)
✅ Octave-invariant matching (play any octave)
✅ Deployed and accessible via web
