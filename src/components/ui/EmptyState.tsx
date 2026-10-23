import React from 'react';
import { PackageSearch, AlertCircle, Inbox, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  variant?: 'no-products' | 'error' | 'empty' | 'offline';
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const CONFIGS = {
  'no-products': {
    Icon: PackageSearch,
    title: 'No products yet',
    description: 'This catalogue is being set up. Check back soon or contact us directly.',
    color: 'text-slate-500',
  },
  error: {
    Icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We could not load this content right now. Please try again.',
    color: 'text-danger-500',
  },
  empty: {
    Icon: Inbox,
    title: 'Nothing here yet',
    description: 'There\'s nothing to show right now.',
    color: 'text-slate-500',
  },
  offline: {
    Icon: WifiOff,
    title: 'Connection issue',
    description: 'Check your internet connection and try again.',
    color: 'text-warning-500',
  },
};

export function EmptyState({ variant = 'empty', title, description, action }: EmptyStateProps) {
  const cfg = CONFIGS[variant];
  const { Icon, color } = cfg;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`mb-4 ${color}`}>
        <Icon className="w-12 h-12 mx-auto opacity-60" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title ?? cfg.title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 text-pretty">{description ?? cfg.description}</p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
