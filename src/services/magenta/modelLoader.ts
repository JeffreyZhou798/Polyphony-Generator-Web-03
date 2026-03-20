import * as mm from '@magenta/music';

export class MagentaModelLoader {
  private musicRNN: mm.MusicRNN | null = null;
  private musicVAE: mm.MusicVAE | null = null;
  private loadingPromise: Promise<void> | null = null;

  async loadMusicRNN(): Promise<void> {
    if (this.musicRNN) return;

    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    this.loadingPromise = (async () => {
      try {
        console.log('开始加载 MusicRNN 模型...');
        
        this.musicRNN = new mm.MusicRNN(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
        );

        await this.musicRNN.initialize();
        console.log('✅ MusicRNN 模型加载成功');
      } catch (error) {
        console.error('❌ MusicRNN 模型加载失败:', error);
        this.musicRNN = null;
        throw new Error('模型加载失败，请检查网络连接');
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  async loadMusicVAE(): Promise<void> {
    if (this.musicVAE) return;

    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    this.loadingPromise = (async () => {
      try {
        console.log('开始加载 MusicVAE 模型...');
        
        this.musicVAE = new mm.MusicVAE(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'
        );

        await this.musicVAE.initialize();
        console.log('✅ MusicVAE 模型加载成功');
      } catch (error) {
        console.error('❌ MusicVAE 模型加载失败:', error);
        this.musicVAE = null;
        throw new Error('模型加载失败，请检查网络连接');
      } finally {
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  getMusicRNN(): mm.MusicRNN {
    if (!this.musicRNN) {
      throw new Error('MusicRNN 模型未加载');
    }
    return this.musicRNN;
  }

  getMusicVAE(): mm.MusicVAE {
    if (!this.musicVAE) {
      throw new Error('MusicVAE 模型未加载');
    }
    return this.musicVAE;
  }

  isMusicRNNLoaded(): boolean {
    return this.musicRNN !== null;
  }

  isMusicVAELoaded(): boolean {
    return this.musicVAE !== null;
  }

  dispose(): void {
    if (this.musicRNN) {
      this.musicRNN.dispose();
      this.musicRNN = null;
    }
    if (this.musicVAE) {
      this.musicVAE.dispose();
      this.musicVAE = null;
    }
  }
}

export const modelLoader = new MagentaModelLoader();
