import React, { useState } from 'react';
import { FileText, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

export default function PlanSummaryPanel({ summaryText, onRegenerateSummary, loading, horizon }) {
  const [approved, setApproved] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Executive Plan Summary Brief (AI Generated)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auto-generated plain-English briefing for senior Indian Railways officials summarizing the active {horizon} schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerateSummary}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Briefing
          </button>

          <button
            onClick={() => setApproved(!approved)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-lg ${
              approved
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {approved ? <CheckCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {approved ? 'Plan Approved (Official)' : 'Approve Maintenance Plan'}
          </button>
        </div>
      </div>

      {/* Brief Content */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative">
        {loading ? (
          <div className="py-6 flex items-center justify-center gap-3 text-slate-400 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            Generating plain-English executive briefing via Anthropic Claude API...
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed font-serif tracking-wide italic">
              "{summaryText || 'Click Regenerate Briefing to fetch executive plan summary.'}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
              <span>Target Horizon: <strong className="text-slate-400 capitalize">{horizon} Plan</strong></span>
              <span>Status: <strong className={approved ? 'text-emerald-400' : 'text-amber-400'}>{approved ? 'APPROVED' : 'RECOMMENDED'}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
