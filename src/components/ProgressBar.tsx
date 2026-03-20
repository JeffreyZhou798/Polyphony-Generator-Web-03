import type { GenerationProgress } from '../services/magenta/types';
import { useLanguage } from '../i18n/LanguageContext';

interface ProgressBarProps {
  progress: GenerationProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const { language } = useLanguage();
  
  const getStageIcon = (stage: GenerationProgress['stage']) => {
    const icons = {
      loading: 'bi-download',
      parsing: 'bi-file-earmark-text',
      generating: 'bi-cpu',
      validating: 'bi-check-circle',
      building: 'bi-hammer',
      complete: 'bi-check-circle-fill'
    };
    return icons[stage] || 'bi-hourglass-split';
  };

  const stageLabels = {
    en: {
      loading: 'Loading Model',
      parsing: 'Parsing File',
      generating: 'Generating Music',
      building: 'Building Output',
      complete: 'Complete'
    },
    zh: {
      loading: '加载模型',
      parsing: '解析文件',
      generating: '生成音乐',
      building: '构建输出',
      complete: '完成'
    },
    ja: {
      loading: 'モデル読み込み',
      parsing: 'ファイル解析',
      generating: '音楽生成',
      building: '出力構築',
      complete: '完了'
    }
  };

  const labels = stageLabels[language];
  const stages = [
    { key: 'loading' as const, label: labels.loading },
    { key: 'parsing' as const, label: labels.parsing },
    { key: 'generating' as const, label: labels.generating },
    { key: 'building' as const, label: labels.building },
    { key: 'complete' as const, label: labels.complete }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === progress.stage);

  return (
    <div className="progress-container">
      {/* 进度条 */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${progress.progress}%` }}>
          <span className="progress-text">{progress.progress}%</span>
        </div>
      </div>

      {/* 状态文本 */}
      <p className="progress-status">
        <i className={`bi ${getStageIcon(progress.stage)} me-2`}></i>
        {progress.message}
      </p>

      {/* 步骤指示器 */}
      <div className="progress-steps">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`progress-step ${index <= currentStageIndex ? 'completed' : ''}`}
          >
            <div className="step-number">
              {index <= currentStageIndex ? (
                <i className="bi bi-check"></i>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-title">{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
