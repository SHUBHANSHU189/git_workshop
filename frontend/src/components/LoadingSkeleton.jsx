import React from 'react';
import clsx from 'clsx';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/50 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full">
        <div className="h-10 bg-gray-800/60 rounded-t-lg mb-2"></div>
        {skeletons.map((i) => (
          <div key={i} className="h-16 bg-gray-800/40 border-b border-gray-700/50 flex items-center px-4 gap-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-700 rounded w-2/6"></div>
            <div className="h-4 bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-700 rounded w-1/6"></div>
            <div className="h-6 bg-gray-700 rounded-full w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("animate-pulse bg-gray-800/50 rounded-lg h-full w-full", `min-h-[${count * 50}px]`)}></div>
  );
};

export default LoadingSkeleton;
