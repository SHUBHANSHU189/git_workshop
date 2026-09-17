import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle, RefreshCw, Send } from 'lucide-react';

export default function WhatIfPanel({ onRunWhatIf, loading, diffResult }) {
  const [promptInput, setPromptInput] = useState('');

  const samplePrompts = [
    "Track team unavailable tomorrow on the Ghaziabad-Meerut corridor",
    "Signal team holding emergency overhaul on New Delhi - Kanpur section on Saturday",
    "Traction OHE maintenance crew restricted on Mumbai Central - Surat line next Tuesday"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    onRunWhatIf(promptInput);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Natural-Language What-If Scenario Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Describe operational changes in plain English. The AI layer (Claude API) parses structured constraints and recalculates a cascading impact diff.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
          Anthropic Claude NLP Powered
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            rows={3}
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder="e.g. Track team unavailable tomorrow on the Ghaziabad-Meerut corridor..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition resize-none"
          />
          <button
            type="submit"
            disabled={loading || !promptInput.trim()}
            className="absolute right-3 bottom-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-lg flex items-center gap-2 transition"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Parsing & Re-running...' : 'Simulate Scenario'}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Try sample prompt:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptInput(p)}
              className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:border-purple-500/50 hover:text-purple-300 transition text-[11px]"
            >
              "{p}"
            </button>
          ))}
        </div>
      </form>

      {/* Cascading Impact Diff Display */}
      {diffResult && (
        <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
              Parsed Constraint & Cascading Impact Diff
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Corridor: <strong className="text-purple-300">{diffResult.parsedConstraint?.corridorId || 'All'}</strong>
            </span>
          </div>

          {/* AI Structured JSON Extract */}
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
            <div className="text-purple-400 font-semibold">AI Extracted Constraint Structure:</div>
            <div className="text-slate-300 font-mono text-[11px]">
              Department: {diffResult.parsedConstraint?.department || 'All'} • Date: {diffResult.parsedConstraint?.date || 'Target Window'} • Type: {diffResult.parsedConstraint?.unavailabilityType}
            </div>
            <div className="text-slate-400 text-[11px] italic">
              {diffResult.parsedConstraint?.explanation}
            </div>
          </div>

          {/* Impact Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Total Blocks Before / After</span>
              <div className="text-lg font-bold text-slate-200 mt-0.5">
                {diffResult.cascadingDiff.totalBlocksBefore} ➔ <strong className="text-purple-400">{diffResult.cascadingDiff.totalBlocksAfter}</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Scheduled Blocks Shifted</span>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {diffResult.cascadingDiff.blocksShiftedCount} blocks
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400">Deadline Threshold Risks</span>
              <div className="text-lg font-bold text-rose-400 mt-0.5">
                {diffResult.cascadingDiff.deadlineCrossedTasksCount} tasks
              </div>
            </div>
          </div>

          {/* Shifted Blocks Timeline Diff */}
          {diffResult.cascadingDiff.shiftedBlocks && diffResult.cascadingDiff.shiftedBlocks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Shifted Block Schedule Windows</h4>
              <div className="space-y-2">
                {diffResult.cascadingDiff.shiftedBlocks.map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-amber-300">{b.blockId} ({b.corridorId})</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{b.reason}</div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="line-through text-slate-500">{b.oldTime}</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                      <span className="text-emerald-400 font-bold">{b.newTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadline Warning List */}
          {diffResult.cascadingDiff.deadlineCrossedTasks && diffResult.cascadingDiff.deadlineCrossedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Critical / Overdue Tasks Crossing Deadline Thresholds
              </h4>
              <div className="space-y-2">
                {diffResult.cascadingDiff.deadlineCrossedTasks.map((t) => (
                  <div key={t.id} className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-rose-300">{t.id}: {t.defectType}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({t.department} • Corridor {t.corridorId})</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-semibold text-[10px]">
                      Level {t.safetyCriticality} Criticality • Due {t.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
