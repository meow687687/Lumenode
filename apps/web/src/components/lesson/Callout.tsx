import React from 'react';
import { Info, Lightbulb, AlertTriangle, Compass } from 'lucide-react';

interface CalloutProps {
  variant?: 'note' | 'tip' | 'warning' | 'deep-dive';
  title?: string;
  content: string;
}

export const Callout: React.FC<CalloutProps> = ({ variant = 'note', title, content }) => {
  const configs = {
    note: {
      icon: Info,
      border: 'border-blue-500/40',
      bg: 'bg-blue-950/20',
      textColor: 'text-blue-300',
      defaultTitle: 'Note',
    },
    tip: {
      icon: Lightbulb,
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20',
      textColor: 'text-emerald-300',
      defaultTitle: 'Pro-Tip',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      textColor: 'text-amber-300',
      defaultTitle: 'Warning',
    },
    'deep-dive': {
      icon: Compass,
      border: 'border-violet-500/40',
      bg: 'bg-violet-950/20',
      textColor: 'text-violet-300',
      defaultTitle: 'Deep Dive',
    },
  };

  const current = configs[variant];
  const Icon = current.icon;

  return (
    <div className={`my-6 rounded-xl border ${current.border} ${current.bg} p-4.5 shadow-sm`}>
      <div className="flex items-center space-x-2.5 mb-2">
        <Icon className={`w-4.5 h-4.5 ${current.textColor}`} />
        <h5 className={`font-semibold text-sm ${current.textColor}`}>{title || current.defaultTitle}</h5>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
    </div>
  );
};
