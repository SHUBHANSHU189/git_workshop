import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, MapPin, ChevronRight, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';

const getTrainTypeColor = (type) => {
  const map = {
    'Rajdhani': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Shatabdi': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Duronto': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Vande Bharat': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Superfast': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Express': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  return map[type] || map['Express'];
};

const Trains = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedTrain, setExpandedTrain] = useState(null);

  const types = ['All', 'Rajdhani', 'Shatabdi', 'Duronto', 'Vande Bharat', 'Superfast', 'Express'];

  const mockTrains = [
    { id: '12951', name: 'Mumbai Rajdhani', type: 'Rajdhani', src: 'MMCT', dst: 'NDLS', status: 'On Time', delay: 0 },
    { id: '22436', name: 'Vande Bharat Exp', type: 'Vande Bharat', src: 'NDLS', dst: 'BSB', status: 'Delayed', delay: 15 },
    { id: '12004', name: 'Lucknow Shatabdi', type: 'Shatabdi', src: 'NDLS', dst: 'LKO', status: 'On Time', delay: 0 },
    { id: '12809', name: 'Howrah Mail', type: 'Superfast', src: 'CSMT', dst: 'HWH', status: 'Very Late', delay: 145 },
    { id: '12245', name: 'Howrah Duronto', type: 'Duronto', src: 'HWH', dst: 'YPR', status: 'Delayed', delay: 45 },
  ];

  const filteredTrains = mockTrains.filter(t => 
    (selectedType === 'All' || t.type === selectedType) &&
    (t.id.includes(search) || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Active Trains" value="1,248" icon={Activity} />
        <StatCard label="On-Time Performance" value="84.2%" change="+2.1%" isPositive={true} icon={Clock} />
        <StatCard label="Average Delay" value="18 min" change="-4 min" isPositive={true} icon={Clock} />
        <StatCard label="Critical Delays (>1h)" value="42" change="+5" isPositive={false} icon={MapPin} />
      </div>

      {/* Search & Filters */}
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-4 rounded-xl space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by train number or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-gray-400 mr-2" />
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${selectedType === type 
                  ? 'bg-blue-600 text-white border-blue-500' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Train Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredTrains.map(train => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={train.id}
              className={`bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:bg-gray-800/80 ${expandedTrain === train.id ? 'col-span-full md:col-span-full lg:col-span-full' : ''}`}
              onClick={() => setExpandedTrain(expandedTrain === train.id ? null : train.id)}
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-white">{train.id}</h3>
                    <p className="text-gray-400 text-sm font-medium">{train.name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTrainTypeColor(train.type)}`}>
                    {train.type}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="font-bold text-gray-200">{train.src}</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 relative">
                    <ChevronRight size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 bg-gray-800 px-0.5" />
                  </div>
                  <div className="font-bold text-gray-200">{train.dst}</div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                  <StatusBadge 
                    status={train.status} 
                    variant={train.delay === 0 ? 'success' : train.delay < 30 ? 'warning' : 'danger'} 
                  />
                  {train.delay > 0 && <span className="text-xs font-bold text-red-400">+{train.delay} mins</span>}
                </div>
              </div>

              {/* Expanded Details - Route Timeline */}
              <AnimatePresence>
                {expandedTrain === train.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-900/50 border-t border-gray-700/50 p-6 overflow-hidden"
                  >
                    <h4 className="text-sm font-semibold mb-6 flex items-center gap-2"><MapPin size={16}/> Live Journey Prediction (ETA Engine)</h4>
                    
                    <div className="relative pl-6 space-y-6">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-700"></div>
                      
                      {[
                        { name: 'New Delhi', code: 'NDLS', act: '16:00', est: '16:00', status: 'completed' },
                        { name: 'Kanpur Central', code: 'CNB', act: '20:45', est: '20:55', status: 'current', delay: 10 },
                        { name: 'Prayagraj', code: 'PRYJ', act: '23:05', est: '23:20', status: 'upcoming', delay: 15 },
                        { name: 'Varanasi', code: 'BSB', act: '01:30', est: '01:50', status: 'upcoming', delay: 20 },
                      ].map((stop, i) => (
                        <div key={i} className="relative flex items-center gap-4">
                          <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 
                            ${stop.status === 'completed' ? 'bg-green-500 border-green-500' : 
                              stop.status === 'current' ? 'bg-blue-500 border-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 
                              'bg-gray-900 border-gray-600'}`} 
                          />
                          <div className="flex-1 bg-gray-800/80 border border-gray-700 p-3 rounded-lg flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-sm">{stop.name} <span className="text-gray-500 text-xs">({stop.code})</span></div>
                              <div className="text-xs text-gray-400 mt-1">Sch: {stop.act}</div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-sm ${stop.delay ? 'text-amber-400' : 'text-green-400'}`}>{stop.est}</div>
                              {stop.delay && <div className="text-xs text-red-400">+{stop.delay}m</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Trains;
