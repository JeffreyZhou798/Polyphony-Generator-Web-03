import type { INoteSequence } from '@magenta/music';

interface HarmonyNote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
  voiceId: number;
}

export class HarmonyGenerator {
  // 和弦音程关系（相对于根音的半音数）
  private chordIntervals = {
    major: [0, 4, 7],           // 大三和弦
    minor: [0, 3, 7],           // 小三和弦
    diminished: [0, 3, 6],      // 减三和弦
    major7: [0, 4, 7, 11],      // 大七和弦
    minor7: [0, 3, 7, 10],      // 小七和弦
    dominant7: [0, 4, 7, 10]    // 属七和弦
  };

  // 声部音域
  private voiceRanges = {
    soprano: { min: 60, max: 81 },  // C4-A5
    alto: { min: 55, max: 74 },     // G3-D5
    tenor: { min: 48, max: 67 },    // C3-G4
    bass: { min: 40, max: 60 }      // E2-C4
  };

  /**
   * 为原始旋律生成和声声部
   * @param melody 原始旋律（作为最高声部）
   * @param voiceCount 总声部数（包括原始旋律）
   * @param style 音乐风格
   */
  generateHarmony(
    melody: INoteSequence,
    voiceCount: number,
    style: string
  ): INoteSequence {
    if (!melody.notes || melody.notes.length === 0) {
      throw new Error('旋律为空');
    }

    console.log('=== 开始生成和声 ===');
    console.log('原始旋律音符数:', melody.notes.length);
    console.log('目标声部数:', voiceCount);

    // 保留原始旋律作为 Soprano (voiceId=0)
    const sopranoNotes: HarmonyNote[] = melody.notes.map(note => ({
      pitch: note.pitch || 60,
      startTime: note.startTime || 0,
      endTime: note.endTime || 0,
      velocity: note.velocity || 80,
      voiceId: 0
    }));

    // 生成其他声部
    const allNotes: HarmonyNote[] = [...sopranoNotes];

    if (voiceCount >= 2) {
      const altoNotes = this.generateVoicePart(sopranoNotes, 1, 'alto', style);
      allNotes.push(...altoNotes);
      console.log('Alto 声部生成:', altoNotes.length, '个音符');
    }

    if (voiceCount >= 3) {
      const tenorNotes = this.generateVoicePart(sopranoNotes, 2, 'tenor', style);
      allNotes.push(...tenorNotes);
      console.log('Tenor 声部生成:', tenorNotes.length, '个音符');
    }

    if (voiceCount >= 4) {
      const bassNotes = this.generateVoicePart(sopranoNotes, 3, 'bass', style);
      allNotes.push(...bassNotes);
      console.log('Bass 声部生成:', bassNotes.length, '个音符');
    }

    // 转换回 INoteSequence 格式
    const notes = allNotes.map(note => ({
      pitch: note.pitch,
      startTime: note.startTime,
      endTime: note.endTime,
      velocity: note.velocity,
      voiceId: note.voiceId,
      quantizedStartStep: Math.round(note.startTime * 4),
      quantizedEndStep: Math.round(note.endTime * 4),
      isDrum: false
    }));

    console.log('总音符数:', notes.length);
    console.log('=== 和声生成完成 ===');

    return {
      notes,
      totalTime: melody.totalTime,
      totalQuantizedSteps: melody.totalQuantizedSteps,
      quantizationInfo: melody.quantizationInfo,
      tempos: melody.tempos,
      timeSignatures: melody.timeSignatures
    };
  }

  /**
   * 为指定声部生成音符
   */
  private generateVoicePart(
    sopranoNotes: HarmonyNote[],
    voiceId: number,
    voiceType: 'alto' | 'tenor' | 'bass',
    style: string
  ): HarmonyNote[] {
    const range = this.voiceRanges[voiceType];
    const notes: HarmonyNote[] = [];

    // 为每个 soprano 音符生成对应的和声音符
    for (let i = 0; i < sopranoNotes.length; i++) {
      const sopranoNote = sopranoNotes[i];
      const rootPitch = sopranoNote.pitch;

      // 根据声部类型选择音程
      let interval: number;
      
      if (voiceType === 'alto') {
        // Alto: 通常在 soprano 下方 3-7 度
        interval = this.selectInterval(rootPitch, [-3, -4, -5, -7], range, style, i);
      } else if (voiceType === 'tenor') {
        // Tenor: 通常在 soprano 下方 5-12 度
        interval = this.selectInterval(rootPitch, [-5, -7, -8, -12], range, style, i);
      } else {
        // Bass: 通常在 soprano 下方 8-19 度
        interval = this.selectInterval(rootPitch, [-12, -15, -17, -19], range, style, i);
      }

      let pitch = rootPitch + interval;

      // 确保在音域范围内
      while (pitch < range.min) pitch += 12;
      while (pitch > range.max) pitch -= 12;

      // 避免与其他声部音高完全相同
      if (notes.length > 0) {
        const lastPitch = notes[notes.length - 1].pitch;
        if (Math.abs(pitch - lastPitch) < 2) {
          pitch += (pitch < lastPitch) ? -2 : 2;
        }
      }

      notes.push({
        pitch,
        startTime: sopranoNote.startTime,
        endTime: sopranoNote.endTime,
        velocity: sopranoNote.velocity,
        voiceId
      });
    }

    return notes;
  }

  /**
   * 选择合适的音程
   */
  private selectInterval(
    rootPitch: number,
    intervals: number[],
    range: { min: number; max: number },
    style: string,
    index: number
  ): number {
    // 根据音乐风格和位置选择音程
    const scale = this.getMajorScale(rootPitch % 12);
    
    // 优先选择在调内的音程
    for (const interval of intervals) {
      const targetPitch = rootPitch + interval;
      const pitchClass = ((targetPitch % 12) + 12) % 12;
      
      if (scale.includes(pitchClass)) {
        const testPitch = targetPitch;
        if (testPitch >= range.min - 12 && testPitch <= range.max + 12) {
          return interval;
        }
      }
    }

    // 如果没有找到调内音程，使用第一个可用的
    return intervals[index % intervals.length];
  }

  /**
   * 获取大调音阶
   */
  private getMajorScale(tonic: number): number[] {
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // 大调音程
    return intervals.map(i => (tonic + i) % 12);
  }
}

export const harmonyGenerator = new HarmonyGenerator();
