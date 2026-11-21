import React from 'react';
import { clsx } from 'clsx';
import { 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  User, 
  DollarSign,
  Activity
} from 'lucide-react';

export type BadgeStatus = 
  | 'PRESENT' 
  | 'LATE' 
  | 'ABSENT' 
  | 'ON_LEAVE' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'PAID'
  | 'DRAFT'
  | 'ADMIN'
  | 'HR'
  | 'FINANCE'
  | 'MANAGER'
  | 'EMPLOYEE';

export interface BadgeProps {
  status: BadgeStatus | string;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  size = 'md',
  className,
  label,
}) => {
  const normStatus = status.toUpperCase();
  const displayLabel = label || normStatus.replace('_', ' ');

  // Get icon and color scheme based on 4-color palette
  let icon = <Activity className="w-3.5 h-3.5" />;
  let colorStyles = 'bg-wt-black text-wt-white border-wt-white';

  switch (normStatus) {
    case 'PRESENT':
    case 'VERIFIED':
    case 'PAID':
      icon = <Check className="w-3.5 h-3.5 stroke-[3] text-wt-yellow" />;
      colorStyles = 'bg-wt-black text-wt-yellow border-wt-yellow';
      break;
    case 'LATE':
    case 'PENDING':
    case 'DRAFT':
    case 'ON_LEAVE':
      icon = <Clock className="w-3.5 h-3.5 stroke-[2.5] text-wt-yellow" />;
      colorStyles = 'bg-wt-yellow/10 text-wt-yellow border-wt-yellow';
      break;
    case 'ABSENT':
    case 'REJECTED':
      icon = <X className="w-3.5 h-3.5 stroke-[3] text-wt-red" />;
      colorStyles = 'bg-wt-red/10 text-wt-red border-wt-red';
      break;
    case 'ADMIN':
      icon = <ShieldCheck className="w-3.5 h-3.5 text-wt-red" />;
      colorStyles = 'bg-wt-red text-wt-black border-wt-red font-black';
      break;
    case 'HR':
    case 'FINANCE':
    case 'MANAGER':
      icon = <User className="w-3.5 h-3.5 text-wt-yellow" />;
      colorStyles = 'bg-wt-black text-wt-yellow border-wt-yellow';
      break;
    case 'EMPLOYEE':
      icon = <User className="w-3.5 h-3.5 text-wt-white" />;
      colorStyles = 'bg-wt-black text-wt-white border-wt-white';
      break;
    default:
      icon = <Activity className="w-3.5 h-3.5 text-wt-gray" />;
      colorStyles = 'bg-wt-black text-wt-white border-wt-gray';
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono uppercase font-bold tracking-wider border-2 select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        colorStyles,
        className
      )}
    >
      {icon}
      <span>{displayLabel}</span>
    </span>
  );
};
