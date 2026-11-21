import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono uppercase font-bold tracking-wider transition-all select-none whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wt-yellow';

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 py-1 text-xs border-2',
    md: 'min-h-[44px] px-5 py-2 text-sm border-2',
    lg: 'min-h-[52px] px-7 py-3 text-base border-3',
  };

  const variantStyles = {
    primary: 'bg-wt-red text-wt-black border-wt-black shadow-hardW hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
    secondary: 'bg-wt-black/40 text-wt-white border-wt-white hover:bg-wt-yellow hover:text-wt-black hover:border-wt-yellow hover:translate-x-[-2px] hover:translate-y-[-2px]',
    danger: 'bg-wt-black text-wt-red border-wt-red hover:bg-wt-red hover:text-wt-black hover:translate-x-[-2px] hover:translate-y-[-2px]',
    ghost: 'bg-transparent text-wt-white border-transparent hover:bg-white/10 text-wt-gray hover:text-wt-white',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none filter grayscale',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
