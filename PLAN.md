# Violin Ear Training Game - Project Plan

## Game Concept

An ear training game where the computer plays a short musical pattern and the user plays it back on their violin. Similar to Simon Says, but with violin and precise pitch/timing checking.

### Core Gameplay Flow

1. Computer plays reference pattern (8 beats at ~100 BPM)
2. Silent countdown with quiet metronome clicks (4 beats)
3. Visual + audio countdown: "1 - 2 - ready - go" with louder clicks (4 beats)
4. User plays pattern while game records (8 beats)
5. Game checks recorded audio against expected pattern
6. Show result (correct/incorrect)
7. Repeat for 10 problems total
8. Celebration screen at end (like math game)

## Technical Requirements

### Audio Input
- Microphone access for recording violin
- Real-time or near-real-time pitch detection
- Input: Physical violin played by user

### Audio Output
- High-quality violin synthesis for playback
- Metronome clicks
- Countdown audio cues

### Pitch Detection & Matching
- Convert audio to time series of (time_slice → frequency or null)
- Compare recorded audio against reference pattern slice by slice
- Accumulate error across mismatches:
  - Wrong pitch
  - Slightly off pitch
  - Note vs silence mismatch
  - Timing errors (naturally captured by slice comparison)
- Single tolerance parameter determines pass/fail

### Pattern Authoring
- YAML-based pattern definition
- Text-based notation format (TBD - needs to represent pitch, duration, rests)
- Example structure (notation syntax not final):
  ```yaml
  level_name:
    - "pattern string 1"
    - "pattern string 2"
  ```
- Patterns are 8 beats, can contain subdivisions and rests
- Not user-facing - author-only tool

### Difficulty Progression
- Longer sequences (more note subdivisions within 8 beats)
- Wider intervals
- Greater selection of notes (start with just A4 and E5)
- Possibly: rhythmic complexity, tempo changes (TBD)

## Open Questions

### Tolerance Parameters
- Should octave errors count as correct? (May emerge from tolerance tuning)
- What time slice granularity? (10ms? 50ms?)
- How to tune tolerance value for good UX?

### Technical Feasibility
- Can browser-based pitch detection handle violin reliably?
- Can we find/create acceptable violin synthesis?
- Decision point: Web vs native app

## Project Phases

### Phase 1a: Pitch Detection Test ✓ COMPLETE
- Get microphone access in browser
- Implement pitch detection library
- Test with real violin input
- Verify: Can we reliably detect A4, E5, etc?
- **Go/No-Go decision point**

**Status: COMPLETE - GO**
- **Approach:** Autocorrelation algorithm with Web Audio API
- **Stability:** FFT size 4096 + mode-based smoothing (15-note buffer)
- **Accuracy:** Successfully distinguishes between notes, including higher E string
- **Latency:** Responsive enough for gameplay (~180ms with smoothing)
- **Rest Detection:** Properly detects silence vs. playing
- **Browser-based:** Works well, no need for native app
- **Tool:** `pitch-test.html` - can test with violin anytime

### Phase 1b: Violin Synthesis Test ✓ COMPLETE
- Find violin samples or synthesizer
- Test playback of simple patterns
- Verify: Does it sound acceptable/realistic?
- **Go/No-Go decision point**

**Status: COMPLETE - GO**
- **Approach:** WAV samples extracted from SF2 soundfont using FluidSynth
- **Soundfont Used:** Valiant_Violin_V2.sf2
- **Samples:** 8 notes (A3, B3, C4, D4, E4, A4, E5, A5), 4 seconds each, ~6.4MB total
- **Playback:** Web Audio API in browser - works perfectly
- **Sound Quality:** Good, acceptable for the game
- **Hosting:** Simple - static files, no backend needed
- **Tool:** `extract_samples.py` - can regenerate or add more notes easily

### Phase 2: Core Matching Algorithm
- Implement time-sliced pitch detection
- Build error accumulation logic
- Test: Play reference, record playback, calculate error
- Tune tolerance parameter

### Phase 3: Basic Game Loop (Single Problem)
- Play reference pattern (8 beats)
- 4-beat silent countdown with quiet clicks
- 4-beat visual/audio "1-2-ready-go" countdown
- Record 8 beats
- Check and display result

### Phase 4: Full Game Structure
- 10 problems in sequence
- Scoring system
- Celebration screen
- Random pattern generation for testing

### Phase 5: Authoring System
- Finalize YAML format
- Load patterns from file
- Select which level/set to play

### Phase 6: Polish & Tuning
- Adjust tolerance based on real use
- Better UI/feedback
- Difficulty parameters
- Sound design polish

## Technology Stack (Tentative)

### If Web-Based
- HTML/CSS/JS (like math-game)
- Web Audio API for audio I/O
- Pitch detection: Pitchy, Aubio.js, or similar
- Violin synthesis: Soundfont samples or Web Audio synthesis

### If Native App Needed
- Electron (web tech + better audio)
- Or Python + GUI framework
- Better audio libraries available

## Success Criteria

- Pitch detection accurate enough to distinguish adjacent notes
- Timing detection catches obviously late/early notes
- Violin synthesis sounds musical enough to practice with
- Game flow is intuitive and responsive
- Can create custom pattern sets for specific songs/exercises
