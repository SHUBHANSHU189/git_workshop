import React from 'react';
import { Info, Database, Cpu } from 'lucide-react';

export default function FooterHonestyNotice() {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-900/80 backdrop-blur text-xs text-slate-400 p-6 rounded-xl shadow-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-1">Deterministic Core vs. AI Integration</h4>
            <p className="leading-relaxed">
              All block scheduling, priority scoring (0–100), multi-department compatibility matching, and overrun risk tagging are <strong className="text-slate-200">100% deterministic and rule-based</strong> for total explainability and safety auditability. AI (Anthropic Claude API) is used <strong className="text-slate-200">strictly for natural-language What-If scenario parsing</strong> and generating executive plain-English plan briefings.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-1">Simulated Railway Data Sources</h4>
            <p className="leading-relaxed">
              The data displayed in this application is realistic simulated mock data structured after Indian Railways production systems: <strong className="text-slate-200">TMS</strong> (Track Management System), <strong className="text-slate-200">SMMS</strong> (Signal Maintenance Management System), <strong className="text-slate-200">TDMS</strong> (Traction Distribution Management System), and <strong className="text-slate-200">COA</strong> (Control Office Application for train timetable & goods forecast).
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
        RailBlock AI • Divisional Maintenance Operations Control • Indian Railways Architecture Prototype
      </div>
    </footer>
  );
}
