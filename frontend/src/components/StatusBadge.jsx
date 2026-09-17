import React from 'react';
import clsx from 'clsx';

const StatusBadge = ({ status, variant = 'neutral' }) => {
  const variants = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  const dots = {
    success: 'bg-green-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    neutral: 'bg-gray-400'
  };

  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      variants[variant] || variants.neutral
    )}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", dots[variant] || dots.neutral)} />
      {status}
    </span>
  );
};

export default StatusBadge;
