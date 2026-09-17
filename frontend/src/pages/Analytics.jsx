import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';

const Analytics = () => {
  const trendData = [
    { week: 'W1', blocks: 45, defects: 32, delay: 180 },
    { week: 'W2', blocks: 52, defects: 28, delay: 150 },
    { week: 'W3', blocks: 48, defects: 35, delay: 160 },
    { week: 'W4', blocks: 61, defects: 22, delay: 120 },
    { week: 'W5', blocks: 59, defects: 18, delay: 110 },
    { week: 'W6', blocks: 65, defects: 15, delay: 90 },
  ];

  const riskData = [
    { name: 'Low Risk', value: 65, color: '#10b981' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900/40 via-gray-900 to-purple-900/20 border border-gray-700/50 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div>
            <h2 className="text-xl font-medium text-gray-300 mb-2">Coordination Impact Score (CIS)</h2>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
              847
            </div>
            <p className="text-green-400 font-medium mt-2 flex items-center gap-2">
              <Activity size={16} /> +24 points this month
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Blocks Avoided</div>
              <div className="text-2xl font-bold text-white">124</div>
            </div>
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Delay Mins Saved</div>
              <div className="text-2xl font-bold text-white">4,280</div>
            </div>
            <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Tasks Merged</div>
              <div className="text-2xl font-bold text-white">312</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Total Defects" value="1,204" change="-12%" isPositive={true} icon={ShieldAlert} />
        <StatCard label="Critical Open" value="18" change="-5" isPositive={true} icon={ShieldAlert} />
        <StatCard label="Avg Res Days" value="2.4" change="-0.8" isPositive={true} icon={Clock} />
        <StatCard label="Blocks (Wk)" value="65" change="+6" isPositive={true} icon={Activity} />
        <StatCard label="Utilization" value="78%" change="+12%" isPositive={true} icon={Activity} />
        <StatCard label="On-Time %" value="94.2%" change="+1.1%" isPositive={true} icon={CheckCircle2} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl h-[350px]">
          <h3 className="font-semibold mb-4">System Efficiency Trends</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Line yAxisId="left" type="monotone" dataKey="blocks" stroke="#3b82f6" strokeWidth={3} name="Blocks Executed" />
              <Line yAxisId="right" type="monotone" dataKey="delay" stroke="#ef4444" strokeWidth={2} name="Total Delay (m)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl h-[350px]">
          <h3 className="font-semibold mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* AI Summary */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
          <Activity size={18} /> AI Weekly Insights
        </h3>
        <p className="text-blue-100/80 leading-relaxed text-sm">
          "This week combines 14 tasks into 6 blocks, prioritizing 3 safety-critical overdue items on the Delhi-Howrah section. Overall block utilization improved by 12% compared to last week. The AI engine recommends opening a 4-hour window on Mumbai-Delhi next Tuesday to clear 5 pending OHE maintenance tasks without impacting superfast routes."
        </p>
      </div>
    </div>
  );
};

export default Analytics;
