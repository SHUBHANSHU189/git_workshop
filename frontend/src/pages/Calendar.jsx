import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

const Calendar = () => {
  const [view, setView] = useState('week');
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><CalIcon size={20} className="text-blue-400"/> October 2023</h2>
          <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
            <button className="p-1 text-gray-400 hover:text-white"><ChevronLeft size={18}/></button>
            <span className="text-sm px-2 text-gray-300">This Week</span>
            <button className="p-1 text-gray-400 hover:text-white"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
          <button 
            onClick={() => setView('week')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <List size={16} /> Weekly
          </button>
          <button 
            onClick={() => setView('month')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Grid size={16} /> Monthly
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
          {/* Week Grid Header */}
          <div className="grid grid-cols-7 border-b border-gray-800">
            {weekDays.map((date, i) => (
              <div key={i} className={`p-3 text-center border-r border-gray-800 last:border-0 ${i === 2 ? 'bg-blue-900/20' : ''}`}>
                <div className="text-xs text-gray-500 font-medium uppercase">{format(date, 'EEE')}</div>
                <div className={`text-lg font-bold mt-1 ${i === 2 ? 'text-blue-400' : 'text-gray-300'}`}>{format(date, 'd')}</div>
              </div>
            ))}
          </div>
          
          {/* Week Grid Body */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((_, i) => (
              <div key={i} className={`border-r border-gray-800 last:border-0 p-2 space-y-2 ${i === 2 ? 'bg-blue-900/10' : ''}`}>
                {i === 1 && (
                  <div className="bg-gray-800/80 border border-gray-700 rounded p-2 text-xs cursor-pointer hover:border-gray-500">
                    <div className="font-bold text-gray-300">02:00 - 06:00</div>
                    <div className="text-blue-400 font-medium truncate">Delhi-Howrah</div>
                    <div className="text-gray-500 mt-1">Track • Approved</div>
                  </div>
                )}
                {i === 2 && (
                  <>
                    <div className="bg-blue-900/40 border border-blue-500/50 rounded p-2 text-xs cursor-pointer hover:border-blue-400 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="font-bold text-white pl-1">10:00 - 13:00</div>
                      <div className="text-blue-200 font-medium truncate pl-1">Mumbai-Delhi</div>
                      <div className="text-blue-400/80 mt-1 pl-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span> Active</div>
                    </div>
                    <div className="bg-gray-800/80 border border-green-500/30 rounded p-2 text-xs cursor-pointer">
                      <div className="font-bold text-gray-300">14:00 - 18:00</div>
                      <div className="text-green-400 font-medium truncate">Chennai-Howrah</div>
                      <div className="text-gray-500 mt-1">Bridge • Approved</div>
                    </div>
                  </>
                )}
                {i === 4 && (
                  <div className="bg-gray-800/80 border border-red-500/30 rounded p-2 text-xs cursor-pointer opacity-75">
                    <div className="font-bold text-gray-400 line-through">09:00 - 12:00</div>
                    <div className="text-red-400 font-medium truncate">Delhi-Chennai</div>
                    <div className="text-red-500 mt-1">Rejected</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend sidebar */}
        <div className="w-64 bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full border border-gray-500 bg-gray-800"></div>
              <span className="text-gray-400">Proposed</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              <span className="text-gray-300">Approved</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-white font-medium">Active</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span className="text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-3 h-3 rounded-full border border-red-500 bg-red-500/10"></div>
              <span className="text-red-400 line-through">Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
