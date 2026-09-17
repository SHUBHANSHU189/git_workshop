import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Map, Train, AlertOctagon, Wrench, Calendar, BarChart3, Bell, Search, TrainTrack } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import WhatIfPanel from './WhatIfPanel';

const Layout = () => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { path: '/map', label: 'Live Map', icon: Map },
    { path: '/trains', label: 'Trains & ETA', icon: Train },
    { path: '/risks', label: 'Risk & Defects', icon: AlertOctagon },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/calendar', label: 'Block Calendar', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.label : 'RailBlock AI';
  };

  return (
    <div className="flex h-screen bg-[#0a0e1a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] border-r border-gray-800 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Train size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            RailBlock AI
          </h1>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-900/30 text-blue-400" 
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                  <item.icon size={20} className={isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-sm">NR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Northern Railway</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <h2 className="text-xl font-semibold text-gray-100">{getPageTitle()}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search trains, blocks..." 
                className="bg-gray-900 border border-gray-700 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center gap-4 text-gray-400">
              <div className="text-sm font-medium tabular-nums bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                {format(time, 'dd MMM yyyy • HH:mm:ss')}
              </div>
              <button className="relative hover:text-white transition-colors p-1.5 bg-gray-900 rounded-full border border-gray-800">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-gray-900"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
        
        {/* Floating AI Assistant */}
        <WhatIfPanel />
      </main>
    </div>
  );
};

export default Layout;
