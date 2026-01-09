@@ -32,60 +32,85 @@ export default function App() {
  ];

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#020617] text-white overflow-hidden font-sans">
      <aside className="hidden md:flex relative z-20 w-72 border-r border-white/10 bg-white/5 backdrop-blur-2xl flex-col p-6">
        <div className="mb-10 px-2">
          <h2 className="text-3xl font-black italic text-pink-500 tracking-tighter">VOID</h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-[0.3em] mt-1">REALTIME_SCANNER</p>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.name ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="relative z-10 flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="md:hidden mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black italic text-pink-500 tracking-tighter">VOID</h2>
                <p className="text-[9px] text-slate-500 font-mono tracking-[0.3em]">REALTIME_SCANNER</p>
              </div>
              <span className="text-xs font-mono uppercase text-slate-500">Live</span>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === item.name
                      ? 'border-pink-500/40 bg-pink-500/20 text-pink-300'
                      : 'border-white/10 text-slate-400 hover:border-pink-500/30'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          <header className="mb-10">
            <h1 className="text-3xl font-black italic uppercase tracking-widest">{activeTab}</h1>
            <div className="h-1 w-20 bg-pink-500 mt-2 shadow-[0_0_15px_#ec4899]" />
          </header>

          <div className="grid gap-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center font-mono text-slate-600 animate-pulse">
                [ SCANNING_LIVE_BLOCKS ]
              </div>
            ) : topDapps.length > 0 ? (
              topDapps.map((dapp, i) => (
                <div key={i} className="group relative bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-pink-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{dapp.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-pink-400 transition-colors">{dapp.name}</h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase">{dapp.chain} • {dapp.address.slice(0,12)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-pink-500">{dapp.displayGas}</div>
                    <div className="text-[9px] text-slate-600 font-bold tracking-tighter uppercase">Intensity</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center font-mono text-slate-500">No data yet - scanner service starting...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
}
