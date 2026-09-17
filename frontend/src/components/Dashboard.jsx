import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, Clock, Activity, Calendar, RefreshCw, 
  Layers, Filter, ChevronRight, Train, LogOut, UserCheck
} from 'lucide-react';
import CorridorTimeline from './CorridorTimeline';
import TaskList from './TaskList';
import WhatIfPanel from './WhatIfPanel';
import PlanSummaryPanel from './PlanSummaryPanel';
import FooterHonestyNotice from './FooterHonestyNotice';

export default function Dashboard({ token, user, onLogout }) {
  const [horizon, setHorizon] = useState('weekly'); // 'weekly' or 'monthly'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'timeline' | 'tasks' | 'whatif'

  const [loading, setLoading] = useState(true);
  const [corridors, setCorridors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfDiff, setWhatIfDiff] = useState(null);

  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [cRes, tRes, sRes] = await Promise.all([
        fetch('http://localhost:5000/api/corridors', { headers }),
        fetch('http://localhost:5000/api/tasks', { headers }),
        fetch(`http://localhost:5000/api/schedule?horizon=${horizon}`, { headers })
      ]);

      const cData = await cRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();

      setCorridors(cData);
      setTasks(tData);
      setScheduleData(sData);

      fetchSummary(horizon);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (selectedHorizon) => {
    setSummaryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai-summary', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ horizon: selectedHorizon })
      });
      const data = await res.json();
      setSummaryText(data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [horizon]);

  const handleRunWhatIf = async (prompt) => {
    setWhatIfLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/what-if', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, horizon })
      });
      const data = await res.json();
      setWhatIfDiff(data);
    } catch (err) {
      console.error('Error running What-If scenario:', err);
    } finally {
      setWhatIfLoading(false);
    }
  };

  const metrics = scheduleData?.metrics || {
    totalTasksScheduled: 0,
    scheduledBlocksCount: 0,
    blocksAvoided: 0,
    totalTrainDelayMinutesSaved: 0,
    coordinationImpactScore: 0
  };

  const scheduledBlocks = scheduleData?.scheduledBlocks || [];
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const riskCounts = {
    comfortable: scheduledBlocks.filter(b => b.riskTag === 'comfortable').length,
    tight: scheduledBlocks.filter(b => b.riskTag === 'tight').length,
    overrun: scheduledBlocks.filter(b => b.riskTag === 'likely-overrun').length
  };

  const pendingHighPriorityCount = pendingTasks.filter(t => t.safetyCriticality >= 4 || t.isOverdue).length;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans pb-12">
      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              RailBlock AI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase font-mono">
                Indian Railways
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Automatic Multi-Department Corridor Block Scheduling Engine</p>
          </div>
        </div>

        {/* Horizon Toggle & User Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setHorizon('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                horizon === 'weekly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setHorizon('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                horizon === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Schedule
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user?.name || 'Operations Officer'}</div>
              <div className="text-[10px] text-slate-400">{user?.role || 'Planner'}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Recommended Blocks */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">🟢 Recommended Blocks</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{scheduledBlocks.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Optimized for {horizon} horizon</div>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Risk / Conflicts Count */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">🔴 Overrun Risk Blocks</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{riskCounts.overrun}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{riskCounts.tight} tight windows</div>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: High Priority Pending */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">🟡 High-Priority Pending</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{pendingHighPriorityCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Safety criticality 4-5 or overdue</div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Hero Card 4: Coordination Impact Score */}
          <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950 border border-blue-500/40 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Coordination Impact Score</span>
              <div className="text-3xl font-extrabold text-blue-400 tracking-tight mt-1">
                {metrics.coordinationImpactScore.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-blue-500/20 pt-2 mt-2">
              <span>
                <strong className="text-white font-mono">{metrics.blocksAvoided}</strong> blocks avoided
              </span>
              <span>×</span>
              <span>
                <strong className="text-white font-mono">{metrics.avgDelayMinutesSavedPerBlock}m</strong> avg delay saved
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 gap-6 text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Operations Overview
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Corridor Timeline View
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" /> Maintenance Defects ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('whatif')}
            className={`pb-3 font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'whatif'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> What-If Scenario Engine
          </button>
        </div>

        {/* Tab 1: Operations Overview (Dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Plan Summary Panel */}
            <PlanSummaryPanel
              summaryText={summaryText}
              onRegenerateSummary={() => fetchSummary(horizon)}
              loading={summaryLoading}
              horizon={horizon}
            />

            {/* Main Centerpiece: Corridor Timeline */}
            <CorridorTimeline
              corridors={corridors}
              scheduledBlocks={scheduledBlocks}
              tasks={tasks}
              horizon={horizon}
            />

            {/* Department Workload Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="font-semibold text-slate-200 text-sm flex items-center justify-between">
                  <span>Engineering (TMS)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tasks.filter(t => t.department === 'Engineering').length} Defects
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[65%]"></div>
                </div>
                <p className="text-xs text-slate-400">Track relaying, deep screening, ballast tamping on mainlines.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="font-semibold text-slate-200 text-sm flex items-center justify-between">
                  <span>Signal & Telecom (SMMS)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {tasks.filter(t => t.department === 'Signal & Telecom').length} Defects
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[45%]"></div>
                </div>
                <p className="text-xs text-slate-400">Point machine overhauls, interlocking circuits, axle counters.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="font-semibold text-slate-200 text-sm flex items-center justify-between">
                  <span>Traction Distribution (TDMS)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {tasks.filter(t => t.department === 'Traction Distribution').length} Defects
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[55%]"></div>
                </div>
                <p className="text-xs text-slate-400">OHE catenary wire tensioning, mast alignment, insulator washing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Corridor Timeline View */}
        {activeTab === 'timeline' && (
          <CorridorTimeline
            corridors={corridors}
            scheduledBlocks={scheduledBlocks}
            tasks={tasks}
            horizon={horizon}
          />
        )}

        {/* Tab 3: Maintenance Tasks */}
        {activeTab === 'tasks' && (
          <TaskList tasks={tasks} />
        )}

        {/* Tab 4: What-If Scenario Panel */}
        {activeTab === 'whatif' && (
          <WhatIfPanel
            onRunWhatIf={handleRunWhatIf}
            loading={whatIfLoading}
            diffResult={whatIfDiff}
          />
        )}

        {/* Permanent Honesty & Explainability Footer */}
        <FooterHonestyNotice />
      </main>
    </div>
  );
}
