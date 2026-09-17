import React, { useState, useMemo } from 'react';
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Info, Calendar, X } from 'lucide-react';

const DEPT_COLORS = {
  'Engineering': { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  'Signal & Telecom': { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  'Traction Distribution': { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' }
};

const RISK_BADGES = {
  'comfortable': { label: '🟢 Comfortable', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  'tight': { label: '🟡 Tight Window', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  'likely-overrun': { label: '🔴 Likely Overrun', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

export default function CorridorTimeline({ corridors, scheduledBlocks, tasks, horizon }) {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group blocks by corridor
  const blocksByCorridor = useMemo(() => {
    const map = {};
    corridors.forEach(c => { map[c.id] = []; });
    scheduledBlocks.forEach(b => {
      if (map[b.corridorId]) {
        map[b.corridorId].push(b);
      }
    });
    return map;
  }, [corridors, scheduledBlocks]);

  // Helper for traffic density heat background
  // Density range 0-30 trains/hr -> opacity 0.05 to 0.65
  const getTrafficHeatColor = (trainCount) => {
    const intensity = Math.min(trainCount / 30, 1.0);
    return `rgba(239, 68, 68, ${0.05 + intensity * 0.45})`; // Red traffic heat overlay
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Corridor Block Gantt Timeline & Traffic Density
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Department-colored scheduled windows overlaid on hourly train-traffic heat density (darker background = heavier traffic density).
          </p>
        </div>

        {/* Department & Risk Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold">Depts:</span>
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Eng (TMS)</span>
            <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Signal (SMMS)</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Traction (TDMS)</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold">Traffic Heat:</span>
            <div className="w-16 h-3 rounded bg-gradient-to-r from-red-950 via-red-800 to-red-500"></div>
            <span className="text-[10px] text-slate-500">High Density</span>
          </div>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] space-y-4">

          {/* Time axis header */}
          <div className="grid grid-cols-[220px_1fr] items-center text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
            <div className="font-semibold text-slate-300">Corridor / Section</div>
            <div className="grid grid-cols-24 gap-px text-center">
              {hours.map(h => (
                <div key={h} className="text-[10px] text-slate-400 font-semibold">
                  {String(h).padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          {/* Corridor Rows */}
          {corridors.map(corridor => {
            const corridorBlocks = blocksByCorridor[corridor.id] || [];
            const traffic = corridor.dailyTrainTrafficByHour || Array(24).fill(10);

            return (
              <div key={corridor.id} className="grid grid-cols-[220px_1fr] items-center gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 hover:border-slate-700 transition">
                {/* Corridor Info Column */}
                <div>
                  <div className="font-bold text-sm text-slate-200">{corridor.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{corridor.sectionFrom} ➔ {corridor.sectionTo}</div>
                  <div className="text-[10px] text-blue-400 mt-0.5">
                    {corridorBlocks.length} block window(s) scheduled
                  </div>
                </div>

                {/* 24-Hour Timeline Grid Container */}
                <div className="relative h-14 grid grid-cols-24 rounded border border-slate-800/60 overflow-hidden">
                  {/* Traffic Heatmap Background Cells */}
                  {hours.map(h => (
                    <div
                      key={h}
                      style={{ backgroundColor: getTrafficHeatColor(traffic[h]) }}
                      className="border-r border-slate-900/40 relative group flex flex-col justify-between p-0.5"
                    >
                      <span className="text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 font-mono transition">
                        {traffic[h]}t
                      </span>
                    </div>
                  ))}

                  {/* Scheduled Block Markers */}
                  {corridorBlocks.map(block => {
                    const duration = block.endHour - block.startHour;
                    const leftPct = (block.startHour / 24) * 100;
                    const widthPct = (duration / 24) * 100;

                    // Primary department color
                    const primaryDept = block.departments[0] || 'Engineering';
                    const deptStyle = DEPT_COLORS[primaryDept] || DEPT_COLORS['Engineering'];
                    const isMultiDept = block.departments.length > 1;

                    const risk = RISK_BADGES[block.riskTag] || RISK_BADGES['comfortable'];

                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`absolute top-1 bottom-1 border-2 rounded-md p-1.5 cursor-pointer shadow-lg transition-all hover:scale-[1.02] hover:z-20 flex flex-col justify-between ${deptStyle.bg} ${deptStyle.border}`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={`${deptStyle.text} font-mono truncate`}>{block.id}</span>
                          <span className="text-[9px] px-1 rounded bg-slate-900/80 text-slate-300 font-normal">
                            {String(block.startHour).padStart(2, '0')}:00-{String(block.endHour).padStart(2, '0')}:00
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] mt-0.5">
                          <span className="text-slate-200 truncate">
                            {isMultiDept ? `🔀 Combined (${block.departments.length} Depts)` : primaryDept}
                          </span>
                          <span className="text-[8px] font-semibold">{risk.label.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-100">{selectedBlock.id}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${RISK_BADGES[selectedBlock.riskTag]?.color}`}>
                    {RISK_BADGES[selectedBlock.riskTag]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Scheduled Window: {selectedBlock.date} • {String(selectedBlock.startHour).padStart(2, '0')}:00 to {String(selectedBlock.endHour).padStart(2, '0')}:00 ({selectedBlock.endHour - selectedBlock.startHour} hours)</p>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Departments involved */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Participating Departments</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBlock.departments.map(d => (
                  <span key={d} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${DEPT_COLORS[d]?.badge || 'bg-slate-800 text-slate-200'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Overrun Risk Explanation */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Overrun Risk Evaluation Heuristic
              </div>
              <p className="text-slate-400">{selectedBlock.riskReason || 'Evaluated based on task work types and window buffer margin.'}</p>
            </div>

            {/* Merged Tasks List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Merged Maintenance Tasks ({selectedBlock.mergedTaskIds?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedBlock.tasks || []).map(t => (
                  <div key={t.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{t.id}: {t.defectType}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{t.sectionName} • Est Duration: {t.estimatedDurationHours}h</div>
                      <div className="text-slate-500 text-[10px] mt-1">{t.description}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 font-mono font-semibold rounded text-[11px] border border-blue-500/20">
                        Score {t.priorityScore || 85}
                      </span>
                      {t.isOverdue && (
                        <div className="text-[10px] text-rose-400 font-semibold mt-1">Overdue</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
