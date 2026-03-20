import type { INoteSequence } from '@magenta/music';
import { modelLoader } from '../magenta/modelLoader';

interface CounterpointNote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
  voiceId: number;
  isStrongBeat?: boolean;
}

/**
 * 对位复调生成引擎
 * 1. 先在重拍上建立和声框架（检查和弦级数）
 * 2. 然后在弱拍上添加变奏和装饰
 */
export class CounterpointEngine {
  private voiceRanges = {
    soprano: { min: 60, max: 81 },
    alto: { min: 55, max: 74 },
    tenor: { min: 48, max: 67 },
    bass: { min: 40, max: 60 }
  };

  private majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

  private chordDefinitions = {
    I: { root: 0, third: 4, fifth: 7 },
    ii: { root: 2, third: 5, fifth: 9 },
    iii: { root: 4, third: 7, fifth: 11 },
    IV: { root: 5, third: 9, fifth: 0 },
    V: { root: 7, third: 11, fifth: 2 },
    vi: { root: 9, third: 0, fifth: 4 },
    viio: { root: 11, third: 2, fifth: 5 }
  };

  async generateCounterpoint(
    cantusFirmus: INoteSequence,
    voiceCount: number,
    style: string,
    modelType: 'music_rnn' | 'music_vae',
    temperature: number,
    length: number
  ): Promise<INoteSequence> {
    console.log('=== 开始生成对位复调 ===');
    console.log('步骤1: 分析原始旋律结构');

    const sopranoNotes: CounterpointNote[] = this.analyzeAndMarkBeats(
      cantusFirmus.notes || []
    );

    console.log(`Soprano: ${sopranoNotes.length} 个音符，${sopranoNotes.filter(n => n.isStrongBeat).length} 个重拍`);

    const allNotes: CounterpointNote[] = [...sopranoNotes];

    const voiceNames = ['alto', 'tenor', 'bass'];
    const voicesToGenerate = Math.min(voiceCount - 1, 3);

    for (let i = 0; i < voicesToGenerate; i++) {
      const voiceId = i + 1;
      const voiceName = voiceNames[i] as 'alto' | 'tenor' | 'bass';
      
      console.log(`\n步骤${i + 2}: 生成 ${voiceName} 声部`);
      
      console.log('  2.1 建立重拍和声框架...');
      const harmonicFramework = this.buildHarmonicFramework(
        sopranoNotes,
        voiceId,
        voiceName,
        style
      );

      console.log(`  重拍框架: ${harmonicFramework.length} 个音符`);

      console.log('  2.2 使用 Magenta 生成变奏材料...');
      const variationMaterial = await this.generateVariationMaterial(
        cantusFirmus,
        modelType,
        temperature,
        length
      );

      console.log(`  Magenta 生成: ${variationMaterial.length} 个音符`);

      console.log('  2.3 在弱拍上添加变奏...');
      const completeVoice = this.addVariationsToFramework(
        harmonicFramework,
        variationMaterial,
        sopranoNotes,
        voiceId,
        voiceName,
        style
      );

      console.log(`  完整声部: ${completeVoice.length} 个音符`);

      allNotes.push(...completeVoice);
    }

    const finalSequence = this.buildSequence(allNotes, cantusFirmus);
    
    console.log('=== 对位复调生成完成 ===');
    console.log('总音符数:', allNotes.length);

    return finalSequence;
  }

  private analyzeAndMarkBeats(notes: any[]): CounterpointNote[] {
    const beatsPerMeasure = 4;
    const beatDuration = 1.0;

    return notes.map((note) => {
      const startTime = note.startTime || 0;
      const beatPosition = (startTime % beatsPerMeasure) / beatDuration;
      const isStrongBeat = beatPosition < 0.1 || Math.abs(beatPosition - 2) < 0.1;

      return {
        pitch: note.pitch || 60,
        startTime,
        endTime: note.endTime || 0,
        velocity: note.velocity || 80,
        voiceId: 0,
        isStrongBeat
      };
    });
  }

  private buildHarmonicFramework(
    soprano: CounterpointNote[],
    voiceId: number,
    voiceType: 'alto' | 'tenor' | 'bass',
    style: string
  ): CounterpointNote[] {
    const framework: CounterpointNote[] = [];
    const range = this.voiceRanges[voiceType];
    const strongBeats = soprano.filter(n => n.isStrongBeat);

    for (let i = 0; i < strongBeats.length; i++) {
      const sopranoNote = strongBeats[i];
      const chordDegree = this.determineChordDegree(i, strongBeats.length, style);
      const chordTone = this.selectChordTone(sopranoNote.pitch, chordDegree, voiceType, i);

      let pitch = chordTone;
      while (pitch < range.min) pitch += 12;
      while (pitch > range.max) pitch -= 12;
      if (pitch > sopranoNote.pitch) pitch -= 12;

      framework.push({
        pitch,
        startTime: sopranoNote.startTime,
        endTime: sopranoNote.endTime,
        velocity: sopranoNote.velocity,
        voiceId,
        isStrongBeat: true
      });
    }

    return framework;
  }

  private determineChordDegree(position: number, total: number, style: string): keyof typeof this.chordDefinitions {
    const progressions = {
      classical: ['I', 'IV', 'V', 'I', 'vi', 'ii', 'V', 'I'],
      jazz: ['I', 'vi', 'ii', 'V', 'I', 'IV', 'iii', 'vi'],
      modern: ['I', 'V', 'vi', 'IV', 'I', 'iii', 'ii', 'V'],
      experimental: ['I', 'iii', 'vi', 'ii', 'V', 'I', 'IV', 'viio']
    };

    const progression = progressions[style as keyof typeof progressions] || progressions.classical;
    const index = Math.floor((position / total) * progression.length);
    
    return progression[index] as keyof typeof this.chordDefinitions;
  }

  private selectChordTone(
    sopranoPitch: number,
    chordDegree: keyof typeof this.chordDefinitions,
    voiceType: 'alto' | 'tenor' | 'bass',
    position: number
  ): number {
    const chord = this.chordDefinitions[chordDegree];
    const tonic = 60;

    let chordTone: number;
    
    if (voiceType === 'bass') {
      chordTone = tonic + chord.root;
    } else if (voiceType === 'tenor') {
      chordTone = position % 2 === 0 ? tonic + chord.fifth : tonic + chord.root;
    } else {
      chordTone = position % 2 === 0 ? tonic + chord.third : tonic + chord.fifth;
    }

    return chordTone;
  }

  private async generateVariationMaterial(
    cantusFirmus: INoteSequence,
    modelType: 'music_rnn' | 'music_vae',
    temperature: number,
    length: number
  ): Promise<number[]> {
    const steps = length * 16;
    let generated: INoteSequence;

    if (modelType === 'music_rnn') {
      const model = modelLoader.getMusicRNN();
      generated = await model.continueSequence(cantusFirmus, steps, temperature);
    } else {
      const model = modelLoader.getMusicVAE();
      const results = await model.sample(1, temperature);
      generated = results[0];
    }

    return (generated.notes || []).map(n => n.pitch || 60);
  }

  private addVariationsToFramework(
    framework: CounterpointNote[],
    variationPitches: number[],
    soprano: CounterpointNote[],
    voiceId: number,
    voiceType: 'alto' | 'tenor' | 'bass',
    style: string
  ): CounterpointNote[] {
    const complete: CounterpointNote[] = [];
    const range = this.voiceRanges[voiceType];
    let variationIndex = 0;

    for (let i = 0; i < framework.length; i++) {
      const currentFrame = framework[i];
      const nextFrame = framework[i + 1];

      complete.push(currentFrame);

      if (nextFrame) {
        const duration = nextFrame.startTime - currentFrame.startTime;
        
        if (duration > 1.5) {
          const numVariations = style === 'jazz' || style === 'experimental' ? 3 : 2;
          const timeStep = duration / (numVariations + 1);

          for (let j = 1; j <= numVariations; j++) {
            let pitch = variationPitches[variationIndex % variationPitches.length];
            variationIndex++;

            while (pitch < range.min) pitch += 12;
            while (pitch > range.max) pitch -= 12;

            pitch = this.adjustToScale(pitch, currentFrame.pitch);

            const prevPitch = complete[complete.length - 1].pitch;
            if (Math.abs(pitch - prevPitch) > 7) {
              pitch = prevPitch + (pitch > prevPitch ? 2 : -2);
            }

            complete.push({
              pitch,
              startTime: currentFrame.startTime + timeStep * j,
              endTime: currentFrame.startTime + timeStep * (j + 1),
              velocity: currentFrame.velocity - 10,
              voiceId,
              isStrongBeat: false
            });
          }
        } else if (duration > 0.75) {
          let pitch = variationPitches[variationIndex % variationPitches.length];
          variationIndex++;

          while (pitch < range.min) pitch += 12;
          while (pitch > range.max) pitch -= 12;

          pitch = this.adjustToScale(pitch, currentFrame.pitch);

          complete.push({
            pitch,
            startTime: currentFrame.startTime + duration / 2,
            endTime: nextFrame.startTime,
            velocity: currentFrame.velocity - 10,
            voiceId,
            isStrongBeat: false
          });
        }
      }
    }

    return complete;
  }

  private adjustToScale(pitch: number, referencePitch: number): number {
    const pitchClass = pitch % 12;

    if (this.majorScaleIntervals.includes(pitchClass)) {
      return pitch;
    }

    const closest = this.majorScaleIntervals.reduce((prev, curr) => {
      const prevDist = Math.abs((prev - pitchClass + 12) % 12);
      const currDist = Math.abs((curr - pitchClass + 12) % 12);
      return currDist < prevDist ? curr : prev;
    });

    return pitch + (closest - pitchClass);
  }

  private buildSequence(notes: CounterpointNote[], original: INoteSequence): INoteSequence {
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

export const counterpointEngine = new CounterpointEngine();
