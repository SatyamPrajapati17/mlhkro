import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 font-mono">
      {label && (
        <label htmlFor={inputId} className="text-xs uppercase font-bold tracking-wider text-wt-white">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'w-full min-h-[44px] px-3.5 py-2 bg-wt-black text-wt-white font-mono text-sm border-2 border-wt-white outline-none transition-colors placeholder:text-wt-gray',
          'focus:border-wt-yellow focus:ring-2 focus:ring-wt-yellow',
          error && 'border-wt-red focus:border-wt-red focus:ring-wt-red',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-wt-red font-mono font-bold mt-0.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-wt-gray font-mono mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
