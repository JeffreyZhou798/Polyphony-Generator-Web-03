import type { INoteSequence } from '@magenta/music';
import type { Rule, RuleResult, RuleViolation } from './types';
import type { MusicStyle } from '../../utils/constants';

export class HarmonyRule implements Rule {
  name = '和声规则';
  description = '检测和声合法性，避免不和谐音程';
  styles: MusicStyle[] = ['classical', 'pop', 'modern'];
  strictness = 'strict' as const;

  check(sequence: INoteSequence): RuleResult {
    const violations: RuleViolation[] = [];
    if (!sequence.notes) return { violations };
    
    const chords = this.groupNotesByTime(sequence.notes);

    chords.forEach(chord => {
      if (chord.length >= 2) {
        this.checkHarmonicIntervals(chord, violations);
      }
    });

    return { violations };
  }

  canFix(): boolean {
    return false;
  }

  private groupNotesByTime(notes: any[]): any[][] {
    const chords: any[][] = [];
    const timeTolerance = 0.1;

    notes.forEach(note => {
      let foundGroup = false;

      for (const chord of chords) {
        if (chord.length > 0 && Math.abs(note.startTime - chord[0].startTime) <= timeTolerance) {
          chord.push(note);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        chords.push([note]);
      }
    });

    return chords;
  }

  private checkHarmonicIntervals(chord: any[], violations: RuleViolation[]): void {
    const pitches = chord.map((n: any) => n.pitch).filter((p: any) => p != null).sort((a: number, b: number) => a - b);

    for (let i = 0; i < pitches.length - 1; i++) {
      const interval = pitches[i + 1] - pitches[i];
      const intervalClass = interval % 12;

      // 检查不和谐音程
      if (intervalClass === 1 || intervalClass === 11) {
        violations.push({
          rule: this.name,
          message: `检测到不和谐音程（${intervalClass === 1 ? '小二度' : '大七度'}）`,
          severity: 'warning',
          time: chord[0].startTime,
          details: { interval: intervalClass, pitches: [pitches[i], pitches[i + 1]] }
        });
      }

      // 检查增四度/减五度（三全音）
      if (intervalClass === 6) {
        violations.push({
          rule: this.name,
          message: '检测到三全音（增四度/减五度）',
          severity: 'info',
          time: chord[0].startTime
        });
      }
    }
  }
}
