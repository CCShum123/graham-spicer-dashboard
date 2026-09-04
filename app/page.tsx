'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'next' | 'fixtures' | 'roster' | 'standings' | 'misc'
  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'roster' | 'standings' | 'misc'>('next');

  // Availability State
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [availability, setAvailability] = useState<{
    going: string[];
    cantGo: string[];
    tbc: string[];
  }>({
    going: ['WM', 'Buddha', 'Bur', 'Luen Mo', 'Wa Diu', 'Ryan', 'Donald', 'Microsoft', 'Tap', 'Andy', 'Q', 'Eddy'],
    cantGo: ['Nam', 'Yg', 'Roy', 'Puti', 'Macro', 'Wa', 'Wai', 'Cheuk', 'Sesame', '軒仔', 'Zyut'],
    tbc: ['WL']
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/team-data');
        if (!res.ok) throw new Error(`API status: ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          throw new Error('Data format error');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleStatusChange = (status: 'going' | 'cantGo' | 'tbc') => {
    if (!selectedPlayer) {
      alert('Please select your name first!');
      return;
    }
    setAvailability((prev) => {
      const newGoing = prev.going.filter((p) => p !== selectedPlayer);
      const newCantGo = prev.cantGo.filter((p) => p !== selectedPlayer);
      const newTbc = prev.tbc.filter((p) => p !== selectedPlayer);

      if (status === 'going') newGoing.push(selectedPlayer);
      if (status === 'cantGo') newCantGo.push(selectedPlayer);
      if (status === 'tbc') newTbc.push(selectedPlayer);

      return { going: newGoing, cantGo: newCantGo, tbc: newTbc };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <p className="animate-pulse text-xs tracking-widest text-gray-400">LOADING DASHBOARD...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070a12] p-4 text-white">
        <p className="mb-2 text-lg font-bold text-red-500">Failed to load data</p>
        <p className="text-xs text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-blue-600/80 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-white pb-28 font-sans antialiased selection:bg-blue-600 selection:text-white">

      {/* Dynamic Header */}
      <header className="sticky top-0 z-20 bg-[#070a12]/90 backdrop-blur-md px-5 py-4 border-b border-gray-800/40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {activeTab === 'next' && (
                <>GRAHAM SPICER <span className="text-blue-500">2</span></>
              )}
              {activeTab === 'fixtures' && 'Fixtures'}
              {activeTab === 'roster' && 'Roster'}
              {activeTab === 'standings' && 'Standings'}
              {activeTab === 'misc' && 'Misc'}
            </h1>
          </div>

          {/* Select dropdowns */}
          <div className="flex items-center gap-2">
            <select className="bg-[#121929] text-xs text-gray-200 border border-gray-700/60 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-blue-500 appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0AEC0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[right_8px_center] bg-no-repeat">
              <option>2026-2027</option>
              <option>2025-2026</option>
            </select>
            {activeTab === 'fixtures' && (
              <select className="bg-[#121929] text-xs text-gray-200 border border-gray-700/60 rounded-lg px-2 py-1.5 font-medium outline-none">
                <option>Team: All</option>
              </select>
            )}
            {activeTab === 'roster' && (
              <select className="bg-[#121929] text-xs text-gray-200 border border-gray-700/60 rounded-lg px-2 py-1.5 font-medium outline-none">
                <option>Sort: Name</option>
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ================= TAB 1: NEXT MATCH ================= */}
        {activeTab === 'next' && (
          <div className="space-y-4">
            {/* Main Fixture Card */}
            <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  NEXT FIXTURE
                </span>
                <span className="text-xs text-gray-400 font-semibold">{data?.teamName || 'Graham Spicer 2'}</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                vs {data?.nextFixture?.opponent || 'Graham Spicer 1'}
              </h2>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium border-b border-gray-800/80 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>{data?.nextFixture?.date || 'Thu 24 Sep'} {data?.nextFixture?.time || '19:30'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{data?.nextFixture?.venue || 'Club Venue'}</span>
                </div>
              </div>

              {/* Player Availability Inner Box */}
              <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">PLAYER AVAILABILITY</span>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {availability.going.length} Registered
                  </span>
                </div>

                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full bg-[#121a2d] border border-gray-700/80 rounded-lg p-2.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                >
                  <option value="">Select your name...</option>
                  {data?.players?.map((p: any, idx: number) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                  ))}
                </select>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">CONFIRM STATUS:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange('going')}
                      className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Going
                    </button>
                    <button
                      onClick={() => handleStatusChange('cantGo')}
                      className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-2 rounded-lg text-xs font-bold transition"
                    >
                      Can't Go
                    </button>
                    <button
                      onClick={() => handleStatusChange('tbc')}
                      className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-2 rounded-lg text-xs font-bold transition"
                    >
                      TBC
                    </button>
                  </div>
                </div>

                {/* Response Summary Lists */}
                <div className="space-y-2 pt-2 text-[11px] border-t border-gray-800/60">
                  <p className="leading-relaxed">
                    <strong className="text-emerald-400 font-bold uppercase">GOING: </strong>
                    <span className="text-gray-300">{availability.going.join(', ') || 'None'}</span>
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-rose-400 font-bold uppercase">CAN'T GO: </strong>
                    <span className="text-gray-300">{availability.cantGo.join(', ') || 'None'}</span>
                  </p>
                  <p className="leading-relaxed">
                    <strong className="text-amber-400 font-bold uppercase">TBC: </strong>
                    <span className="text-gray-300">{availability.tbc.join(', ') || 'None'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FIXTURES ================= */}
        {activeTab === 'fixtures' && (
          <div className="space-y-3">
            {data?.fixtures?.map((item: any, idx: number) => (
              <div key={idx} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                      {item.type || 'DIVISION MATCH'}
                    </span>
                    <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[9px] font-bold px-2 py-0.5 rounded">
                      {item.status || 'PRE-MATCH'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-100">
                    {item.homeTeam} <span className="text-gray-500 font-normal">vs</span> {item.awayTeam}
                  </h3>
                </div>

                {/* Right Date Square Badge */}
                <div className="bg-[#080c16] border border-gray-800/90 rounded-xl p-2.5 min-w-[65px] text-center flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-400 tracking-wider uppercase">{item.month}</span>
                  <span className="text-xl font-black text-white leading-tight">{item.date}</span>
                  <span className="text-[9px] text-gray-400 font-medium">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 3: ROSTER (TABLE TENNIS NO JERSEY NUMBER) ================= */}
        {activeTab === 'roster' && (
          <div className="space-y-2.5">
            {data?.players?.map((player: any, idx: number) => (
              <div key={idx} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3.5 flex justify-between items-center shadow-md relative overflow-hidden">
                <div className="flex items-center gap-3">
                  {/* Table Tennis Paddle Icon Indicator */}
                  <div className="bg-[#080c16] border border-gray-800 rounded-xl w-10 h-10 flex items-center justify-center relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r"></span>
                    <span className="text-base">🏓</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{player.name}</h3>
                      <span className="bg-blue-950 text-blue-400 border border-blue-800/60 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        SQUAD
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">{player.subName}</p>
                  </div>
                </div>

                {/* Player Status Tag */}
                <div className="text-right space-y-1">
                  <span className="bg-[#162035] border border-gray-700/60 text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    PLAYER
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 4: STANDINGS ================= */}
        {activeTab === 'standings' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-4 shadow-xl space-y-3">
            <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">DIVISION 1</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase border-b border-gray-800/80">
                    <th className="pb-2">Pos</th>
                    <th className="pb-2">Team</th>
                    <th className="pb-2 text-center">P</th>
                    <th className="pb-2 text-center">W</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">L</th>
                    <th className="pb-2 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-gray-200">
                  {data?.standings?.map((item: any) => (
                    <tr
                      key={item.team}
                      className={item.isMyTeam ? 'bg-blue-900/30 text-white font-bold' : 'hover:bg-gray-800/30'}
                    >
                      <td className="py-2.5 font-bold">{item.pos}</td>
                      <td className="py-2.5 font-medium">{item.team}</td>
                      <td className="py-2.5 text-center text-gray-400">{item.p}</td>
                      <td className="py-2.5 text-center text-gray-400">{item.w || 0}</td>
                      <td className="py-2.5 text-center text-gray-400">{item.d || 0}</td>
                      <td className="py-2.5 text-center text-gray-400">{item.l || 0}</td>
                      <td className="py-2.5 text-center font-black text-blue-400">{item.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: MISC ================= */}
        {activeTab === 'misc' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-5 shadow-xl text-center space-y-3">
            <h2 className="text-lg font-bold text-white">Miscellaneous & Rules</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Graham Spicer Table Tennis Club • Season 2026-2027<br />
              All match standings are updated automatically.
            </p>
          </div>
        )}

      </div>

      {/* Dynamic Bottom Navigation Bar matching dragonshc UI */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 border-t border-gray-800/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-between items-center h-16 px-4 relative">

          {/* Left Tab 1: FIXTURES */}
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex flex-col items-center justify-center w-12 transition ${
              activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">FIXTURES</span>
          </button>

          {/* Left Tab 2: ROSTER */}
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex flex-col items-center justify-center w-12 transition ${
              activeTab === 'roster' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">ROSTER</span>
          </button>

          {/* Center Main Floating Logo Button (NEXT MATCH) */}
          <div className="relative -top-4">
            <button
              onClick={() => setActiveTab('next')}
              className={`w-14 h-14 rounded-full bg-[#0a101f] border-2 ${
                activeTab === 'next' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-gray-700'
              } flex items-center justify-center transition-all transform active:scale-95`}
            >
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-inner">
                🏓
              </div>
            </button>
          </div>

          {/* Right Tab 1: STANDINGS */}
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center w-12 transition ${
              activeTab === 'standings' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">STANDINGS</span>
          </button>

          {/* Right Tab 2: MISC */}
          <button
            onClick={() => setActiveTab('misc')}
            className={`flex flex-col items-center justify-center w-12 transition ${
              activeTab === 'misc' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider">MISC</span>
          </button>

        </div>
      </nav>

    </main>
  );
}