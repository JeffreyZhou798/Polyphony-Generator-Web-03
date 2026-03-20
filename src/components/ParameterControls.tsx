import type { GenerationConfig } from '../services/magenta/types';
import { VOICE_COUNTS, GENERATION_LENGTHS, TEMPERATURE_RANGE } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';

interface ParameterControlsProps {
  config: GenerationConfig;
  onChange: (config: GenerationConfig) => void;
  disabled?: boolean;
}

export default function ParameterControls({ config, onChange, disabled }: ParameterControlsProps) {
  const { t } = useLanguage();
  const updateConfig = (updates: Partial<GenerationConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">
        <i className="bi bi-sliders me-2"></i>
        {t.musicStyle}
      </h5>

      <div className="row g-3">
        {/* 音乐风格 */}
        <div className="col-md-6">
          <label className="form-label">{t.musicStyle}</label>
          <select
            className="form-select"
            value={config.musicStyle}
            onChange={(e) => updateConfig({ musicStyle: e.target.value as any })}
            disabled={disabled}
          >
            <option value="classical">{t.styles.classical}</option>
            <option value="jazz">{t.styles.jazz}</option>
            <option value="modern">{t.styles.modern}</option>
            <option value="experimental">{t.styles.experimental}</option>
          </select>
        </div>

        {/* 声部数量 */}
        <div className="col-md-6">
          <label className="form-label">{t.voiceCount}</label>
          <select
            className="form-select"
            value={config.voiceCount}
            onChange={(e) => updateConfig({ voiceCount: parseInt(e.target.value) as any })}
            disabled={disabled}
          >
            {VOICE_COUNTS.map(count => (
              <option key={count} value={count}>
                {count} {t.voiceCount}
              </option>
            ))}
          </select>
        </div>

        {/* 生成长度 */}
        <div className="col-md-6">
          <label className="form-label">{t.generationLength}</label>
          <select
            className="form-select"
            value={config.length}
            onChange={(e) => updateConfig({ length: parseInt(e.target.value) })}
            disabled={disabled}
          >
            {GENERATION_LENGTHS.map(length => (
              <option key={length} value={length}>{length} {t.measures}</option>
            ))}
          </select>
        </div>

        {/* 模型选择 */}
        <div className="col-md-6">
          <label className="form-label">{t.aiModel}</label>
          <select
            className="form-select"
            value={config.modelType}
            onChange={(e) => updateConfig({ modelType: e.target.value as any })}
            disabled={disabled}
          >
            <option value="music_rnn">MusicRNN</option>
            <option value="music_vae">MusicVAE</option>
          </select>
        </div>

        {/* 温度参数 */}
        <div className="col-12">
          <label className="form-label">
            {t.creativity}: {config.temperature.toFixed(1)}
          </label>
          <input
            type="range"
            className="form-range"
            min={TEMPERATURE_RANGE.MIN}
            max={TEMPERATURE_RANGE.MAX}
            step="0.1"
            value={config.temperature}
            onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
            disabled={disabled}
          />
          <div className="d-flex justify-content-between">
            <small className="text-muted">0.5</small>
            <small className="text-muted">1.0</small>
            <small className="text-muted">2.0</small>
          </div>
        </div>
      </div>
    </div>
  );
}
