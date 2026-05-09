import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function UploadZone({ onFileSelect, selectedFile, clearFile, isCooked }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload an image (JPG, PNG, WEBP) or a PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1];
      onFileSelect({
        name: file.name,
        type: file.type,
        base64: base64Data,
        mimeType: file.type,
        preview: file.type.startsWith('image/') ? e.target.result : null
      });
    };
    reader.readAsDataURL(file);
  };

  const borderColor = isCooked ? 'border-red-500' : 'border-indigo-500';
  const bgColor = isDragging ? (isCooked ? 'bg-red-950/30' : 'bg-indigo-950/30') : 'bg-slate-800/50';

  return (
    <div className="w-full mb-6">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out ${
            isDragging ? `border-solid ${borderColor} ${bgColor}` : 'border-slate-600 hover:border-slate-400 bg-slate-800/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileInput}
          />
          <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isCooked ? 'text-red-400' : 'text-indigo-400'}`} />
          <h3 className="text-lg font-medium text-slate-200 mb-1">Upload Syllabus or Notes</h3>
          <p className="text-sm text-slate-400">Drag & drop an image or PDF here, or click to select</p>
        </div>
      ) : (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${isCooked ? 'border-red-500/50 bg-red-950/20' : 'border-indigo-500/50 bg-indigo-950/20'}`}>
          <div className="flex items-center space-x-4 overflow-hidden">
            {selectedFile.preview ? (
              <img src={selectedFile.preview} alt="preview" className="w-12 h-12 object-cover rounded-md" />
            ) : (
              <div className="w-12 h-12 bg-slate-700 flex items-center justify-center rounded-md">
                 <FileText className="text-slate-300" />
              </div>
            )}
            <div className="truncate text-sm text-slate-200 font-medium">
              {selectedFile.name}
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); clearFile(); }}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
