import React from 'react';
import { phoneDigits } from '@/lib/contact';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function PhoneInput({ label = 'Mobile number', value, onChange, error, required = false, className = '', id = 'mobile-number' }: { label?: string; value: string; onChange: (value: string) => void; error?: string; required?: boolean; className?: string; id?: string }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}{required && <span className="text-danger-500 ml-1">*</span>}</label>
      <div className={`flex items-center ${error ? 'input-error' : ''} input ${className}`}>
        <span className="pr-2 mr-2 border-r border-slate-700 text-sm text-slate-400">+91</span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={phoneDigits(value)}
          onChange={event => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, 10);
            onChange(digits ? `+91${digits}` : '');
          }}
          className="min-w-0 flex-1 bg-transparent outline-none"
          placeholder="10-digit mobile number"
          required={required}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && <label htmlFor={fieldId} className="label">{label}</label>}
      <input
        id={fieldId}
        {...props}
        className={`input ${error ? 'input-error' : ''} ${className}`}
      />
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, id, className = '', ...props }: TextareaProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && <label htmlFor={fieldId} className="label">{label}</label>}
      <textarea
        id={fieldId}
        {...props}
        className={`input resize-y min-h-[100px] ${error ? 'input-error' : ''} ${className}`}
      />
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, id, options, placeholder, className = '', ...props }: SelectProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && <label htmlFor={fieldId} className="label">{label}</label>}
      <select
        id={fieldId}
        {...props}
        className={`input ${error ? 'input-error' : ''} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
