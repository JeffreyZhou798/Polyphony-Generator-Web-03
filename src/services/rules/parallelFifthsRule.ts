import type { INoteSequence } from '@magenta/music';
import type { Rule, RuleResult, RuleViolation } from './types';
import type { MusicStyle } from '../../utils/constants';

export class ParallelFifthsRule implements Rule {
  name = '平行五度规则';
  description = '检测并避免平行五度（仅古典风格）';
  styles: MusicStyle[] = ['classical'];
  strictness = 'strict' as const;

  check(sequence: INoteSequence): RuleResult {
    const violations: RuleViolation[] = [];
    if (!sequence.notes) return { violations };
    
    const chords = this.groupNotesByTime(sequence.notes);

    for (let i = 1; i < chords.length; i++) {
      const prevChord = chords[i - 1];
      const currChord = chords[i];

      if (prevChord.length >= 2 && currChord.length >= 2) {
        this.checkParallelFifths(prevChord, currChord, violations);
      }
    }

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

  private checkParallelFifths(prevChord: any[], currChord: any[], violations: RuleViolation[]): void {
    const prevPitches = prevChord.map((n: any) => n.pitch).filter((p: any) => p != null).sort((a: number, b: number) => a - b);
    const currPitches = currChord.map((n: any) => n.pitch).filter((p: any) => p != null).sort((a: number, b: number) => a - b);

    // 检查所有声部对
    for (let i = 0; i < Math.min(prevPitches.length - 1, currPitches.length - 1); i++) {
      for (let j = i + 1; j < Math.min(prevPitches.length, currPitches.length); j++) {
        const prevInterval = Math.abs(prevPitches[j] - prevPitches[i]) % 12;
        const currInterval = Math.abs(currPitches[j] - currPitches[i]) % 12;

        // 检查是否两个都是纯五度
        if (prevInterval === 7 && currInterval === 7) {
          // 检查是否真正平行（同向运动）
          const voice1Motion = currPitches[i] - prevPitches[i];
          const voice2Motion = currPitches[j] - prevPitches[j];

          if (voice1Motion !== 0 && voice2Motion !== 0 && Math.sign(voice1Motion) === Math.sign(voice2Motion)) {
            violations.push({
              rule: this.name,
              message: `声部${i + 1}和声部${j + 1}之间检测到平行五度`,
              severity: 'warning',
              time: currChord[0].startTime,
              voice1: i + 1,
              voice2: j + 1,
              details: {
                prevPitches: [prevPitches[i], prevPitches[j]],
                currPitches: [currPitches[i], currPitches[j]]
              }
            });
          }
        }
      }
    }
  }
}
