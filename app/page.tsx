'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'player'>('next');

  // 目前正在檢視/填寫 Availability 嘅目標比賽 ID（預設為 Next Fixture）
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('');

  // 儲存所有比賽嘅 Availability 狀態: { [fixtureId]: { going: [], cantGo: [], tbc: [] } }
  const [availabilityMap, setAvailabilityMap] = useState<{ [key: string]: { going: string[]; cantGo: string[]; tbc: string[] } }>({});

  const [selectedPlayer, setSelectedPlayer] = useState('');

  // Lineup State
  const [selectedLineup, setSelectedLineup] = useState<string[]>(['', '', '']);
  
  // Match Card Modal 狀態
  const [showMatchCard, setShowMatchCard] = useState(false);

  // 對手頭三格球員名稱狀態
  const [opponentNames, setOpponentNames] = useState<string[]>(['', '', '']);

  // 實時記分狀態
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
          if (json.data.nextFixture?.id) {
            setSelectedFixtureId(json.data.nextFixture.id);
          }
          if (json.data.availabilityMap) setAvailabilityMap(json.data.availabilityMap);
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

  const syncDataToBackend = async (updatedState: {
    availabilityMap?: any;
    lineup?: any;
    gameScores?: any;
    opponentNames?: any;
  }) => {
    try {
      await fetch('/api/team-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityMap: updatedState.availabilityMap || availabilityMap,
          lineup: updatedState.lineup || selectedLineup,
          gameScores: updatedState.gameScores || gameScores,
          opponentNames: updatedState.opponentNames || opponentNames,
        }),
      });
    } catch (err) {
      console.error('Failed to sync data to backend:', err);
    }
  };

  // 找出當前正在檢視緊邊場比賽
  const currentMatchTarget = data?.fixtures?.find((f: any) => f.id === selectedFixtureId) || data?.nextFixture;
  const rawHomeTeam = currentMatchTarget?.homeTeam || '';
  const isHomeTeam = rawHomeTeam.toLowerCase().includes('graham spicer');

  // 取得當前比賽嘅 availability 資料（若果未有就畀預設空陣列）
  const currentAvailability = availabilityMap[selectedFixtureId] || { going: [], cantGo: [], tbc: [] };

  const handleStatusChange = (status: 'going' | 'cantGo' | 'tbc') => {
    if (!selectedPlayer) {
      alert('Please select your name first!');
      return;
    }

    setAvailabilityMap((prev) => {
      const targetAvail = prev[selectedFixtureId] || { going: [], cantGo: [], tbc: [] };
      const newGoing = targetAvail.going.filter((p: string) => p !== selectedPlayer);
      const newCantGo = targetAvail.cantGo.filter((p: string) => p !== selectedPlayer);
      const newTbc = targetAvail.tbc.filter((p: string) => p !== selectedPlayer);

      if (status === 'going') newGoing.push(selectedPlayer);
      if (status === 'cantGo') newCantGo.push(selectedPlayer);
      if (status === 'tbc') newTbc.push(selectedPlayer);

      const updatedMap = {
        ...prev,
        [selectedFixtureId]: { going: newGoing, cantGo: newCantGo, tbc: newTbc }
      };

      syncDataToBackend({ availabilityMap: updatedMap });
      return updatedMap;
    });
  };

  const formatTeamNameForMatchCard = (name: string) => {
    if (!name) return '';
    let formatted = name;
    formatted = formatted.replace(/Graham\s*Spicer\s*2/gi, 'GS 2');
    formatted = formatted.replace(/Graham\s*Spicer\s*3/gi, 'GS 3');
    formatted = formatted.replace(/Graham\s*Spicer\s*5/gi, 'GS 5');
    formatted = formatted.replace(/Graham\s*Spicer\s*4/gi, 'GS 4');
    formatted = formatted.replace(/Graham\s*Spicer\s*1/gi, 'GS 1');
    formatted = formatted.replace(/Graham\s*Spicer/gi, 'GS');
    formatted = formatted.replace(/Teddington\s*1/gi, 'Ted 1');
    formatted = formatted.replace(/Malden\s*1/gi, 'Mal 1');
    return formatted;
  };

  const getMatchStructure = () => {
    const [p1, p2, p3] = selectedLineup;
    const ourNames = [p1 || 'Player 1', p2 || 'Player 2', p3 || 'Player 3'];
    const [opp1, opp2, opp3] = opponentNames;
    const oppNamesList = [opp1 || 'Opp 1', opp2 || 'Opp 2', opp3 || 'Opp 3'];

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

      <header className="sticky top-0 z-20 bg-[#070a12]/90 px-4 py-3 border-b border-gray-800/40 flex justify-between items-center">
        <h1 className="text-base font-black tracking-tight text-white">
          {activeTab === 'next' && <>GRAHAM SPICER <span className="text-blue-500">2</span></>}
          {activeTab === 'fixtures' && 'FIXTURES'}
          {activeTab === 'player' && 'PLAYER'}
        </h1>
        <span className="bg-[#121929] text-xs text-gray-300 px-3 py-1 rounded-md border border-gray-700/60 font-semibold">{data?.season}</span>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {activeTab === 'next' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-4.5 space-y-4 shadow-xl">
            
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {selectedFixtureId === data?.nextFixture?.id ? 'NEXT FIXTURE' : 'SELECTED FIXTURE'}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isHomeTeam ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isHomeTeam ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {currentMatchTarget?.homeTeam} vs {currentMatchTarget?.awayTeam}
                </h2>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-gray-200 font-semibold">🕒 {currentMatchTarget?.day} {currentMatchTarget?.date} {currentMatchTarget?.month} {currentMatchTarget?.time}</p>
                <p className="text-xs text-gray-400">📍 {currentMatchTarget?.venue}</p>
              </div>
            </div>

            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">
                  PLAYER AVAILABILITY ({currentAvailability.going.length})
                </span>
              </div>

              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-[#121a2d] border border-gray-700/80 rounded-xl p-2.5 text-xs text-gray-100 font-medium outline-none"
              >
                <option value="">Select your name...</option>
                {data?.players?.map((p: any) => (
                  <option key={p.number} value={p.subName}>{p.subName} ({p.name})</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleStatusChange('going')} className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-2 rounded-xl font-bold text-xs">Going</button>
                <button onClick={() => handleStatusChange('cantGo')} className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-2 rounded-xl font-bold text-xs">Can't Go</button>
                <button onClick={() => handleStatusChange('tbc')} className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-2 rounded-xl font-bold text-xs">TBC</button>
              </div>

              <div className="space-y-1.5 text-xs pt-2.5 border-t border-gray-800/80">
                <p><strong className="text-emerald-400 uppercase">GOING:</strong> <span className="text-gray-200 font-medium">{currentAvailability.going.join(', ') || 'None'}</span></p>
                <p><strong className="text-rose-400 uppercase">CAN'T GO:</strong> <span className="text-gray-200 font-medium">{currentAvailability.cantGo.join(', ') || 'None'}</span></p>
                <p><strong className="text-amber-400 uppercase">TBC:</strong> <span className="text-gray-200 font-medium">{currentAvailability.tbc.join(', ') || 'None'}</span></p>
              </div>
            </div>

            {/* 只有當前檢視係 Next Match 嗰陣至顯示 Lineup 陣容板面 */}
            {selectedFixtureId === data?.nextFixture?.id && (
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
                        {currentAvailability.going.map((name: string) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {activeTab === 'fixtures' && (
          <div className="space-y-3">
            {data?.fixtures?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedFixtureId(item.id);
                  setActiveTab('next');
                }}
                className="bg-[#0f1626] border border-gray-800/80 hover:border-blue-500/60 cursor-pointer transition rounded-2xl p-4 flex justify-between items-center shadow"
              >
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'HOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600/30 text-blue-400'}`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-gray-100 mt-1.5">{item.homeTeam} vs {item.awayTeam}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-400 font-bold">{item.day} {item.date} {item.month}</span>
                  <p className="text-xs text-gray-400 mt-1">📍 {item.venue}</p>
                </div>
              </div>
            )) || <p className="text-center text-gray-400">No fixtures available</p>}
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-3">
            {data?.players?.map((player: any) => (
              <div key={player.number} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#080c16] flex items-center justify-center font-black text-sm">{player.number}</span>
                  <div>
                    <h3 className="text-sm font-bold">{player.subName} <span className="text-xs text-gray-400 font-normal">({player.name})</span></h3>
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

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-gray-700 text-xs">
                <thead>
                  <tr className="bg-[#121929] text-gray-300">
                    <th className="border border-gray-700 p-1 w-6">#</th>
                    
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px]">
                      Home: {isHomeTeam ? 'GS 2' : formatTeamNameForMatchCard(currentMatchTarget?.homeTeam)}
                    </th>
                    <th className="border border-gray-700 p-1 w-5 font-bold">{isHomeTeam ? 'H' : 'A'}</th>
                    
                    <th className="border border-gray-700 p-1 font-bold text-[10px]" colSpan={5}>Games Score</th>
                    
                    <th className="border border-gray-700 p-1 w-5 font-bold">{!isHomeTeam ? 'H' : 'A'}</th>
                    
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px]">
                      Away: {!isHomeTeam ? 'GS 2' : formatTeamNameForMatchCard(currentMatchTarget?.awayTeam)}
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
                    return (
                      <tr key={m.match} className="hover:bg-gray-800/30">
                        <td className="border border-gray-700 p-1 font-black">{m.match}</td>
                        
                        {isHomeTeam ? (
                          <>
                            <td className="border border-gray-700 p-1 text-left font-bold text-white whitespace-normal break-words max-w-[90px]">{m.our}</td>
                            <td className="border border-gray-700 p-1 font-bold text-blue-400">{m.ourRole}</td>
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-700 p-1 text-left whitespace-normal break-words max-w-[90px]">
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
                                  placeholder={`Opp ${index + 1}`}
                                  className="w-full bg-[#121a2d] border border-gray-700 rounded p-0.5 text-[10px] font-semibold text-white outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-gray-300 whitespace-normal break-words">{m.oppName}</span>
                              )}
                            </td>
                            <td className="border border-gray-700 p-1 font-bold text-amber-400">{m.oppRole}</td>
                          </>
                        )}
                        
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
                                className="w-3.5 bg-transparent text-center text-[11px] font-bold text-white outline-none"
                              />
                            </div>
                          </td>
                        ))}

                        {isHomeTeam ? (
                          <>
                            <td className="border border-gray-700 p-1 font-bold text-amber-400">{m.oppRole}</td>
                            <td className="border border-gray-700 p-1 text-left whitespace-normal break-words max-w-[90px]">
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
                                  placeholder={`Opp ${index + 1}`}
                                  className="w-full bg-[#121a2d] border border-gray-700 rounded p-0.5 text-[10px] font-semibold text-white outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-gray-300 whitespace-normal break-words">{m.oppName}</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-700 p-1 font-bold text-blue-400">{m.ourRole}</td>
                            <td className="border border-gray-700 p-1 text-left font-bold text-white whitespace-normal break-words max-w-[90px]">{m.our}</td>
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

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 border-t border-gray-800/80 backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-center h-14 px-4">
          <button onClick={() => setActiveTab('fixtures')} className={`text-xs font-bold ${activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-500'}`}>FIXTURES</button>
          <button onClick={() => { setSelectedFixtureId(data?.nextFixture?.id); setActiveTab('next'); }} className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-black ${activeTab === 'next' ? 'ring-2 ring-blue-400' : ''}`}>🏓</button>
          <button onClick={() => setActiveTab('player')} className={`text-xs font-bold ${activeTab === 'player' ? 'text-blue-500' : 'text-gray-500'}`}>PLAYER</button>
        </div>
      </nav>

    </main>
  );
}