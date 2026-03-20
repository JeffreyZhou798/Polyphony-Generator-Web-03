import type { INoteSequence } from '@magenta/music';
import type { Rule, RuleResult, RuleViolation } from './types';
import type { MusicStyle } from '../../utils/constants';

export class VoiceCrossingRule implements Rule {
  name = '声部交叉规则';
  description = '检测声部交叉（高音部低于低音部）';
  styles: MusicStyle[] = ['classical', 'pop', 'modern'];
  strictness = 'moderate' as const;

  check(sequence: INoteSequence): RuleResult {
    const violations: RuleViolation[] = [];
    if (!sequence.notes) return { violations };
    
    const chords = this.groupNotesByTime(sequence.notes);

    chords.forEach(chord => {
      if (chord.length >= 2) {
        this.checkVoiceCrossing(chord, violations);
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

  private checkVoiceCrossing(chord: any[], violations: RuleViolation[]): void {
    const sortedNotes = [...chord].filter((n: any) => n.pitch != null).sort((a: any, b: any) => a.pitch - b.pitch);

    // 检查相邻声部之间的音域重叠
    for (let i = 0; i < sortedNotes.length - 1; i++) {
      const lowerNote = sortedNotes[i];
      const higherNote = sortedNotes[i + 1];

      // 如果音高差异很小（小于3半音），可能存在声部交叉
      const interval = higherNote.pitch - lowerNote.pitch;
      if (interval < 3) {
        violations.push({
          rule: this.name,
          message: `声部过于接近（间隔${interval}半音）`,
          severity: 'info',
          time: chord[0].startTime,
          details: {
            pitches: [lowerNote.pitch, higherNote.pitch]
          }
        });
      }
    }
  }
}
