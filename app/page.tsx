'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'next' | 'fixtures' | 'player' | 'lineup'
  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'player' | 'lineup'>('next');

  // Availability State
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [availability, setAvailability] = useState<{
    going: string[];
    cantGo: string[];
    tbc: string[];
  }>({
    going: [],
    cantGo: [],
    tbc: []
  });

  // Lineup Calculator State (選擇 3 位球員作為 A, B, C 或 X, Y, Z)
  const [selectedLineup, setSelectedLineup] = useState<string[]>(['', '', '']);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/team-data');
        if (!res.ok) throw new Error(`API status: ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.players) {
            const allSubNames = json.data.players.map((p: any) => p.subName);
            setAvailability(prev => ({
              ...prev,
              tbc: allSubNames
            }));
          }
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
    const playerObj = data?.players?.find((p: any) => p.name === selectedPlayer);
    const subName = playerObj ? playerObj.subName : selectedPlayer;

    setAvailability((prev) => {
      const newGoing = prev.going.filter((p) => p !== subName);
      const newCantGo = prev.cantGo.filter((p) => p !== subName);
      const newTbc = prev.tbc.filter((p) => p !== subName);

      if (status === 'going') newGoing.push(subName);
      if (status === 'cantGo') newCantGo.push(subName);
      if (status === 'tbc') newTbc.push(subName);

      return { going: newGoing, cantGo: newCantGo, tbc: newTbc };
    });
  };

  // 根據賽例生成 9 場 Match Card 對陣
  // 假設下一場係 HOME 定 AWAY (可以從 data.nextFixture 判斷，暫以 HOME 預設或自動切換)
  const isHomeTeam = true; // 之後可以動態對應

  // 產生 9 場對陣對應表
  // HOME 規例: A=1,5,9 | B=2,4,7 | C=3,6,8
  // AWAY 規例: X=1,4,8 | Y=2,6,9 | Z=3,5,7
  const generateMatchCard = () => {
    const [p1, p2, p3] = selectedLineup;
    if (!p1 || !p2 || !p3) return [];

    if (isHomeTeam) {
      return [
        { match: 1, ourPlayer: p1, role: 'A' },
        { match: 2, ourPlayer: p2, role: 'B' },
        { match: 3, ourPlayer: p3, role: 'C' },
        { match: 4, ourPlayer: p2, role: 'B' },
        { match: 5, ourPlayer: p1, role: 'A' },
        { match: 6, ourPlayer: p3, role: 'C' },
        { match: 7, ourPlayer: p2, role: 'B' },
        { match: 8, ourPlayer: p3, role: 'C' },
        { match: 9, ourPlayer: p1, role: 'A' },
      ];
    } else {
      return [
        { match: 1, ourPlayer: p1, role: 'X' },
        { match: 2, ourPlayer: p2, role: 'Y' },
        { match: 3, ourPlayer: p3, role: 'Z' },
        { match: 4, ourPlayer: p1, role: 'X' },
        { match: 5, ourPlayer: p3, role: 'Z' },
        { match: 6, ourPlayer: p2, role: 'Y' },
        { match: 7, ourPlayer: p3, role: 'Z' },
        { match: 8, ourPlayer: p1, role: 'X' },
        { match: 9, ourPlayer: p2, role: 'Y' },
      ];
    }
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
          <h1 className="text-xl font-black tracking-tight text-white">
            {activeTab === 'next' && <>GRAHAM SPICER <span className="text-blue-500">2</span></>}
            {activeTab === 'fixtures' && 'FIXTURES'}
            {activeTab === 'player' && 'PLAYER'}
            {activeTab === 'lineup' && 'MATCH CARD'}
          </h1>
          <div className="bg-[#121929] text-xs text-gray-200 border border-gray-700/60 rounded-lg px-3 py-1.5 font-medium">
            2026-2027
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ================= TAB 1: NEXT MATCH ================= */}
        {activeTab === 'next' && (
          <div className="space-y-4">
            <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  NEXT FIXTURE
                </span>
                <span className="text-xs text-gray-400 font-semibold">{data?.teamName}</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                vs {data?.nextFixture?.opponent}
              </h2>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium border-b border-gray-800/80 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span>🕒</span>
                  <span>{data?.nextFixture?.date} {data?.nextFixture?.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{data?.nextFixture?.venue}</span>
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
                  {data?.players?.map((p: any) => (
                    <option key={p.number} value={p.name}>{p.name} ({p.subName})</option>
                  ))}
                </select>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">CONFIRM STATUS:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleStatusChange('going')} className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-2 rounded-lg text-xs font-bold transition">Going</button>
                    <button onClick={() => handleStatusChange('cantGo')} className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-2 rounded-lg text-xs font-bold transition">Can't Go</button>
                    <button onClick={() => handleStatusChange('tbc')} className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-2 rounded-lg text-xs font-bold transition">TBC</button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-[11px] border-t border-gray-800/60">
                  <p className="leading-relaxed"><strong className="text-emerald-400 font-bold uppercase">GOING: </strong><span className="text-gray-300">{availability.going.join(', ') || 'None'}</span></p>
                  <p className="leading-relaxed"><strong className="text-rose-400 font-bold uppercase">CAN'T GO: </strong><span className="text-gray-300">{availability.cantGo.join(', ') || 'None'}</span></p>
                  <p className="leading-relaxed"><strong className="text-amber-400 font-bold uppercase">TBC: </strong><span className="text-gray-300">{availability.tbc.join(', ') || 'None'}</span></p>
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${item.type === 'HOME' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'bg-purple-600/30 text-purple-400 border border-purple-500/40'}`}>
                      {item.type}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.status === 'COMPLETED' ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-100">{item.homeTeam} <span className="text-gray-500 font-normal">vs</span> {item.awayTeam}</h3>
                </div>
                <div className="bg-[#080c16] border border-gray-800/90 rounded-xl p-2.5 min-w-[70px] text-center flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-blue-400 tracking-wider uppercase">{item.day} {item.month}</span>
                  <span className="text-xl font-black text-white leading-tight">{item.date}</span>
                  <span className="text-[9px] text-gray-400 font-medium">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 3: PLAYER ================= */}
        {activeTab === 'player' && (
          <div className="space-y-2.5">
            {data?.players?.map((player: any) => (
              <div key={player.number} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="bg-[#080c16] border border-gray-800 rounded-xl w-12 h-12 flex items-center justify-center relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r"></span>
                    <span className="text-lg font-black text-white">{player.number}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{player.name}</h3>
                    <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">{player.subName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TAB 4: MATCH CARD CALCULATOR (排陣工具) ================= */}
        {activeTab === 'lineup' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
            <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              Match Card Lineup Planner
            </span>
            <p className="text-xs text-gray-400">請從已確定出席 (Going) 嘅球員中揀選 3 位主力，系統會自動生成 9 場出場次序：</p>

            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 w-16">Player {i + 1}:</span>
                  <select
                    value={selectedLineup[i]}
                    onChange={(e) => {
                      const updated = [...selectedLineup];
                      updated[i] = e.target.value;
                      setSelectedLineup(updated);
                    }}
                    className="w-full bg-[#121a2d] border border-gray-700/80 rounded-lg p-2 text-xs text-gray-200 outline-none"
                  >
                    <option value="">Select player...</option>
                    {availability.going.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* 生成結果 */}
            {selectedLineup[0] && selectedLineup[1] && selectedLineup[2] && (
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                <p className="text-xs font-bold text-emerald-400 uppercase">Generated Match Card Order:</p>
                <div className="bg-[#080c16] rounded-xl p-3 space-y-1.5 text-xs">
                  {generateMatchCard().map((m) => (
                    <div key={m.match} className="flex justify-between border-b border-gray-800/50 pb-1">
                      <span className="font-bold text-gray-400">Game {m.match} ({m.role}):</span>
                      <span className="font-bold text-white">{m.ourPlayer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 底部導航欄 (加入 Match Card 專用按鈕) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 border-t border-gray-800/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4 relative">

          <button onClick={() => setActiveTab('fixtures')} className={`flex flex-col items-center justify-center w-14 transition ${activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-500'}`}>
            <span className="text-[9px] font-bold tracking-wider">FIXTURES</span>
          </button>

          <div className="relative -top-4">
            <button onClick={() => setActiveTab('next')} className={`w-14 h-14 rounded-full bg-[#0a101f] border-2 ${activeTab === 'next' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-gray-700'} flex items-center justify-center`}>
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-black">🏓</div>
            </button>
          </div>

          <button onClick={() => setActiveTab('lineup')} className={`flex flex-col items-center justify-center w-14 transition ${activeTab === 'lineup' ? 'text-blue-500' : 'text-gray-500'}`}>
            <span className="text-[9px] font-bold tracking-wider">LINEUP</span>
          </button>

          <button onClick={() => setActiveTab('player')} className={`flex flex-col items-center justify-center w-14 transition ${activeTab === 'player' ? 'text-blue-500' : 'text-gray-500'}`}>
            <span className="text-[9px] font-bold tracking-wider">PLAYER</span>
          </button>

        </div>
      </nav>

    </main>
  );
}