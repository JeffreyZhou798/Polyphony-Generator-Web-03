import { useLanguage } from '../i18n/LanguageContext';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export default function GenerateButton({ onClick, disabled, isGenerating }: GenerateButtonProps) {
  const { t } = useLanguage();
  
  return (
    <div className="text-center mb-4">
      <button
        className="btn btn-primary btn-lg px-5"
        onClick={onClick}
        disabled={disabled}
      >
        {isGenerating ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {t.generating}
          </>
        ) : (
          <>
            <i className="bi bi-magic me-2"></i>
            {t.generate}
          </>
        )}
      </button>
    </div>
  );
}
