import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({ icon: Icon, label, value, change, isPositive, hideTrend = false }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{label}</h3>
        {Icon && (
          <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
            <Icon size={20} className="text-gray-400 group-hover:text-blue-400" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-white">{value}</p>
        {!hideTrend && change && (
          <div className={clsx(
            "flex items-center text-sm font-medium",
            isPositive === true ? "text-green-400" : isPositive === false ? "text-red-400" : "text-gray-400"
          )}>
            {isPositive === true ? <TrendingUp size={16} className="mr-1" /> : 
             isPositive === false ? <TrendingDown size={16} className="mr-1" /> : 
             <Minus size={16} className="mr-1" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
