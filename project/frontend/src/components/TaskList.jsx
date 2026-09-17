import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle, Info, ShieldAlert, CheckCircle } from 'lucide-react';

const DEPT_BADGES = {
  'Engineering': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Signal & Telecom': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Traction Distribution': 'bg-amber-500/10 text-amber-400 border-amber-500/30'
};

export default function TaskList({ tasks = [] }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortField, setSortField] = useState('priorityScore');

  const filteredTasks = tasks
    .filter(t => {
      const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.defectType.toLowerCase().includes(search.toLowerCase()) ||
        t.sectionName.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'All' || t.department === deptFilter;
      return matchSearch && matchDept;
    })
    .sort((a, b) => {
      if (sortField === 'priorityScore') return (b.priorityScore || 0) - (a.priorityScore || 0);
      if (sortField === 'safetyCriticality') return (b.safetyCriticality || 0) - (a.safetyCriticality || 0);
      if (sortField === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      return 0;
    });

  const toggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Maintenance Defects & Work Orders (TMS/SMMS/TDMS)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to view the transparent factor breakdown of the 0–100 Explainable Priority Score.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search task or section..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering (TMS)</option>
            <option value="Signal & Telecom">Signal & Telecom (SMMS)</option>
            <option value="Traction Distribution">Traction Dist (TDMS)</option>
          </select>

          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="priorityScore">Sort: Priority Score (High-Low)</option>
            <option value="safetyCriticality">Sort: Safety Criticality</option>
            <option value="dueDate">Sort: Due Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Task ID</th>
              <th className="p-3">Department</th>
              <th className="p-3">Defect Type & Section</th>
              <th className="p-3">Safety Criticality</th>
              <th className="p-3">Due Date</th>
              <th className="p-3 text-center">Priority Score</th>
              <th className="p-3 text-right">Explainability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredTasks.map(t => {
              const isExpanded = expandedTaskId === t.id;
              const breakdown = t.priorityBreakdown || {};

              return (
                <React.Fragment key={t.id}>
                  <tr
                    onClick={() => toggleExpand(t.id)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="p-3 font-mono font-bold text-slate-200">{t.id}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md border font-medium text-[11px] ${DEPT_BADGES[t.department] || 'bg-slate-800 text-slate-300'}`}>
                        {t.department}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{t.defectType}</div>
                      <div className="text-slate-400 text-[11px]">{t.sectionName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${t.safetyCriticality >= 4 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        Level {t.safetyCriticality} / 5
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-slate-300">{t.dueDate}</div>
                      {t.isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400">On Track</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 font-mono font-bold text-sm rounded-lg border border-blue-500/30">
                        {t.priorityScore || 80}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Hide Factors' : 'Explain Score'}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Priority Score Factor Breakdown */}
                  {isExpanded && (
                    <tr className="bg-slate-950/90 border-t border-b border-slate-800">
                      <td colSpan={7} className="p-5">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h4 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                              <Info className="w-4 h-4 text-blue-400" />
                              Deterministic Priority Score Formula Breakdown (Task {t.id})
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">
                              Total Score: <strong className="text-blue-400 font-bold">{t.priorityScore}/100</strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                            {/* Factor 1 */}
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                              <div className="text-slate-400 font-semibold flex justify-between">
                                <span>Safety Criticality</span>
                                <span className="text-emerald-400">40% Wt</span>
                              </div>
                              <div className="text-lg font-bold text-slate-200">
                                Rating {t.safetyCriticality}/5
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Contribution: +{breakdown.criticalityFactor?.weightedContribution || 32} pts
                              </div>
                            </div>

                            {/* Factor 2 */}
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                              <div className="text-slate-400 font-semibold flex justify-between">
                                <span>Overdue Status</span>
                                <span className="text-emerald-400">30% Wt</span>
                              </div>
                              <div className="text-lg font-bold text-slate-200">
                                {breakdown.overdueFactor?.daysOverdue || 0} days past due
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Contribution: +{breakdown.overdueFactor?.weightedContribution || 20} pts
                              </div>
                            </div>

                            {/* Factor 3 */}
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                              <div className="text-slate-400 font-semibold flex justify-between">
                                <span>Corridor Traffic</span>
                                <span className="text-emerald-400">20% Wt</span>
                              </div>
                              <div className="text-lg font-bold text-slate-200">
                                {breakdown.trafficImpactFactor?.avgHourlyTrains || 18} trains/hr
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Contribution: +{breakdown.trafficImpactFactor?.weightedContribution || 15} pts
                              </div>
                            </div>

                            {/* Factor 4 */}
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                              <div className="text-slate-400 font-semibold flex justify-between">
                                <span>Resource Readiness</span>
                                <span className="text-emerald-400">10% Wt</span>
                              </div>
                              <div className="text-lg font-bold text-slate-200">
                                {breakdown.resourceReadinessFactor?.readinessPct || 80}% ready
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Contribution: +{breakdown.resourceReadinessFactor?.weightedContribution || 8} pts
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                            Description: {t.description}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
