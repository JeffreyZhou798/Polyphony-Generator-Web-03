import type { INoteSequence } from '@magenta/music';
import { modelLoader } from './modelLoader';
import type { GenerationConfig, GenerationResult, GenerationProgress } from './types';
import { musicRuleEngine } from '../rules/ruleEngine';
import { counterpointEngine } from '../polyphony/counterpointEngine';

export class PolyphonyGenerator {
  private progressCallback?: (progress: GenerationProgress) => void;

  setProgressCallback(callback: (progress: GenerationProgress) => void): void {
    this.progressCallback = callback;
  }

  private updateProgress(stage: GenerationProgress['stage'], progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message });
    }
  }

  async generatePolyphony(
    inputSequence: INoteSequence,
    config: GenerationConfig
  ): Promise<GenerationResult> {
    console.log('=== 开始生成复调 ===');
    console.log('输入序列:', inputSequence);
    console.log('配置:', config);
    console.log('输入音符数量:', inputSequence.notes?.length || 0);
    
    this.updateProgress('loading', 10, '加载 AI 模型...');

    // 加载 Magenta 模型
    if (config.modelType === 'music_rnn') {
      await modelLoader.loadMusicRNN();
      console.log('✅ MusicRNN 模型已加载');
    } else {
      await modelLoader.loadMusicVAE();
      console.log('✅ MusicVAE 模型已加载');
    }

    this.updateProgress('generating', 30, '生成对位声部...');
    
    const originalMelody = inputSequence;
    
    // 使用对位法引擎：重拍和声框架 + 弱拍变奏
    const combinedSequence = await counterpointEngine.generateCounterpoint(
      inputSequence,
      config.voiceCount,
      config.musicStyle,
      config.modelType,
      config.temperature,
      config.length
    );

    console.log('生成后总音符数:', combinedSequence.notes?.length || 0);

    // 提取生成的声部（用于返回结果）
    const generatedVoices: INoteSequence[] = [];
    for (let i = 1; i < config.voiceCount; i++) {
      const voiceNotes = (combinedSequence.notes || []).filter(n => (n as any).voiceId === i);
      generatedVoices.push({
        notes: voiceNotes,
        totalTime: combinedSequence.totalTime,
        tempos: combinedSequence.tempos,
        timeSignatures: combinedSequence.timeSignatures
      });
      console.log(`声部 ${i}: ${voiceNotes.length} 个音符`);
    }

    this.updateProgress('validating', 90, '最终验证...');
    
    // 最终验证
    musicRuleEngine.setStyle(config.musicStyle);
    const validation = musicRuleEngine.validate(combinedSequence);
    
    if (validation.violations.length > 0) {
      console.log('音乐规则验证结果:', validation.violations);
    }

    this.updateProgress('complete', 100, '生成完成！');
    
    console.log('=== 生成完成 ===');
    console.log('最终结果:', {
      originalNotes: originalMelody.notes?.length || 0,
      generatedVoices: generatedVoices.length,
      totalNotes: combinedSequence.notes?.length || 0
    });

    return {
      originalMelody,
      generatedVoices,
      combinedSequence
    };
  }

  // 保留 Magenta 相关方法以备将来使用
  private async generateWithMagenta(
    inputSequence: INoteSequence,
    config: GenerationConfig
  ): Promise<GenerationResult> {
    // 加载模型
    if (config.modelType === 'music_rnn') {
      await modelLoader.loadMusicRNN();
    } else {
      await modelLoader.loadMusicVAE();
    }

    const originalMelody = inputSequence;
    const generatedVoices: INoteSequence[] = [];

    // 生成声部
    const voicesToGenerate = config.voiceCount - 1;
    
    for (let i = 0; i < voicesToGenerate; i++) {
      const voice = await this.generateSingleVoice(inputSequence, config, i);
      generatedVoices.push(voice);
    }

    const combinedSequence = this.buildPolyphonicStructure(originalMelody, generatedVoices);

    return {
      originalMelody,
      generatedVoices,
      combinedSequence
    };
  }

  private async generateSingleVoice(
    primer: INoteSequence,
    config: GenerationConfig,
    voiceIndex: number
  ): Promise<INoteSequence> {
    const steps = config.length * 16; // 每小节16步
    const temperature = config.temperature;

    try {
      console.log(`生成声部 ${voiceIndex + 1}, steps: ${steps}, temperature: ${temperature}`);
      console.log('Primer sequence:', primer);
      
      if (config.modelType === 'music_rnn') {
        const model = modelLoader.getMusicRNN();
        
        // 使用 continueSequence 生成新的音符
        const result = await model.continueSequence(primer, steps, temperature);
        
        console.log(`声部 ${voiceIndex + 1} 生成结果:`, result);
        console.log(`生成的音符数量: ${result.notes?.length || 0}`);
        
        // 调整音高范围以避免声部重叠
        return this.adjustVoiceRange(result, voiceIndex, config.voiceCount);
      } else {
        const model = modelLoader.getMusicVAE();
        
        // MusicVAE 生成
        const result = await model.sample(1, temperature);
        
        console.log(`声部 ${voiceIndex + 1} 生成结果:`, result[0]);
        console.log(`生成的音符数量: ${result[0].notes?.length || 0}`);
        
        return this.adjustVoiceRange(result[0], voiceIndex, config.voiceCount);
      }
    } catch (error) {
      console.error(`生成声部 ${voiceIndex + 1} 失败:`, error);
      throw new Error(`生成第 ${voiceIndex + 1} 条声部失败: ${error}`);
    }
  }

  private adjustVoiceRange(
    sequence: INoteSequence,
    voiceIndex: number,
    _totalVoices: number
  ): INoteSequence {
    // 定义声部音域
    const voiceRanges = [
      { min: 60, max: 84 }, // Soprano (C4-C6)
      { min: 55, max: 72 }, // Alto (G3-C5)
      { min: 48, max: 67 }, // Tenor (C3-G4)
      { min: 36, max: 55 }  // Bass (C2-G3)
    ];

    const range = voiceRanges[voiceIndex] || voiceRanges[0];

    if (!sequence.notes) {
      return sequence;
    }

    const adjustedNotes = sequence.notes.map(note => {
      let pitch = note.pitch || 60;

      // 调整到目标音域
      while (pitch < range.min) pitch += 12;
      while (pitch > range.max) pitch -= 12;

      return { ...note, pitch };
    });

    return {
      ...sequence,
      notes: adjustedNotes
    };
  }

  private buildPolyphonicStructure(
    originalMelody: INoteSequence,
    generatedVoices: INoteSequence[]
  ): INoteSequence {
    // 原始旋律保持在最高声部，添加 voiceId
    const sopranoNotes = (originalMelody.notes || []).map(note => ({
      ...note,
      voiceId: 0
    }));

    // 为生成的声部分配 voiceId
    const allVoiceNotes = [sopranoNotes];
    
    generatedVoices.forEach((voice, index) => {
      const voiceId = index + 1;
      const adjustedNotes = (voice.notes || []).map(note => ({
        ...note,
        voiceId
      }));
      allVoiceNotes.push(adjustedNotes);
    });

    // 合并所有声部
    const allNotes = allVoiceNotes.flat();
    allNotes.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

    const totalTime = Math.max(
      originalMelody.totalTime || 0,
      ...generatedVoices.map(v => v.totalTime || 0)
    );

    return {
      notes: allNotes,
      totalTime,
      tempos: originalMelody.tempos,
      timeSignatures: originalMelody.timeSignatures,
      totalQuantizedSteps: originalMelody.totalQuantizedSteps,
      quantizationInfo: originalMelody.quantizationInfo
    };
  }
}

export const polyphonyGenerator = new PolyphonyGenerator();
