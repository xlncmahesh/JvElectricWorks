import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label?: string;
  multiple?: boolean;
  required?: boolean;
  error?: string;
  maxFiles?: number;
  onChange: (files: File[]) => void;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE_MB = 10;

export function ImageUpload({ label, multiple = true, required, error, maxFiles = 5, onChange }: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid: File[] = [];
    for (const f of Array.from(incoming)) {
      if (!ACCEPTED.includes(f.type)) continue;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) continue;
      valid.push(f);
    }
    const merged = [...files, ...valid].slice(0, maxFiles);
    setFiles(merged);
    onChange(merged);
    const newPreviews = merged.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return newPreviews; });
  };

  const remove = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    const newFiles = files.filter((_, idx) => idx !== i);
    const newPreviews = previews.filter((_, idx) => idx !== i);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`
          cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${dragOver ? 'border-electric-400 bg-electric-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}
          ${error ? 'border-danger-500' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          multiple={multiple}
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
        <p className="text-sm text-slate-400">
          <span className="text-electric-400 font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP up to {MAX_SIZE_MB} MB each — max {maxFiles} photos</p>
      </div>
      {error && <p className="field-error">{error}</p>}
      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden ring-1 ring-slate-700 bg-slate-800">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-electric-500/80 text-white py-0.5 font-medium">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(i); }}
                className="absolute top-1 right-1 w-5 h-5 bg-slate-950/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-600"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {files.length < maxFiles && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg ring-1 ring-dashed ring-slate-700 flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 hover:ring-slate-600 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1">Add</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
