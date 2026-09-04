'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'player'>('next');

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

  // Lineup State (3位球員打橫擺)
  const [selectedLineup, setSelectedLineup] = useState<string[]>(['', '', '']);
  
  // Match Card Modal 狀態
  const [showMatchCard, setShowMatchCard] = useState(false);

  // 實時記分狀態：9場入面每一場嘅 5 個 Game 分數 { [matchNum]: [g1, g2, g3, g4, g5] }
  const [gameScores, setGameScores] = useState<{ [key: number]: string[] }>({
    1: ['', '', '', '', ''],
    2: ['', '', '', '', ''],
    3: ['', '', '', '', ''],
    4: ['', '', '', '', ''],
    5: ['', '', '', '', ''],
    6: ['', '', '', '', ''],
    7: ['', '', '', '', ''],
    8: ['', '', '', '', ''],
    9: ['', '', '', '', ''],
  });

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
            setAvailability(prev => ({ ...prev, tbc: allSubNames }));
          }
        }
      } catch (err: any) {
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

  const isHomeTeam = true; // 預設主場

  // 根據相片入面 Thames Valley 賽例嘅 9 場對陣藍圖
  const getMatchStructure = () => {
    const [p1, p2, p3] = selectedLineup;
    const names = [p1 || 'Player 1', p2 || 'Player 2', p3 || 'Player 3'];

    if (isHomeTeam) {
      // Home: A=1,5,9 | B=2,4,7 | C=3,6,8
      return [
        { match: 1, our: names[0], ourRole: 'A', oppRole: 'X' },
        { match: 2, our: names[1], ourRole: 'B', oppRole: 'Y' },
        { match: 3, our: names[2], ourRole: 'C', oppRole: 'Z' },
        { match: 4, our: names[1], ourRole: 'B', oppRole: 'X' },
        { match: 5, our: names[0], ourRole: 'A', oppRole: 'Z' },
        { match: 6, our: names[2], ourRole: 'C', oppRole: 'Y' },
        { match: 7, our: names[1], ourRole: 'B', oppRole: 'Z' },
        { match: 8, our: names[2], ourRole: 'C', oppRole: 'X' },
        { match: 9, our: names[0], ourRole: 'A', oppRole: 'Y' },
      ];
    } else {
      // Away: X=1,4,8 | Y=2,6,9 | Z=3,5,7
      return [
        { match: 1, our: names[0], ourRole: 'X', oppRole: 'A' },
        { match: 2, our: names[1], ourRole: 'Y', oppRole: 'B' },
        { match: 3, our: names[2], ourRole: 'Z', oppRole: 'C' },
        { match: 4, our: names[0], ourRole: 'X', oppRole: 'B' },
        { match: 5, our: names[2], ourRole: 'Z', oppRole: 'A' },
        { match: 6, our: names[1], ourRole: 'Y', oppRole: 'C' },
        { match: 7, our: names[2], ourRole: 'Z', oppRole: 'B' },
        { match: 8, our: names[0], ourRole: 'X', oppRole: 'C' },
        { match: 9, our: names[1], ourRole: 'Y', oppRole: 'A' },
      ];
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#070a12] text-white pb-24 font-sans text-xs">

      {/* Header (極簡化慳位) */}
      <header className="sticky top-0 z-20 bg-[#070a12]/90 px-4 py-2.5 border-b border-gray-800/40 flex justify-between items-center">
        <h1 className="text-sm font-black tracking-tight text-white">
          {activeTab === 'next' && <>GRAHAM SPICER <span className="text-blue-500">2</span></>}
          {activeTab === 'fixtures' && 'FIXTURES'}
          {activeTab === 'player' && 'PLAYER'}
        </h1>
        <span className="bg-[#121929] text-[10px] text-gray-300 px-2.5 py-1 rounded-md border border-gray-700/60">2026-2027</span>
      </header>

      {/* Main Container (一版過編排) */}
      <div className="max-w-md mx-auto px-3 pt-2.5 space-y-2.5">

        {activeTab === 'next' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-xl p-3 space-y-2.5 shadow-lg">
            
            {/* 第一行：vs 隊名 + 日期地點放喺右手邊 */}
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-2">
              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">NEXT FIXTURE</span>
                <h2 className="text-lg font-black text-white tracking-tight">vs {data?.nextFixture?.opponent}</h2>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-gray-300 font-medium">🕒 {data?.nextFixture?.date} {data?.nextFixture?.time}</p>
                <p className="text-[10px] text-gray-400">📍 {data?.nextFixture?.venue}</p>
              </div>
            </div>

            {/* Player Availability 區塊 */}
            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-lg p-2.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">AVAILABILITY ({availability.going.length})</span>
              </div>

              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-[#121a2d] border border-gray-700/80 rounded p-1.5 text-xs text-gray-200 outline-none"
              >
                <option value="">Select your name...</option>
                {data?.players?.map((p: any) => (
                  <option key={p.number} value={p.name}>{p.name} ({p.subName})</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => handleStatusChange('going')} className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-1 rounded font-bold">Going</button>
                <button onClick={() => handleStatusChange('cantGo')} className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-1 rounded font-bold">Can't Go</button>
                <button onClick={() => handleStatusChange('tbc')} className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-1 rounded font-bold">TBC</button>
              </div>

              <div className="space-y-1 text-[10px] pt-1 border-t border-gray-800">
                <p><strong className="text-emerald-400 uppercase">GOING:</strong> <span className="text-gray-300">{availability.going.join(', ') || 'None'}</span></p>
                <p><strong className="text-amber-400 uppercase">TBC:</strong> <span className="text-gray-300">{availability.tbc.join(', ') || 'None'}</span></p>
              </div>
            </div>

            {/* Team Lineup 區塊（Player 1, 2, 3 打橫排 + 選項在各自下面） */}
            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-lg p-2.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">TEAM LINEUP</span>
                
                {/* Match Card 掣 */}
                <button
                  onClick={() => setShowMatchCard(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow flex items-center gap-1"
                >
                  <span>📋 Match Card</span>
                </button>
              </div>

              {/* 打橫擺 3 個 Player，選項在各自下面 */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-400 block">Player {i + 1}</label>
                    <select
                      value={selectedLineup[i]}
                      onChange={(e) => {
                        const updated = [...selectedLineup];
                        updated[i] = e.target.value;
                        setSelectedLineup(updated);
                      }}
                      className="w-full bg-[#121a2d] border border-gray-700 rounded p-1 text-[10px] text-gray-200 outline-none"
                    >
                      <option value="">Select...</option>
                      {availability.going.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="space-y-2">
            {data?.fixtures?.map((item: any, idx: number) => (
              <div key={idx} className="bg-[#0f1626] border border-gray-800/80 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-600/30 text-blue-400">{item.type}</span>
                  <h3 className="text-xs font-bold text-gray-100 mt-1">{item.homeTeam} vs {item.awayTeam}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-blue-400 font-bold">{item.day} {item.month}</span>
                  <p className="text-sm font-black">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-2">
            {data?.players?.map((player: any) => (
              <div key={player.number} className="bg-[#0f1626] border border-gray-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-[#080c16] flex items-center justify-center font-black text-sm">{player.number}</span>
                  <div>
                    <h3 className="text-xs font-bold">{player.name}</h3>
                    <p className="text-[9px] text-gray-400 uppercase">{player.subName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ================= THAMES VALLEY MATCH CARD 彈出視窗（格式與相片一致） ================= */}
      {showMatchCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-[#0f1626] border border-gray-700 w-full max-w-lg rounded-xl p-3 space-y-3 max-h-[95vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black tracking-wider text-white uppercase">THAMES VALLEY TABLE TENNIS LEAGUE - MATCH CARD</h3>
              <button onClick={() => setShowMatchCard(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-6 h-6 rounded-full font-bold text-[10px]">✕</button>
            </div>

            {/* Match Card 表格 (對應實物圖片格式) */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-gray-700 text-[10px]">
                <thead>
                  <tr className="bg-[#121929] text-gray-300">
                    <th className="border border-gray-700 p-1 w-8">#</th>
                    <th className="border border-gray-700 p-1 text-left">Home Team: Graham Spicer 2</th>
                    <th className="border border-gray-700 p-1 w-6">H</th>
                    <th className="border border-gray-700 p-1" colSpan={5}>Best of 5 Games Score</th>
                    <th className="border border-gray-700 p-1 w-6">A</th>
                    <th className="border border-gray-700 p-1 text-left">Away Team: {data?.nextFixture?.opponent}</th>
                  </tr>
                  <tr className="bg-[#0a0e19] text-gray-400 text-[9px]">
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 text-left">Name</th>
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 w-7">1st</th>
                    <th className="border border-gray-700 p-0.5 w-7">2nd</th>
                    <th className="border border-gray-700 p-0.5 w-7">3rd</th>
                    <th className="border border-gray-700 p-0.5 w-7">4th</th>
                    <th className="border border-gray-700 p-0.5 w-7">5th</th>
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 text-left">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {getMatchStructure().map((m) => (
                    <tr key={m.match} className="hover:bg-gray-800/30">
                      <td className="border border-gray-700 p-1 font-bold">{m.match}</td>
                      <td className="border border-gray-700 p-1 text-left font-semibold text-white truncate max-w-[90px]">{m.our}</td>
                      <td className="border border-gray-700 p-1 font-bold text-blue-400">{m.ourRole}</td>
                      
                      {/* 5個 Game 的比分輸入框 */}
                      {[0, 1, 2, 3, 4].map((gIdx) => (
                        <td key={gIdx} className="border border-gray-700 p-0.5">
                          <input
                            type="text"
                            maxLength={3}
                            value={gameScores[m.match]?.[gIdx] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGameScores(prev => {
                                const currentMatchGames = [...(prev[m.match] || ['', '', '', '', ''])];
                                currentMatchGames[gIdx] = val;
                                return { ...prev, [m.match]: currentMatchGames };
                              });
                            }}
                            className="w-full bg-[#121a2d] border border-gray-700 rounded text-center text-[10px] p-0.5 text-white outline-none"
                          />
                        </td>
                      ))}

                      <td className="border border-gray-700 p-1 font-bold text-amber-400">{m.oppRole}</td>
                      <td className="border border-gray-700 p-1 text-left text-gray-400">Opponent</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowMatchCard(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs shadow"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* 底部導航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 border-t border-gray-800/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-center h-14 px-4">
          <button onClick={() => setActiveTab('fixtures')} className={`text-[10px] font-bold ${activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-500'}`}>FIXTURES</button>
          <button onClick={() => setActiveTab('next')} className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-black ${activeTab === 'next' ? 'ring-2 ring-blue-400' : ''}`}>🏓</button>
          <button onClick={() => setActiveTab('player')} className={`text-[10px] font-bold ${activeTab === 'player' ? 'text-blue-500' : 'text-gray-500'}`}>PLAYER</button>
        </div>
      </nav>

    </main>
  );
}