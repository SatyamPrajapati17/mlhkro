import React from 'react';
import { clsx } from 'clsx';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'red' | 'yellow' | 'white' | 'plain';
  hud?: boolean;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'red',
  hud = false,
  interactive = false,
  className,
  ...props
}) => {
  const variantStyles = {
    red: 'glass',
    yellow: 'glass-y',
    white: 'glass-w',
    plain: 'glass-plain',
  };

  return (
    <div
      className={clsx(
        'relative p-5 transition-transform duration-100',
        variantStyles[variant],
        interactive && 'card-motion hover:translate-x-[-2px] hover:translate-y-[-2px]',
        hud && 'hud-container',
        className
      )}
      {...props}
    >
      {hud && (
        <>
          <span className="hud-bracket-tl" />
          <span className="hud-bracket-tr" />
          <span className="hud-bracket-bl" />
          <span className="hud-bracket-br" />
        </>
      )}
      {children}
    </div>
  );
};
