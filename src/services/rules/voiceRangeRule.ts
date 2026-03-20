import type { INoteSequence } from '@magenta/music';
import type { Rule, RuleResult, RuleViolation } from './types';
import type { MusicStyle } from '../../utils/constants';

export class VoiceRangeRule implements Rule {
  name = '声部范围规则';
  description = '确保每个声部的音符在合理的音域范围内';
  styles: MusicStyle[] = ['classical', 'pop', 'jazz', 'modern'];
  strictness = 'strict' as const;

  check(sequence: INoteSequence): RuleResult {
    const violations: RuleViolation[] = [];
    if (!sequence.notes) return { violations };
    
    // 检查整体音域
    const overallMin = 36; // C2
    const overallMax = 84; // C6

    sequence.notes.forEach(note => {
      if (!note.pitch) return;
      
      if (note.pitch < overallMin || note.pitch > overallMax) {
        violations.push({
          rule: this.name,
          message: `音高 ${note.pitch} 超出合理范围 (${overallMin}-${overallMax})`,
          severity: 'warning',
          time: note.startTime || 0
        });
      }
    });

    return { violations };
  }

  canFix(): boolean {
    return true;
  }

  fix(sequence: INoteSequence): INoteSequence {
    if (!sequence.notes) return sequence;
    
    const overallMin = 36;
    const overallMax = 84;

    const fixedNotes = sequence.notes.map(note => {
      if (!note.pitch) return note;
      
      let pitch = note.pitch;
      
      // 调整到合理范围
      while (pitch < overallMin) pitch += 12;
      while (pitch > overallMax) pitch -= 12;

      return { ...note, pitch };
    });

    return { ...sequence, notes: fixedNotes };
  }
}
