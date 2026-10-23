import React from 'react';

interface BadgeProps {
  variant?: 'blue' | 'solar' | 'teal' | 'success' | 'warning' | 'danger' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const cls = {
    blue:    'badge-blue',
    solar:   'badge-solar',
    teal:    'badge-teal',
    success: 'badge-success',
    warning: 'badge-warning',
    danger:  'badge-danger',
    default: 'tag',
  }[variant];
  return <span className={`${cls} ${className}`}>{children}</span>;
}
