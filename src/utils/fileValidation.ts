import { FILE_SIZE_LIMIT, SUPPORTED_FORMATS } from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  // 检查文件大小
  if (file.size > FILE_SIZE_LIMIT) {
    return {
      valid: false,
      error: `文件大小超过限制（最大 ${FILE_SIZE_LIMIT / 1024 / 1024}MB）`
    };
  }

  // 检查文件格式
  const fileName = file.name.toLowerCase();
  const isValidFormat = SUPPORTED_FORMATS.some(format => fileName.endsWith(format));
  
  if (!isValidFormat) {
    return {
      valid: false,
      error: `不支持的文件格式，请上传 ${SUPPORTED_FORMATS.join(' 或 ')} 文件`
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
