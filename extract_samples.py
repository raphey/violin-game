#!/usr/bin/env python3
"""
Extract individual note samples from an SF2 soundfont file.
Requires: pip install mido
"""

import sys
import os
import subprocess
from pathlib import Path

try:
    import mido
except ImportError:
    print("Error: Required libraries not installed.")
    print("Please run: pip install mido")
    print("\nYou may also need to install FluidSynth:")
    print("  macOS: brew install fluid-synth")
    print("  Linux: apt-get install fluidsynth")
    sys.exit(1)

# MIDI notes to extract (can be customized)
NOTES_TO_EXTRACT = {
    55: "A3",
    57: "B3",
    59: "C4",
    62: "D4",
    64: "E4",
    69: "A4",
    76: "E5",
    81: "A5",
}

def create_midi_file(midi_note, output_path, duration=1.0):
    """Create a simple MIDI file with a single note."""
    # Simple MIDI file format (Type 0, single track)
    # This is a minimal implementation

    # For simplicity, we'll use a library
    try:
        import mido
    except ImportError:
        print("Installing mido for MIDI generation...")
        os.system("pip install mido")
        import mido

    mid = mido.MidiFile()
    track = mido.MidiTrack()
    mid.tracks.append(track)

    # Set tempo (500000 microseconds per beat = 120 BPM)
    track.append(mido.MetaMessage('set_tempo', tempo=500000))

    # Select violin instrument (bank 0, program 40 for this soundfont)
    track.append(mido.Message('control_change', control=0, value=0, time=0))  # Bank select MSB
    track.append(mido.Message('control_change', control=32, value=0, time=0))  # Bank select LSB
    track.append(mido.Message('program_change', program=40, time=0))

    # Note on
    track.append(mido.Message('note_on', note=midi_note, velocity=100, time=0))

    # Note off (after duration in ticks, 480 ticks per beat)
    ticks = int(duration * 480)
    track.append(mido.Message('note_off', note=midi_note, velocity=100, time=ticks))

    mid.save(output_path)

def extract_note(sf2_path, midi_note, note_name, output_dir):
    """Extract a single note from the soundfont."""

    # Create temporary MIDI file
    temp_midi = output_dir / f"temp_{note_name}.mid"
    output_wav = output_dir / f"{note_name}.wav"

    print(f"Extracting {note_name} (MIDI {midi_note})...")

    # Create MIDI file with single note (4 seconds to cover longer phrases)
    create_midi_file(midi_note, str(temp_midi), duration=4.0)

    # Convert MIDI to WAV using fluidsynth directly
    cmd = [
        'fluidsynth',
        '-ni',  # non-interactive
        '-F', str(output_wav),  # output to file
        '-r', '44100',  # sample rate
        str(sf2_path),
        str(temp_midi),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise Exception(f"FluidSynth failed: {result.stderr}")

    # Clean up temp MIDI file
    temp_midi.unlink()

    print(f"  → Saved to {output_wav}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_samples.py <path_to_soundfont.sf2>")
        print("\nExample: python extract_samples.py ~/Downloads/Valiant_Violin_V2.sf2")
        sys.exit(1)

    sf2_path = Path(sys.argv[1]).expanduser()

    if not sf2_path.exists():
        print(f"Error: Soundfont file not found: {sf2_path}")
        sys.exit(1)

    # Create output directory
    output_dir = Path(__file__).parent / "samples"
    output_dir.mkdir(exist_ok=True)

    print(f"Extracting samples from: {sf2_path}")
    print(f"Output directory: {output_dir}")
    print(f"Extracting {len(NOTES_TO_EXTRACT)} notes...\n")

    for midi_note, note_name in NOTES_TO_EXTRACT.items():
        try:
            extract_note(sf2_path, midi_note, note_name, output_dir)
        except Exception as e:
            print(f"  ✗ Error extracting {note_name}: {e}")

    print(f"\n✓ Done! Samples saved to: {output_dir}")
    print(f"\nExtracted notes: {', '.join(NOTES_TO_EXTRACT.values())}")

if __name__ == "__main__":
    main()
