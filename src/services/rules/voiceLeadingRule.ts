import type { INoteSequence } from '@magenta/music';
import type { Rule, RuleResult, RuleViolation } from './types';
import type { MusicStyle } from '../../utils/constants';

export class VoiceLeadingRule implements Rule {
  name = '声部进行规则';
  description = '确保声部进行平滑，避免大跳进';
  styles: MusicStyle[] = ['classical', 'pop', 'jazz', 'modern'];
  strictness = 'moderate' as const;

  check(sequence: INoteSequence): RuleResult {
    const violations: RuleViolation[] = [];
    if (!sequence.notes) return { violations };
    
    const notes = [...sequence.notes].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

    for (let i = 1; i < notes.length; i++) {
      const prevNote = notes[i - 1];
      const currNote = notes[i];

      if (!prevNote.pitch || !currNote.pitch) continue;

      // 检查大跳进（超过八度）
      const interval = Math.abs(currNote.pitch - prevNote.pitch);
      if (interval > 12) {
        violations.push({
          rule: this.name,
          message: `检测到大跳进：${interval}半音`,
          severity: 'warning',
          time: currNote.startTime || 0,
          details: {
            prevPitch: prevNote.pitch,
            currPitch: currNote.pitch,
            interval
          }
        });
      }

      // 检查连续同向大跳
      if (i >= 2) {
        const prevPrevNote = notes[i - 2];
        if (!prevPrevNote.pitch) continue;
        
        const prevInterval = prevNote.pitch - prevPrevNote.pitch;
        const currInterval = currNote.pitch - prevNote.pitch;

        if (Math.abs(prevInterval) > 4 && Math.abs(currInterval) > 4) {
          if (Math.sign(prevInterval) === Math.sign(currInterval)) {
            violations.push({
              rule: this.name,
              message: '检测到连续同向大跳',
              severity: 'info',
              time: currNote.startTime || 0
            });
          }
        }
      }
    }

    return { violations };
  }

  canFix(): boolean {
    return false;
  }
}
