import { useState } from 'react';
import type { INoteSequence } from '@magenta/music';
import { musicXMLBuilder } from '../services/musicxml/builder';
import { useLanguage } from '../i18n/LanguageContext';

interface DownloadButtonsProps {
  sequence: INoteSequence;
}

export default function DownloadButtons({ sequence }: DownloadButtonsProps) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'musicxml' | 'mxl' | 'midi') => {
    setDownloading(format);
    try {
      const filename = `polyphony_${Date.now()}`;
      
      switch (format) {
        case 'musicxml':
          await musicXMLBuilder.exportMusicXML(sequence, filename);
          break;
        case 'mxl':
          await musicXMLBuilder.exportMXL(sequence, filename);
          break;
        case 'midi':
          await musicXMLBuilder.exportMIDI(sequence, filename);
          break;
      }
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="result-area">
      <div className="alert alert-success" role="alert">
        <i className="bi bi-check-circle-fill me-2"></i>
        {t.generationComplete} {sequence.notes?.length || 0} {t.notes}
      </div>

      <h5 className="mb-3">
        <i className="bi bi-download me-2"></i>
        {t.downloadResults}
      </h5>

      <div className="row g-3">
        <div className="col-md-4">
          <button
            className="btn btn-success w-100"
            onClick={() => handleDownload('mxl')}
            disabled={downloading !== null}
          >
            {downloading === 'mxl' ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-file-earmark-zip me-2"></i>
            )}
            {t.mxlFormat}
            <small className="d-block text-white-50">{t.musescoreRecommended}</small>
          </button>
        </div>

        <div className="col-md-4">
          <button
            className="btn btn-outline-success w-100"
            onClick={() => handleDownload('musicxml')}
            disabled={downloading !== null}
          >
            {downloading === 'musicxml' ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-file-earmark-code me-2"></i>
            )}
            {t.musicxmlFormat}
            <small className="d-block text-muted">{t.plainTextFormat}</small>
          </button>
        </div>

        <div className="col-md-4">
          <button
            className="btn btn-outline-success w-100"
            onClick={() => handleDownload('midi')}
            disabled={downloading !== null}
          >
            {downloading === 'midi' ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-file-earmark-music me-2"></i>
            )}
            {t.midiFormat}
            <small className="d-block text-muted">{t.universalFormat}</small>
          </button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-muted small mb-0">
          <i className="bi bi-info-circle me-1"></i>
          {t.downloadTip}
        </p>
      </div>
    </div>
  );
}
