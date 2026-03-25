'use client';

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface NoteConfig {
  frequency: number;
  duration: number;
  delay: number;
  type: OscillatorType;
  gain: number;
  rampDown?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private _volume = 0.3;
  private _muted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  private playNote(config: NoteConfig): void {
    const ctx = this.getContext();
    const master = this.getMasterGain();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.frequency, ctx.currentTime + config.delay);

    const startTime = ctx.currentTime + config.delay;
    const endTime = startTime + config.duration;
    const rampStart = config.rampDown ?? config.duration * 0.6;

    gainNode.gain.setValueAtTime(config.gain, startTime);
    gainNode.gain.setValueAtTime(config.gain, startTime + rampStart);
    gainNode.gain.linearRampToValueAtTime(0, endTime);

    osc.connect(gainNode);
    gainNode.connect(master);

    osc.start(startTime);
    osc.stop(endTime + 0.01);
  }

  private playSequence(notes: NoteConfig[]): void {
    for (const note of notes) {
      this.playNote(note);
    }
  }

  /** Short ascending chime -- coin collect feel */
  playXPGain(): void {
    this.playSequence([
      { frequency: 784, duration: 0.08, delay: 0, type: 'sine', gain: 0.25, rampDown: 0.02 },
      { frequency: 1047, duration: 0.12, delay: 0.07, type: 'sine', gain: 0.2, rampDown: 0.04 },
      { frequency: 1319, duration: 0.18, delay: 0.13, type: 'sine', gain: 0.15, rampDown: 0.06 },
    ]);
  }

  /** Triumphant 3-note ascending fanfare */
  playLevelUp(): void {
    this.playSequence([
      { frequency: 523, duration: 0.2, delay: 0, type: 'square', gain: 0.15, rampDown: 0.1 },
      { frequency: 659, duration: 0.2, delay: 0.18, type: 'square', gain: 0.15, rampDown: 0.1 },
      { frequency: 784, duration: 0.5, delay: 0.36, type: 'square', gain: 0.18, rampDown: 0.2 },
      // Harmonics layer
      { frequency: 1047, duration: 0.4, delay: 0.36, type: 'sine', gain: 0.08, rampDown: 0.15 },
      { frequency: 1568, duration: 0.35, delay: 0.4, type: 'sine', gain: 0.05, rampDown: 0.1 },
    ]);
  }

  /** Satisfying completion ding */
  playQuestComplete(): void {
    this.playSequence([
      { frequency: 880, duration: 0.1, delay: 0, type: 'sine', gain: 0.2, rampDown: 0.03 },
      { frequency: 1108, duration: 0.15, delay: 0.08, type: 'sine', gain: 0.2, rampDown: 0.05 },
      { frequency: 1320, duration: 0.35, delay: 0.18, type: 'sine', gain: 0.25, rampDown: 0.1 },
      // Shimmer overtone
      { frequency: 2640, duration: 0.3, delay: 0.2, type: 'sine', gain: 0.06, rampDown: 0.1 },
    ]);
  }

  /** Subtle UI click */
  playClick(): void {
    this.playNote({
      frequency: 600,
      duration: 0.04,
      delay: 0,
      type: 'sine',
      gain: 0.1,
      rampDown: 0.01,
    });
  }

  /** Very quiet soft tick */
  playHover(): void {
    this.playNote({
      frequency: 400,
      duration: 0.025,
      delay: 0,
      type: 'sine',
      gain: 0.04,
      rampDown: 0.008,
    });
  }

  /** Fast ascending combo sound */
  playStreakBonus(): void {
    const baseFreq = 523;
    const notes: NoteConfig[] = Array.from({ length: 6 }, (_, i) => ({
      frequency: baseFreq * Math.pow(2, (i * 3) / 12),
      duration: 0.06,
      delay: i * 0.04,
      type: 'sawtooth' as OscillatorType,
      gain: 0.08 + i * 0.015,
      rampDown: 0.015,
    }));
    // Sustained top note
    notes.push({
      frequency: baseFreq * Math.pow(2, 15 / 12),
      duration: 0.3,
      delay: 0.24,
      type: 'sine',
      gain: 0.15,
      rampDown: 0.1,
    });
    this.playSequence(notes);
  }

  /** Low descending error tone */
  playError(): void {
    this.playSequence([
      { frequency: 330, duration: 0.15, delay: 0, type: 'square', gain: 0.12, rampDown: 0.05 },
      { frequency: 262, duration: 0.25, delay: 0.12, type: 'square', gain: 0.1, rampDown: 0.08 },
    ]);
  }

  get volume(): number {
    return this._volume;
  }

  set volume(val: number) {
    this._volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx!.currentTime);
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this._muted ? 0 : this._volume,
        this.ctx.currentTime
      );
    }
    return this._muted;
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this._muted ? 0 : this._volume,
        this.ctx.currentTime
      );
    }
  }
}

export const soundEngine = new SoundEngine();
