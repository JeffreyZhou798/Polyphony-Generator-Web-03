import type { INoteSequence } from '@magenta/music';

export interface GenerationConfig {
  voiceCount: 2 | 3 | 4;
  length: number;
  temperature: number;
  modelType: 'music_rnn' | 'music_vae';
  musicStyle: 'classical' | 'pop' | 'jazz' | 'modern';
}

export interface GenerationResult {
  originalMelody: INoteSequence;
  generatedVoices: INoteSequence[];
  combinedSequence: INoteSequence;
}

export interface GenerationProgress {
  stage: 'loading' | 'parsing' | 'generating' | 'validating' | 'building' | 'complete';
  progress: number;
  message: string;
}
