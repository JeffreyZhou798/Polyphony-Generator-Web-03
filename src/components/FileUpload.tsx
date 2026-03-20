import { useRef, useState } from 'react';
import { validateFile, formatFileSize } from '../utils/fileValidation';
import { useLanguage } from '../i18n/LanguageContext';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || '文件验证失败');
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  return (
    <div className="mb-4">
      <h5 className="card-title mb-3">
        <i className="bi bi-cloud-upload me-2"></i>
        {t.uploadTitle}
      </h5>

      <div
        className={`upload-area ${isDragging ? 'drag-over' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".musicxml,.mxl"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />

        <div className="upload-content text-center py-5">
          {selectedFile ? (
            <>
              <i className="bi bi-file-earmark-music text-success" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-3 mb-2">{selectedFile.name}</h5>
              <p className="text-muted mb-0">{formatFileSize(selectedFile.size)}</p>
              <button className="btn btn-sm btn-outline-primary mt-3" onClick={handleClick}>
                <i className="bi bi-arrow-repeat me-2"></i>
                {t.fileName}
              </button>
            </>
          ) : (
            <>
              <i className="bi bi-cloud-upload" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-3 mb-2">{t.dragDrop}</h5>
              <p className="text-muted mb-0">{t.uploadDesc}</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}
    </div>
  );
}
