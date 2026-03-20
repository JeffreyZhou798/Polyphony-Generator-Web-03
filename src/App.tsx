import { useState, useEffect } from 'react';
import type { INoteSequence } from '@magenta/music';
import FileUpload from './components/FileUpload';
import ParameterControls from './components/ParameterControls';
import GenerateButton from './components/GenerateButton';
import ProgressBar from './components/ProgressBar';
import DownloadButtons from './components/DownloadButtons';
import { musicXMLParser } from './services/musicxml/parser';
import { polyphonyGenerator } from './services/magenta/generator';
import type { GenerationConfig, GenerationProgress } from './services/magenta/types';
import { useLanguage } from './i18n/LanguageContext';
import type { Language } from './i18n/translations';
import './styles/main.css';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    voiceCount: 2,
    length: 8,
    temperature: 1.0,
    modelType: 'music_rnn',
    musicStyle: 'classical'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<INoteSequence | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 注册 Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration);
        })
        .catch((error) => {
          console.log('Service Worker 注册失败:', error);
        });
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // 设置进度回调
      polyphonyGenerator.setProgressCallback(setProgress);

      // 解析文件
      setProgress({ stage: 'parsing', progress: 5, message: '解析文件...' });
      const inputSequence = await musicXMLParser.parseFile(selectedFile);

      // 生成复调
      const generationResult = await polyphonyGenerator.generatePolyphony(inputSequence, config);

      setResult(generationResult.combinedSequence);
      setProgress({ stage: 'complete', progress: 100, message: '生成完成！' });
    } catch (err) {
      console.error('生成失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setProgress(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            {/* 标题 */}
            <div className="text-center mb-5">
              {/* 语言切换 */}
              <div className="d-flex justify-content-end mb-3">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${language === 'en' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${language === 'zh' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setLanguage('zh')}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${language === 'ja' ? 'btn-light' : 'btn-outline-light'}`}
                    onClick={() => setLanguage('ja')}
                  >
                    日本語
                  </button>
                </div>
              </div>
              
              <h1 className="display-4 fw-bold text-white mb-3">
                <i className="bi bi-music-note-beamed me-3"></i>
                {t.title}
              </h1>
              <p className="lead text-white-50">
                {t.subtitle}
              </p>
            </div>

            {/* 主卡片 */}
            <div className="card shadow-lg">
              <div className="card-body p-4">
                {/* 文件上传 */}
                <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />

                {/* 参数配置 */}
                {selectedFile && (
                  <ParameterControls config={config} onChange={setConfig} disabled={isGenerating} />
                )}

                {/* 生成按钮 */}
                {selectedFile && (
                  <GenerateButton
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    isGenerating={isGenerating}
                  />
                )}

                {/* 进度条 */}
                {progress && <ProgressBar progress={progress} />}

                {/* 错误提示 */}
                {error && (
                  <div className="alert alert-danger mt-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {/* 下载按钮 */}
                {result && <DownloadButtons sequence={result} />}
              </div>
            </div>

            {/* 页脚 */}
            <div className="text-center mt-4">
              <p className="text-white-50 small">
                <i className="bi bi-github me-2"></i>
                {t.poweredBy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
