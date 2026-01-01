"use client";

import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState("Most Visited Apps");
  const [sparkles, setSparkles] = useState<{id: number, top: string, left: string, size: string, delay: string}[]>([]);

  useEffect(() => {
    const generatedSparkles = [...Array(40)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1 + 'px',
      delay: Math.random() * 5 + 's',
    }));
    setSparkles(generatedSparkles);
  }, []);

  const menuItems = [
    { name: "Most Visited Apps", icon: "🔥", short: "Apps" },
    { name: "Newly Launched", icon: "🚀", short: "New" },
    { name: "Trending Onchain", icon: "⛓️", short: "Chain" },
    { name: "Trending on X", icon: "🐦", short: "Social" }
  ];

  const [dapps] = useState([
    { id: 1, name: "Uniswap", uaw: "45.2k", growth: "+12%", chain: "Ethereum" },
    { id: 2, name: "PancakeSwap", uaw: "31.8k", growth: "+8%", chain: "BSC" },
    { id: 3, name: "Raydium", uaw: "28.1k", growth: "+24%", chain: "Solana" },
    { id: 4, name: "Jupiter", uaw: "19.5k", growth: "-2%", chain: "Solana" },
    { id: 5, name: "OpenSea", uaw: "12.1k", growth: "+5%", chain: "Ethereum" },
  ]);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* --- [BLOCK: VOID_BACKGROUND] --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-pink-600/15 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
        {sparkles.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full opacity-30 animate-twinkle"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDelay: star.delay }}
          />
        ))}
      </div>

      {/* --- [BLOCK: SIDEBAR / MOBILE NAV] --- */}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex relative z-20 w-72 border-r border-white/10 bg-white/5 backdrop-blur-2xl flex-col p-6">
        <div className="mb-10 px-2">
          <h2 className="text-3xl font-black tracking-tighter italic text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">VOID</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">DAPP ANALYTICS</p>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                activeTab === item.name 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-2xl border-t border-white/10 flex justify-around p-2 pb-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              activeTab === item.name ? 'text-pink-400' : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.short}</span>
          </button>
        ))}
      </nav>

      {/* --- [BLOCK: CONTENT_AREA] --- */}
      <main className="relative z-10 flex-1 p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Logo */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black italic text-pink-500">VOID</h2>
            <div className="text-[8px] font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">SYS_LIVE</div>
          </div>

          <header className="mb-6 md:mb-10 animate-fade-in">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter italic mb-2 uppercase">
              {activeTab}
            </h1>
            <div className="h-1 w-16 md:w-20 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
          </header>

          {activeTab === "Most Visited Apps" ? (
            <div className="grid gap-3 md:gap-4 animate-fade-in">
              {dapps.map((dapp) => (
                <div key={dapp.id} className="group relative overflow-hidden bg-white/[0.03] border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl hover:border-pink-500/40 hover:bg-white/[0.05] transition-all flex justify-between items-center">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-pink-500/10 flex items-center justify-center font-bold text-pink-500 border border-pink-500/20 text-sm md:text-base">
                      {dapp.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-pink-400 transition-colors">{dapp.name}</h3>
                      <p className="text-[8px] md:text-[10px] text-slate-500 font-mono uppercase tracking-widest">{dapp.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg md:text-xl font-mono font-bold text-white group-hover:text-pink-400 transition-colors">{dapp.uaw}</div>
                    <div className={`text-[10px] md:text-[11px] font-bold ${dapp.growth.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dapp.growth} <span className="text-slate-500 font-normal">UAW</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 md:h-80 border border-white/5 bg-white/[0.01] rounded-3xl animate-fade-in">
              <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-mono italic tracking-widest text-[10px] md:text-sm px-6 text-center">
                [ STREAMING DATA FROM VOID_NET ]
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- [BLOCK: STYLES] --- */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle { animation: twinkle 4s infinite ease-in-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default App;