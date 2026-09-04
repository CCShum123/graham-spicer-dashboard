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

  // 1) 對手頭三格球員名稱狀態（第 4-9 格會自動聯動）
  const [opponentNames, setOpponentNames] = useState<string[]>(['', '', '']);

  // 實時記分狀態：9場入面每一場嘅 5 個 Game 分數（壓縮闊度後嘅雙框結構）
  const [gameScores, setGameScores] = useState<{ [key: number]: { left: string; right: string }[] }>({
    1: Array(5).fill({ left: '', right: '' }),
    2: Array(5).fill({ left: '', right: '' }),
    3: Array(5).fill({ left: '', right: '' }),
    4: Array(5).fill({ left: '', right: '' }),
    5: Array(5).fill({ left: '', right: '' }),
    6: Array(5).fill({ left: '', right: '' }),
    7: Array(5).fill({ left: '', right: '' }),
    8: Array(5).fill({ left: '', right: '' }),
    9: Array(5).fill({ left: '', right: '' }),
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
          if (json.data.availability) setAvailability(json.data.availability);
          if (json.data.lineup) setSelectedLineup(json.data.lineup);
          if (json.data.gameScores) setGameScores(json.data.gameScores);
          if (json.data.opponentNames) setOpponentNames(json.data.opponentNames);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 3) 同步更新至伺服器儲存庫函數（確保隊友即時見到最新情況）
  const syncDataToBackend = async (updatedState: {
    availability?: any;
    lineup?: any;
    gameScores?: any;
    opponentNames?: any;
  }) => {
    try {
      await fetch('/api/team-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: updatedState.availability || availability,
          lineup: updatedState.lineup || selectedLineup,
          gameScores: updatedState.gameScores || gameScores,
          opponentNames: updatedState.opponentNames || opponentNames,
        }),
      });
    } catch (err) {
      console.error('Failed to sync data to backend:', err);
    }
  };

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

      const updated = { going: newGoing, cantGo: newCantGo, tbc: newTbc };
      syncDataToBackend({ availability: updated });
      return updated;
    });
  };

  const rawHomeTeam = data?.nextFixture?.homeTeam || '';
  const isHomeTeam = rawHomeTeam.toLowerCase().includes('graham spicer') || rawHomeTeam.toLowerCase().includes('gs');

  const formatTeamName = (name: string) => {
    if (!name) return '';
    let formatted = name;
    formatted = formatted.replace(/Graham\s*Spicer/gi, 'GS');
    formatted = formatted.replace(/Teddington\s*1/gi, 'Ted 1');
    formatted = formatted.replace(/Teddington\s*2/gi, 'Ted 2');
    formatted = formatted.replace(/Malden\s*1/gi, 'Mal 1');
    return formatted;
  };

  const opponentTeamNameFormatted = formatTeamName(data?.nextFixture?.opponent || 'Opponent');

  // 1) 根據賽例自動對應對手名字（第 4-9 格根據前三格自動對應）
  const getMatchStructure = () => {
    const [p1, p2, p3] = selectedLineup;
    const ourNames = [p1 || 'Player 1', p2 || 'Player 2', p3 || 'Player 3'];
    const [opp1, opp2, opp3] = opponentNames;
    const oppNamesList = [opp1 || 'Opp 1', opp2 || 'Opp 2', opp3 || 'Opp 3'];

    // 聯賽 9 場對陣藍圖：
    // Home Team 時對手係 X, Y, Z：Match 1(X), 2(Y), 3(Z), 4(X), 5(Z), 6(Y), 7(Z), 8(X), 9(Y)
    // 對應對手陣容索引：X=0, Y=1, Z=2
    if (isHomeTeam) {
      return [
        { match: 1, our: ourNames[0], ourRole: 'A', oppName: oppNamesList[0], oppRole: 'X' },
        { match: 2, our: ourNames[1], ourRole: 'B', oppName: oppNamesList[1], oppRole: 'Y' },
        { match: 3, our: ourNames[2], ourRole: 'C', oppName: oppNamesList[2], oppRole: 'Z' },
        { match: 4, our: ourNames[1], ourRole: 'B', oppName: oppNamesList[0], oppRole: 'X' },
        { match: 5, our: ourNames[0], ourRole: 'A', oppName: oppNamesList[2], oppRole: 'Z' },
        { match: 6, our: ourNames[2], ourRole: 'C', oppName: oppNamesList[1], oppRole: 'Y' },
        { match: 7, our: ourNames[1], ourRole: 'B', oppName: oppNamesList[2], oppRole: 'Z' },
        { match: 8, our: ourNames[2], ourRole: 'C', oppName: oppNamesList[0], oppRole: 'X' },
        { match: 9, our: ourNames[0], ourRole: 'A', oppName: oppNamesList[1], oppRole: 'Y' },
      ];
    } else {
      // Away Team 時：我方係 X,Y,Z，對手係 A,B,C (A=0, B=1, C=2)
      return [
        { match: 1, our: ourNames[0], ourRole: 'X', oppName: oppNamesList[0], oppRole: 'A' },
        { match: 2, our: ourNames[1], ourRole: 'Y', oppName: oppNamesList[1], oppRole: 'B' },
        { match: 3, our: ourNames[2], ourRole: 'Z', oppName: oppNamesList[2], oppRole: 'C' },
        { match: 4, our: ourNames[0], ourRole: 'X', oppName: oppNamesList[1], oppRole: 'B' },
        { match: 5, our: ourNames[2], ourRole: 'Z', oppName: oppNamesList[0], oppRole: 'A' },
        { match: 6, our: ourNames[1], ourRole: 'Y', oppName: oppNamesList[2], oppRole: 'C' },
        { match: 7, our: ourNames[2], ourRole: 'Z', oppName: oppNamesList[1], oppRole: 'B' },
        { match: 8, our: ourNames[0], ourRole: 'X', oppName: oppNamesList[2], oppRole: 'C' },
        { match: 9, our: ourNames[1], ourRole: 'Y', oppName: oppNamesList[0], oppRole: 'A' },
      ];
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white text-sm">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#070a12] text-white pb-24 font-sans text-xs">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#070a12]/90 px-4 py-3 border-b border-gray-800/40 flex justify-between items-center">
        <h1 className="text-base font-black tracking-tight text-white">
          {activeTab === 'next' && <>GRAHAM SPICER <span className="text-blue-500">2</span></>}
          {activeTab === 'fixtures' && 'FIXTURES'}
          {activeTab === 'player' && 'PLAYER'}
        </h1>
        <span className="bg-[#121929] text-xs text-gray-300 px-3 py-1 rounded-md border border-gray-700/60 font-semibold">2026-2027</span>
      </header>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {activeTab === 'next' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-4.5 space-y-4 shadow-xl">
            
            {/* 第一行：vs 隊名 + 日期地點 */}
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">NEXT FIXTURE</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isHomeTeam ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isHomeTeam ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">vs {formatTeamName(data?.nextFixture?.opponent)}</h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-gray-200 font-semibold">🕒 {data?.nextFixture?.date} {data?.nextFixture?.time}</p>
                <p className="text-xs text-gray-400">📍 {data?.nextFixture?.venue}</p>
              </div>
            </div>

            {/* Player Availability 區塊 */}
            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">PLAYER AVAILABILITY ({availability.going.length})</span>
              </div>

              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-[#121a2d] border border-gray-700/80 rounded-xl p-2.5 text-xs text-gray-100 font-medium outline-none"
              >
                <option value="">Select your name...</option>
                {data?.players?.map((p: any) => (
                  <option key={p.number} value={p.name}>{p.name} ({p.subName})</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleStatusChange('going')} className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-2 rounded-xl font-bold text-xs">Going</button>
                <button onClick={() => handleStatusChange('cantGo')} className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-2 rounded-xl font-bold text-xs">Can't Go</button>
                <button onClick={() => handleStatusChange('tbc')} className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-2 rounded-xl font-bold text-xs">TBC</button>
              </div>

              <div className="space-y-1.5 text-xs pt-2.5 border-t border-gray-800/80">
                <p><strong className="text-emerald-400 uppercase">GOING:</strong> <span className="text-gray-200 font-medium">{availability.going.join(', ') || 'None'}</span></p>
                <p><strong className="text-rose-400 uppercase">CAN'T GO:</strong> <span className="text-gray-200 font-medium">{availability.cantGo.join(', ') || 'None'}</span></p>
                <p><strong className="text-amber-400 uppercase">TBC:</strong> <span className="text-gray-200 font-medium">{availability.tbc.join(', ') || 'None'}</span></p>
              </div>
            </div>

            {/* Team Lineup 區塊 */}
            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">TEAM LINEUP</span>
                
                <button
                  onClick={() => setShowMatchCard(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5"
                >
                  <span>📋 Match Card</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="text-xs font-bold text-blue-400 block">Player {i + 1}</label>
                    <select
                      value={selectedLineup[i]}
                      onChange={(e) => {
                        const updated = [...selectedLineup];
                        updated[i] = e.target.value;
                        setSelectedLineup(updated);
                        syncDataToBackend({ lineup: updated });
                      }}
                      className="w-full bg-[#121a2d] border border-gray-700 rounded-xl p-2 text-xs text-gray-100 font-medium outline-none"
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
          <div className="space-y-3">
            {data?.fixtures?.map((item: any, idx: number) => (
              <div key={idx} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-600/30 text-blue-400">{item.type}</span>
                  <h3 className="text-sm font-bold text-gray-100 mt-1.5">{formatTeamName(item.homeTeam)} vs {formatTeamName(item.awayTeam)}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-400 font-bold">{item.day} {item.month}</span>
                  <p className="text-base font-black">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-3">
            {data?.players?.map((player: any) => (
              <div key={player.number} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#080c16] flex items-center justify-center font-black text-sm">{player.number}</span>
                  <div>
                    <h3 className="text-sm font-bold">{player.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{player.subName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ================= THAMES VALLEY MATCH CARD 彈出視窗 ================= */}
      {showMatchCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-[#0f1626] border border-gray-700 w-full max-w-xl rounded-2xl p-3 space-y-3 max-h-[95vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black tracking-wider text-white uppercase">THAMES VALLEY TABLE TENNIS LEAGUE - MATCH CARD</h3>
              <button onClick={() => setShowMatchCard(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center">✕</button>
            </div>

            {/* Match Card 表格 (壓縮比分格闊度，對手頭三格可手動輸入並聯動) */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-gray-700 text-xs">
                <thead>
                  <tr className="bg-[#121929] text-gray-300">
                    <th className="border border-gray-700 p-1 w-6">#</th>
                    
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px]">
                      Home: {isHomeTeam ? 'GS 2' : formatTeamName(data?.nextFixture?.homeTeam || opponentTeamNameFormatted)}
                    </th>
                    <th className="border border-gray-700 p-1 w-5 font-bold">{isHomeTeam ? 'H' : 'A'}</th>
                    
                    {/* 2) 壓縮比分標題區寬度 */}
                    <th className="border border-gray-700 p-1 font-bold text-[10px]" colSpan={5}>Best of 5 (e.g. 11:7)</th>
                    
                    <th className="border border-gray-700 p-1 w-5 font-bold">{!isHomeTeam ? 'H' : 'A'}</th>
                    
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px]">
                      Away: {!isHomeTeam ? 'GS 2' : opponentTeamNameFormatted}
                    </th>
                  </tr>
                  <tr className="bg-[#0a0e19] text-gray-400 text-[9px]">
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 text-left">Name</th>
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 w-10">1st</th>
                    <th className="border border-gray-700 p-0.5 w-10">2nd</th>
                    <th className="border border-gray-700 p-0.5 w-10">3rd</th>
                    <th className="border border-gray-700 p-0.5 w-10">4th</th>
                    <th className="border border-gray-700 p-0.5 w-10">5th</th>
                    <th className="border border-gray-700 p-0.5"></th>
                    <th className="border border-gray-700 p-0.5 text-left">Name</th>
                  </tr>
                </thead>
                <tbody>
                  {getMatchStructure().map((m, index) => {
                    // 1) 判斷邊個係對手嘅行：如果係 Home Team，Away 嗰邊係對手；如果係 Away Team，Home 嗰邊係對手
                    const isOpponentSideHome = !isHomeTeam; 
                    const isOpponentRow = isOpponentSideHome ? (index < 3) : (index < 3); // 頭 3 行係對手球員輸入框

                    return (
                      <tr key={m.match} className="hover:bg-gray-800/30">
                        <td className="border border-gray-700 p-1 font-black">{m.match}</td>
                        
                        {isHomeTeam ? (
                          <>
                            <td className="border border-gray-700 p-1 text-left font-bold text-white truncate max-w-[80px]">{m.our}</td>
                            <td className="border border-gray-700 p-1 font-bold text-blue-400">{m.ourRole}</td>
                          </>
                        ) : (
                          <>
                            {/* 1) 頭三格比對手自己輸入名字，下面自動聯動 */}
                            <td className="border border-gray-700 p-1 text-left">
                              {index < 3 ? (
                                <input
                                  type="text"
                                  value={opponentNames[index]}
                                  onChange={(e) => {
                                    const updatedOpp = [...opponentNames];
                                    updatedOpp[index] = e.target.value;
                                    setOpponentNames(updatedOpp);
                                    syncDataToBackend({ opponentNames: updatedOpp });
                                  }}
                                  placeholder={`Opponent ${index + 1}`}
                                  className="w-full bg-[#121a2d] border border-gray-700 rounded p-0.5 text-[10px] font-semibold text-white outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-gray-300">{m.oppName}</span>
                              )}
                            </td>
                            <td className="border border-gray-700 p-1 font-bold text-amber-400">{m.oppRole}</td>
                          </>
                        )}
                        
                        {/* 2) 壓縮後嘅比分格子（左右數字 + 固定冒號） */}
                        {[0, 1, 2, 3, 4].map((gIdx) => (
                          <td key={gIdx} className="border border-gray-700 p-0.5">
                            <div className="flex items-center justify-center gap-0 bg-[#121a2d] border border-gray-700 rounded p-0.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={gameScores[m.match]?.[gIdx]?.left || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGameScores(prev => {
                                    const currentMatchGames = [...(prev[m.match] || Array(5).fill({ left: '', right: '' }))];
                                    currentMatchGames[gIdx] = { ...currentMatchGames[gIdx], left: val };
                                    const updatedScores = { ...prev, [m.match]: currentMatchGames };
                                    syncDataToBackend({ gameScores: updatedScores });
                                    return updatedScores;
                                  });
                                }}
                                placeholder=""
                                className="w-3.5 bg-transparent text-center text-[11px] font-bold text-white outline-none"
                              />
                              <span className="text-gray-400 font-bold text-[10px]">:</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={gameScores[m.match]?.[gIdx]?.right || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGameScores(prev => {
                                    const currentMatchGames = [...(prev[m.match] || Array(5).fill({ left: '', right: '' }))];
                                    currentMatchGames[gIdx] = { ...currentMatchGames[gIdx], right: val };
                                    const updatedScores = { ...prev, [m.match]: currentMatchGames };
                                    syncDataToBackend({ gameScores: updatedScores });
                                    return updatedScores;
                                  });
                                }}
                                placeholder=""
                                className="w-3.5 bg-transparent text-center text-[11px] font-bold text-white outline-none"
                              />
                            </div>
                          </td>
                        ))}

                        {isHomeTeam ? (
                          <>
                            <td className="border border-gray-700 p-1 font-bold text-amber-400">{m.oppRole}</td>
                            <td className="border border-gray-700 p-1 text-left">
                              {index < 3 ? (
                                <input
                                  type="text"
                                  value={opponentNames[index]}
                                  onChange={(e) => {
                                    const updatedOpp = [...opponentNames];
                                    updatedOpp[index] = e.target.value;
                                    setOpponentNames(updatedOpp);
                                    syncDataToBackend({ opponentNames: updatedOpp });
                                  }}
                                  placeholder={`Opponent ${index + 1}`}
                                  className="w-full bg-[#121a2d] border border-gray-700 rounded p-0.5 text-[10px] font-semibold text-white outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-gray-300">{m.oppName}</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-700 p-1 font-bold text-blue-400">{m.ourRole}</td>
                            <td className="border border-gray-700 p-1 text-left font-bold text-white truncate max-w-[80px]">{m.our}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => {
                syncDataToBackend({});
                setShowMatchCard(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs shadow"
            >
              Save & Close (Sync to Cloud)
            </button>
          </div>
        </div>
      )}

      {/* 底部導航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 border-t border-gray-800/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-center h-14 px-4">
          <button onClick={() => setActiveTab('fixtures')} className={`text-xs font-bold ${activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-500'}`}>FIXTURES</button>
          <button onClick={() => setActiveTab('next')} className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-black ${activeTab === 'next' ? 'ring-2 ring-blue-400' : ''}`}>🏓</button>
          <button onClick={() => setActiveTab('player')} className={`text-xs font-bold ${activeTab === 'player' ? 'text-blue-500' : 'text-gray-500'}`}>PLAYER</button>
        </div>
      </nav>

    </main>
  );
}