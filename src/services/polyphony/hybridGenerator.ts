import type { INoteSequence } from '@magenta/music';
import { modelLoader } from '../magenta/modelLoader';
import { musicRuleEngine } from '../rules/ruleEngine';

interface HybridNote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
  voiceId: number;
}

/**
 * 混合生成器：结合 Magenta.js 的创造力和规则引擎的监督
 */
export class HybridGenerator {
  private voiceRanges = {
    soprano: { min: 60, max: 81 },
    alto: { min: 55, max: 74 },
    tenor: { min: 48, max: 67 },
    bass: { min: 40, max: 60 }
  };

  /**
   * 使用 Magenta 生成创意旋律，然后用规则引擎修正
   */
  async generateWithMagentaAndRules(
    melody: INoteSequence,
    voiceCount: number,
    style: string,
    modelType: 'music_rnn' | 'music_vae',
    temperature: number,
    length: number
  ): Promise<INoteSequence> {
    console.log('=== 混合生成：Magenta + 规则引擎 ===');
    
    // 1. 保留原始旋律作为 Soprano
    const sopranoNotes: HybridNote[] = (melody.notes || []).map(note => ({
      pitch: note.pitch || 60,
      startTime: note.startTime || 0,
      endTime: note.endTime || 0,
      velocity: note.velocity || 80,
      voiceId: 0
    }));

    console.log('原始旋律（Soprano）:', sopranoNotes.length, '个音符');

    const allNotes: HybridNote[] = [...sopranoNotes];

    // 2. 为每个额外声部使用 Magenta 生成，然后用规则修正
    const voiceNames = ['alto', 'tenor', 'bass'];
    const voicesToGenerate = Math.min(voiceCount - 1, 3);

    for (let i = 0; i < voicesToGenerate; i++) {
      const voiceId = i + 1;
      const voiceName = voiceNames[i] as 'alto' | 'tenor' | 'bass';
      
      console.log(`\n生成 ${voiceName} 声部 (voiceId=${voiceId})...`);
      
      // 使用 Magenta 生成原始材料
      const rawVoice = await this.generateWithMagenta(
        melody,
        modelType,
        temperature,
        length
      );

      console.log(`Magenta 生成了 ${rawVoice.notes?.length || 0} 个音符`);

      // 对齐到原始旋律的时间结构
      const alignedVoice = this.alignToMelody(rawVoice, sopranoNotes, voiceId);
      console.log(`对齐后: ${alignedVoice.length} 个音符`);

      // 调整到目标音域
      const rangedVoice = this.adjustToRange(alignedVoice, voiceName);
      console.log(`调整音域后: ${rangedVoice.length} 个音符`);

      // 应用规则修正
      const correctedVoice = this.applyRuleCorrections(
        rangedVoice,
        sopranoNotes,
        allNotes,
        style as any
      );
      console.log(`规则修正后: ${correctedVoice.length} 个音符`);

      allNotes.push(...correctedVoice);
    }

    // 3. 最终验证
    const finalSequence = this.buildSequence(allNotes, melody);
    
    musicRuleEngine.setStyle(style);
    const validation = musicRuleEngine.validate(finalSequence);
    console.log('最终验证:', validation.violations.length, '个违规');

    console.log('=== 混合生成完成 ===');
    console.log('总音符数:', allNotes.length);

    return finalSequence;
  }

  /**
   * 使用 Magenta 生成原始音乐材料
   */
  private async generateWithMagenta(
    primer: INoteSequence,
    modelType: 'music_rnn' | 'music_vae',
    temperature: number,
    length: number
  ): Promise<INoteSequence> {
    const steps = length * 16;

    if (modelType === 'music_rnn') {
      const model = modelLoader.getMusicRNN();
      return await model.continueSequence(primer, steps, temperature);
    } else {
      const model = modelLoader.getMusicVAE();
      const results = await model.sample(1, temperature);
      return results[0];
    }
  }

  /**
   * 将 Magenta 生成的音符对齐到原始旋律的时间结构
   */
  private alignToMelody(
    generated: INoteSequence,
    melody: HybridNote[],
    voiceId: number
  ): HybridNote[] {
    const aligned: HybridNote[] = [];
    const generatedNotes = generated.notes || [];

    // 为每个旋律音符分配一个生成的音符
    for (let i = 0; i < melody.length; i++) {
      const melodyNote = melody[i];
      
      // 从生成的音符中选择一个（循环使用）
      const genIndex = i % generatedNotes.length;
      const genNote = generatedNotes[genIndex];

      aligned.push({
        pitch: genNote.pitch || 60,
        startTime: melodyNote.startTime,  // 使用旋律的时间
        endTime: melodyNote.endTime,      // 使用旋律的时间
        velocity: genNote.velocity || 80,
        voiceId
      });
    }

    return aligned;
  }

  /**
   * 调整音符到目标声部音域
   */
  private adjustToRange(
    notes: HybridNote[],
    voiceType: 'alto' | 'tenor' | 'bass'
  ): HybridNote[] {
    const range = this.voiceRanges[voiceType];

    return notes.map(note => {
      let pitch = note.pitch;

      // 调整到目标音域
      while (pitch < range.min) pitch += 12;
      while (pitch > range.max) pitch -= 12;

      return { ...note, pitch };
    });
  }

  /**
   * 应用规则修正
   */
  private applyRuleCorrections(
    notes: HybridNote[],
    soprano: HybridNote[],
    existingNotes: HybridNote[],
    style: string
  ): HybridNote[] {
    const corrected: HybridNote[] = [];

    for (let i = 0; i < notes.length; i++) {
      let note = { ...notes[i] };
      const sopranoNote = soprano[i];

      // 规则1: 避免与 soprano 平行八度/五度
      if (i > 0 && style === 'classical') {
        const prevNote = notes[i - 1];
        const prevSoprano = soprano[i - 1];

        const currentInterval = note.pitch - sopranoNote.pitch;
        const prevInterval = prevNote.pitch - prevSoprano.pitch;

        // 检测平行八度
        if (Math.abs(currentInterval % 12) === 0 && Math.abs(prevInterval % 12) === 0) {
          note.pitch += 2; // 调整避免平行八度
        }

        // 检测平行五度
        if (Math.abs(currentInterval % 12) === 7 && Math.abs(prevInterval % 12) === 7) {
          note.pitch += 2; // 调整避免平行五度
        }
      }

      // 规则2: 避免声部交叉
      if (note.pitch > sopranoNote.pitch) {
        note.pitch -= 12;
      }

      // 规则3: 保持合理的声部间距（不超过两个八度）
      const interval = Math.abs(note.pitch - sopranoNote.pitch);
      if (interval > 24) {
        note.pitch = sopranoNote.pitch - 12;
      }

      // 规则4: 避免与已存在的声部音高完全相同
      const sameTimeNotes = existingNotes.filter(
        n => Math.abs(n.startTime - note.startTime) < 0.01
      );
      
      for (const existing of sameTimeNotes) {
        if (Math.abs(existing.pitch - note.pitch) < 2) {
          note.pitch -= 2;
        }
      }

      corrected.push(note);
    }

    return corrected;
  }

  /**
   * 构建最终的 NoteSequence
   */
  private buildSequence(notes: HybridNote[], original: INoteSequence): INoteSequence {
    const convertedNotes = notes.map(note => ({
      pitch: note.pitch,
      startTime: note.startTime,
      endTime: note.endTime,
      velocity: note.velocity,
      voiceId: note.voiceId,
      quantizedStartStep: Math.round(note.startTime * 4),
      quantizedEndStep: Math.round(note.endTime * 4),
      isDrum: false
    }));

    return {
      notes: convertedNotes,
      totalTime: original.totalTime,
      totalQuantizedSteps: original.totalQuantizedSteps,
      quantizationInfo: original.quantizationInfo,
      tempos: original.tempos,
      timeSignatures: original.timeSignatures
    };
  }
}

export const hybridGenerator = new HybridGenerator();
