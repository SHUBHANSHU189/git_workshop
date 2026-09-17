import React from 'react';
import clsx from 'clsx';

const RiskTag = ({ level }) => {
  const getProps = () => {
    switch (level?.toLowerCase()) {
      case 'green':
      case 'low':
      case 'comfortable':
        return { color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400', label: '🟢 Comfortable' };
      case 'yellow':
      case 'medium':
      case 'tight':
        return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', label: '🟡 Tight' };
      case 'red':
      case 'high':
      case 'critical':
      case 'likely overrun':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400', label: '🔴 Likely Overrun' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-400', label: 'Unknown' };
    }
  };

  const { color, dot, label } = getProps();

  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border", color)}>
      {label}
    </span>
  );
};

export default RiskTag;
