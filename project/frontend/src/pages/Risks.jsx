import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertOctagon, Wrench, Clock, CheckCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const Risks = () => {
  const radarData = [
    { subject: 'Safety', A: 90, fullMark: 100 },
    { subject: 'Urgency', A: 75, fullMark: 100 },
    { subject: 'Impact', A: 85, fullMark: 100 },
    { subject: 'Overdue', A: 40, fullMark: 100 },
    { subject: 'Readiness', A: 60, fullMark: 100 },
  ];

  const workloadData = [
    { name: 'Track', pending: 40, completed: 24 },
    { name: 'Signal', pending: 30, completed: 13 },
    { name: 'OHE', pending: 20, completed: 38 },
    { name: 'Bridge', pending: 10, completed: 5 },
  ];

  const defects = [
    { id: 'DEF-1042', corridor: 'Delhi-Howrah', type: 'Rail Fracture', severity: 'critical', dept: 'Track', date: '2023-10-24', score: 92 },
    { id: 'DEF-1045', corridor: 'Mumbai-Delhi', type: 'Signal Failure', severity: 'high', dept: 'Signal', date: '2023-10-25', score: 85 },
    { id: 'DEF-1048', corridor: 'Chennai-Howrah', type: 'OHE Snag', severity: 'medium', dept: 'OHE', date: '2023-10-25', score: 64 },
    { id: 'DEF-1051', corridor: 'Delhi-Howrah', type: 'Points Issue', severity: 'low', dept: 'Signal', date: '2023-10-26', score: 32 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Defects" value="142" change="+12" isPositive={false} icon={AlertOctagon} />
        <StatCard label="Critical Open" value="14" change="-3" isPositive={true} icon={AlertOctagon} />
        <StatCard label="Avg Resolution" value="3.2 Days" change="-0.5" isPositive={true} icon={Clock} />
        <StatCard label="Depts Affected" value="4" hideTrend icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Table */}
        <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
            <h3 className="font-semibold">Active Defect Log</h3>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Report Defect
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-900/80 text-gray-400 sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Corridor</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Dept</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {defects.map(d => (
                  <tr key={d.id} className="hover:bg-gray-800/60 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 font-medium text-blue-400 group-hover:text-blue-300">{d.id}</td>
                    <td className="px-4 py-3 text-gray-300">{d.corridor}</td>
                    <td className="px-4 py-3">{d.type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.severity.toUpperCase()} variant={d.severity === 'critical' ? 'danger' : d.severity === 'high' ? 'warning' : d.severity === 'medium' ? 'info' : 'neutral'} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{d.dept}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${d.score > 80 ? 'bg-red-500' : d.score > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${d.score}%` }}></div>
                        </div>
                        <span className="text-xs font-mono">{d.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Visualizations */}
        <div className="space-y-6">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 h-[290px]">
            <h3 className="font-semibold text-sm mb-4 text-center">Defect Risk Profile (DEF-1042)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Radar name="Risk" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 h-[286px]">
            <h3 className="font-semibold text-sm mb-4 text-center">Department Workload</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={50} />
                <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Risks;
