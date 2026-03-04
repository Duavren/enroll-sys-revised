import { useState } from 'react';
import { Button } from './button';
import { Upload, X, File, Download } from 'lucide-react';
import { Label } from './label';

interface DocumentUploadProps {
  label: string;
  description: string;
  docType: string;
  onFileSelect: (docType: string, file: File) => void;
  selectedFile?: File;
  acceptedFormats?: string;
  downloadUrl?: string;
  downloadLabel?: string;
}

export function DocumentUpload({
  label,
  description,
  docType,
  onFileSelect,
  selectedFile,
  acceptedFormats = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  downloadUrl,
  downloadLabel
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFormats = acceptedFormats.split(',').map(f => f.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return false;
    }

    if (!validFormats.includes(fileExtension)) {
      setError(`Invalid file format. Accepted: ${acceptedFormats}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(docType, file);
    }
  };
  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: any) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Label className="block mb-1">{label}</Label>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {downloadUrl && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={() => window.open(downloadUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" />
              {downloadLabel || 'Download'}
            </Button>
          )}
          {selectedFile && (
            <button
              onClick={() => onFileSelect(docType, null as any)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
          }`}
        >
          <input
            type="file"
            id={`upload-${docType}`}
            className="hidden"
            onChange={handleInputChange}
            accept={acceptedFormats}
          />
          <label htmlFor={`upload-${docType}`} className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {acceptedFormats}
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <File className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-green-700">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
