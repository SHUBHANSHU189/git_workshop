import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Zap, Play } from 'lucide-react';
import RiskTag from '../components/RiskTag';

const Maintenance = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const corridors = ['Delhi-Howrah', 'Mumbai-Delhi', 'Chennai-Howrah', 'Delhi-Chennai'];

  // Mock block data
  const blocks = [
    { id: 1, corridor: 0, start: 2, duration: 4, type: 'Track', dept: 'blue', risk: 'yellow', tasks: 3, trainsAffected: 4 },
    { id: 2, corridor: 0, start: 10, duration: 3, type: 'OHE', dept: 'amber', risk: 'red', tasks: 1, trainsAffected: 12 },
    { id: 3, corridor: 1, start: 1, duration: 5, type: 'Signal', dept: 'purple', risk: 'green', tasks: 2, trainsAffected: 2 },
    { id: 4, corridor: 2, start: 14, duration: 4, type: 'Bridge', dept: 'gray', risk: 'yellow', tasks: 1, trainsAffected: 8 },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">
            <button className="text-gray-400 hover:text-white"><ChevronLeft size={18}/></button>
            <span className="text-sm font-medium flex items-center gap-2"><CalendarIcon size={14}/> Today, 25 Oct</span>
            <button className="text-gray-400 hover:text-white"><ChevronRight size={18}/></button>
          </div>
          <div className="text-sm text-gray-400"><strong className="text-white">12</strong> Blocks Today</div>
          <div className="text-sm text-gray-400"><strong className="text-amber-400">3</strong> Pending Approval</div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-105">
          <Zap size={16} /> Auto-Optimize Schedule
        </button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Timeline View */}
        <div className="flex-1 bg-gray-800/30 border border-gray-700/50 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-900/50">
            <h3 className="font-semibold">Corridor Block Timeline</h3>
          </div>
          
          <div className="flex-1 overflow-auto p-4 relative">
            <div className="min-w-[800px]">
              {/* X-axis hours */}
              <div className="flex ml-[120px] mb-4 border-b border-gray-700 pb-2">
                {hours.map(h => (
                  <div key={h} className="flex-1 text-xs text-gray-500 text-center font-mono">
                    {h.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Corridors */}
              <div className="space-y-6">
                {corridors.map((corridor, idx) => (
                  <div key={idx} className="flex items-center group">
                    <div className="w-[120px] text-sm font-medium text-gray-300 truncate pr-4">{corridor}</div>
                    <div className="flex-1 relative h-16 bg-gradient-to-r from-gray-900/80 via-gray-800/30 to-gray-900/80 rounded border border-gray-800/50 flex">
                      {/* Grid lines */}
                      {hours.map(h => (
                        <div key={h} className="flex-1 border-l border-gray-800/30 h-full"></div>
                      ))}

                      {/* Blocks for this corridor */}
                      {blocks.filter(b => b.corridor === idx).map(block => (
                        <div 
                          key={block.id}
                          onClick={() => setSelectedBlock(block)}
                          className={`absolute top-1 bottom-1 rounded-md border shadow-lg cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group/block
                            ${selectedBlock?.id === block.id ? 'ring-2 ring-white z-10' : 'z-0'}
                            bg-${block.dept}-500/20 border-${block.dept}-500/50 hover:bg-${block.dept}-500/30`}
                          style={{
                            left: `${(block.start / 24) * 100}%`,
                            width: `${(block.duration / 24) * 100}%`
                          }}
                        >
                          <div className="p-1 h-full flex flex-col justify-between overflow-hidden">
                            <div className="text-[10px] font-bold text-white truncate">{block.type}</div>
                            <div className={`w-2 h-2 rounded-full ${block.risk === 'red' ? 'bg-red-500' : block.risk === 'yellow' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedBlock ? (
          <div className="w-80 bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 flex flex-col gap-6 animate-in slide-in-from-right-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${selectedBlock.dept}-500/20 text-${selectedBlock.dept}-400 border border-${selectedBlock.dept}-500/30 uppercase`}>
                  {selectedBlock.type} BLOCK
                </span>
                <RiskTag level={selectedBlock.risk} />
              </div>
              <h3 className="text-xl font-bold">{corridors[selectedBlock.corridor]}</h3>
              <p className="text-gray-400 text-sm mt-1">{selectedBlock.start}:00 - {selectedBlock.start + selectedBlock.duration}:00 ({selectedBlock.duration} hrs)</p>
            </div>

            <div className="space-y-3 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bundled Tasks</span>
                <span className="font-bold">{selectedBlock.tasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Trains Affected</span>
                <span className="font-bold text-amber-400">{selectedBlock.trainsAffected}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Delay Mins</span>
                <span className="font-bold text-red-400">{selectedBlock.trainsAffected * 15}m</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Reasoning Trail</h4>
              <p className="text-sm text-gray-300 italic leading-relaxed">
                "Scheduled during secondary traffic lull. Bundled 2 overdue track renewals. Acceptable impact on 4 express trains."
              </p>
            </div>

            <div className="mt-auto flex gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition-colors">Approve</button>
              <button className="flex-1 bg-gray-700 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors">Reject</button>
            </div>
          </div>
        ) : (
          <div className="w-80 bg-gray-800/20 border border-gray-700/50 rounded-xl flex items-center justify-center p-6 text-center border-dashed">
            <p className="text-gray-500 text-sm">Select a block on the timeline to view details and approve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
