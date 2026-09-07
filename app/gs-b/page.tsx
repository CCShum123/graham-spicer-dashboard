'use client';

import React, { useEffect, useState } from 'react';

export default function GrahamSpicerBPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'player'>('next');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('');

  const [availabilityMap, setAvailabilityMap] = useState<{ [key: string]: { going: string[]; cantGo: string[]; tbc: string[] } }>({});

  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedLineup, setSelectedLineup] = useState<string[]>(['', '', '']);
  const [showMatchCard, setShowMatchCard] = useState(false);
  const [opponentNames, setOpponentNames] = useState<string[]>(['', '', '']);

  // 第 10 場（雙打）嘅主客隊各 2 位球員選擇
  const [doublesLineupH, setDoublesLineupH] = useState<string[]>(['', '']);
  const [doublesLineupA, setDoublesLineupA] = useState<string[]>(['', '']);

  // 1 到 10 場比分
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
    10: Array(5).fill({ left: '', right: '' }),
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/gs-b/api/team-data');
        if (!res.ok) throw new Error(`API status: ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.nextFixture?.id) {
            setSelectedFixtureId(json.data.nextFixture.id);
          }
          if (json.data.availabilityMap) {
            setAvailabilityMap(json.data.availabilityMap);
          } else if (json.data.fixtures && json.data.players) {
            const initialMap: any = {};
            const allPlayerNames = json.data.players.map((p: any) => p.subName);
            json.data.fixtures.forEach((f: any) => {
              initialMap[f.id] = { going: [], cantGo: [], tbc: [...allPlayerNames] };
            });
            setAvailabilityMap(initialMap);
          }
          if (json.data.lineup) setSelectedLineup(json.data.lineup);
          if (json.data.gameScores) setGameScores(json.data.gameScores);
          if (json.data.opponentNames) setOpponentNames(json.data.opponentNames);
          if (json.data.doublesLineupH) setDoublesLineupH(json.data.doublesLineupH);
          if (json.data.doublesLineupA) setDoublesLineupA(json.data.doublesLineupA);
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
    doublesLineupH?: any;
    doublesLineupA?: any;
  }) => {
    try {
      await fetch('/gs-b/api/team-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityMap: updatedState.availabilityMap || availabilityMap,
          lineup: updatedState.lineup || selectedLineup,
          gameScores: updatedState.gameScores || gameScores,
          opponentNames: updatedState.opponentNames || opponentNames,
          doublesLineupH: updatedState.doublesLineupH || doublesLineupH,
          doublesLineupA: updatedState.doublesLineupA || doublesLineupA,
        }),
      });
    } catch (err) {
      console.error('Failed to sync data to backend:', err);
    }
  };

  const currentMatchTarget = data?.fixtures?.find((f: any) => f.id === selectedFixtureId) || data?.nextFixture;
  const isHomeTeam = currentMatchTarget?.type === 'HOME';

  const allPlayerNames = data?.players?.map((p: any) => p.subName) || [];
  const currentAvailability = availabilityMap[selectedFixtureId] || { going: [], cantGo: [], tbc: [...allPlayerNames] };

  const handleStatusChange = (status: 'going' | 'cantGo' | 'tbc') => {
    if (!selectedPlayer) {
      alert('Please select your name first!');
      return;
    }

    setAvailabilityMap((prev) => {
      const targetAvail = prev[selectedFixtureId] || { going: [], cantGo: [], tbc: [...allPlayerNames] };
      const newGoing = (targetAvail.going || []).filter((p: string) => p !== selectedPlayer);
      const newCantGo = (targetAvail.cantGo || []).filter((p: string) => p !== selectedPlayer);
      const newTbc = (targetAvail.tbc || []).filter((p: string) => p !== selectedPlayer);

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

  const formatTeamNameShort = (name: string) => {
    if (!name) return '';
    let formatted = name;
    formatted = formatted.replace(/Graham\s*Spicers?\s*B/gi, 'GS B');
    formatted = formatted.replace(/Graham\s*Spicers?\s*A/gi, 'GS A');
    return formatted;
  };

  // 10 場對賽結構（帶返 A/B/C 同 X/Y/Z 代號）
  const getMatchStructure = () => {
    const [p1, p2, p3] = selectedLineup;
    const ourNames = [p1 || 'Player 1', p2 || 'Player 2', p3 || 'Player 3'];
    const [opp1, opp2, opp3] = opponentNames;
    const oppNamesList = [opp1 || 'Opp 1', opp2 || 'Opp 2', opp3 || 'Opp 3'];

    const dH1 = doublesLineupH[0] || 'DH1';
    const dH2 = doublesLineupH[1] || 'DH2';
    const dA1 = doublesLineupA[0] || 'DA1';
    const dA2 = doublesLineupA[1] || 'DA2';

    if (isHomeTeam) {
      return [
        { match: 1, label: 'A v X', homeName: ourNames[0], homeCode: 'A', awayName: oppNamesList[0], awayCode: 'X' },
        { match: 2, label: 'B v Y', homeName: ourNames[1], homeCode: 'B', awayName: oppNamesList[1], awayCode: 'Y' },
        { match: 3, label: 'C v Z', homeName: ourNames[2], homeCode: 'C', awayName: oppNamesList[2], awayCode: 'Z' },
        { match: 4, label: 'B v X', homeName: ourNames[1], homeCode: 'B', awayName: oppNamesList[0], awayCode: 'X' },
        { match: 5, label: 'A v Z', homeName: ourNames[0], homeCode: 'A', awayName: oppNamesList[2], awayCode: 'Z' },
        { match: 6, label: 'C v Y', homeName: ourNames[2], homeCode: 'C', awayName: oppNamesList[1], awayCode: 'Y' },
        { match: 7, label: 'B v Z', homeName: ourNames[1], homeCode: 'B', awayName: oppNamesList[2], awayCode: 'Z' },
        { match: 8, label: 'C v X', homeName: ourNames[2], homeCode: 'C', awayName: oppNamesList[0], awayCode: 'X' },
        { match: 9, label: 'A v Y', homeName: ourNames[0], homeCode: 'A', awayName: oppNamesList[1], awayCode: 'Y' },
        { match: 10, label: 'Doubles v', homeName: `${dH1} & ${dH2}`, homeCode: 'H-Dbl', awayName: `${dA1} & ${dA2}`, awayCode: 'A-Dbl' },
      ];
    } else {
      return [
        { match: 1, label: 'A v X', homeName: oppNamesList[0], homeCode: 'X', awayName: ourNames[0], awayCode: 'A' },
        { match: 2, label: 'B v Y', homeName: oppNamesList[1], homeCode: 'Y', awayName: ourNames[1], awayCode: 'B' },
        { match: 3, label: 'C v Z', homeName: oppNamesList[2], homeCode: 'Z', awayName: ourNames[2], awayCode: 'C' },
        { match: 4, label: 'B v X', homeName: oppNamesList[0], homeCode: 'X', awayName: ourNames[1], awayCode: 'B' },
        { match: 5, label: 'A v Z', homeName: oppNamesList[2], homeCode: 'Z', awayName: ourNames[2], awayCode: 'C' }, // 注意Away位置對調
        { match: 6, label: 'C v Y', homeName: oppNamesList[1], homeCode: 'Y', awayName: ourNames[1], awayCode: 'B' },
        { match: 7, label: 'B v Z', homeName: oppNamesList[1], homeCode: 'Y', awayName: ourNames[2], awayCode: 'C' },
        { match: 8, label: 'C v X', homeName: oppNamesList[2], homeCode: 'Z', awayName: ourNames[0], awayCode: 'A' },
        { match: 9, label: 'A v Y', homeName: oppNamesList[0], homeCode: 'X', awayName: ourNames[1], awayCode: 'B' },
        { match: 10, label: 'Doubles v', homeName: `${dA1} & ${dA2}`, homeCode: 'A-Dbl', awayName: `${dH1} & ${dH2}`, homeCode_alt: 'H-Dbl' },
      ];
    }
  };

  // 計算每場邊個贏（根據 5 局入面邊邊贏得多局）
  // 回傳 'H' (Home贏), 'A' (Away贏), 或 '' (未分勝負/未填完)
  const calculateMatchWinner = (matchNum: number) => {
    const scores = gameScores[matchNum];
    if (!scores) return '';

    let homeWins = 0;
    let awayWins = 0;
    let hasPlayed = false;

    for (let i = 0; i < 5; i++) {
      const leftVal = parseInt(scores[i]?.left, 10);
      const rightVal = parseInt(scores[i]?.right, 10);

      if (!isNaN(leftVal) && !isNaN(rightVal) && (scores[i].left !== '' || scores[i].right !== '')) {
        hasPlayed = true;
        if (leftVal > rightVal) {
          homeWins++;
        } else if (rightVal > leftVal) {
          awayWins++;
        }
      }
    }

    if (!hasPlayed) return '';
    // 乒乓球 5 局 3 勝
    if (homeWins >= 3) return 'H';
    if (awayWins >= 3) return 'A';
    // 如果未夠 3 勝但已經入咗比分，睇邊邊暫時贏得比較多局
    if (homeWins > awayWins) return 'H';
    if (awayWins > homeWins) return 'A';
    return '';
  };

  // 計算總 RESULT (H 贏幾場, A 贏幾場)
  const getTotalResults = () => {
    let totalH = 0;
    let totalA = 0;
    for (let m = 1; m <= 10; m++) {
      const winner = calculateMatchWinner(m);
      if (winner === 'H') totalH++;
      if (winner === 'A') totalA++;
    }
    return { totalH, totalA };
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white text-xs">Loading...</div>;

  const { totalH, totalA } = getTotalResults();

  return (
    <main className="min-h-screen bg-[#070a12] text-white pb-24 font-sans text-xs">

      <header className="sticky top-0 z-20 bg-[#070a12]/90 px-4 py-3 border-b border-gray-800/40 flex justify-between items-center">
        <h1 className="text-base font-black tracking-tight text-white">
          {activeTab === 'next' && <>GRAHAM SPICER <span className="text-blue-500">B</span></>}
          {activeTab === 'fixtures' && 'FIXTURES'}
          {activeTab === 'player' && 'PLAYER'}
        </h1>
        <span className="bg-[#121929] text-xs text-gray-300 px-3 py-1 rounded-md border border-gray-700/60 font-semibold">{data?.season}</span>
      </header>

      <div className="max-w-md mx-auto px-3 pt-3 space-y-3">

        {activeTab === 'next' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3.5 space-y-3 shadow-xl">
            
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-3 gap-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {selectedFixtureId === data?.nextFixture?.id ? 'NEXT FIXTURE' : 'SELECTED FIXTURE'}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isHomeTeam ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isHomeTeam ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <h2 className="text-sm font-black text-white tracking-tight whitespace-nowrap overflow-x-auto">
                  {formatTeamNameShort(currentMatchTarget?.homeTeam)} vs {formatTeamNameShort(currentMatchTarget?.awayTeam)}
                </h2>
                <p className="text-[11px] text-gray-400 mt-1">📍 {currentMatchTarget?.venue}</p>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-[11px] text-gray-200 font-semibold whitespace-nowrap">🕒 {currentMatchTarget?.day} {currentMatchTarget?.date} {currentMatchTarget?.month} {currentMatchTarget?.year} {currentMatchTarget?.time}</p>
              </div>
            </div>

            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-wider text-gray-300 uppercase">
                  PLAYER AVAILABILITY ({(currentAvailability?.going || []).length})
                </span>
              </div>

              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-[#121a2d] border border-gray-700/80 rounded-xl p-2 text-xs text-gray-100 font-medium outline-none"
              >
                <option value="">Select your name...</option>
                {data?.players?.map((p: any) => (
                  <option key={p.number} value={p.subName}>{p.subName} ({p.name})</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleStatusChange('going')} className="bg-[#1c273c] hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 py-1.5 rounded-xl font-bold text-xs">Available</button>
                <button onClick={() => handleStatusChange('cantGo')} className="bg-[#1c273c] hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 py-1.5 rounded-xl font-bold text-xs">Unavailable</button>
                <button onClick={() => handleStatusChange('tbc')} className="bg-[#1c273c] hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 py-1.5 rounded-xl font-bold text-xs">TBC</button>
              </div>

              <div className="space-y-1 text-[11px] pt-2 border-t border-gray-800/80">
                <p><strong className="text-emerald-400 uppercase">AVAILABLE:</strong> <span className="text-gray-200 font-medium">{(currentAvailability?.going || []).join(', ') || 'None'}</span></p>
                <p><strong className="text-rose-400 uppercase">UNAVAILABLE:</strong> <span className="text-gray-200 font-medium">{(currentAvailability?.cantGo || []).join(', ') || 'None'}</span></p>
                <p><strong className="text-amber-400 uppercase">TBC:</strong> <span className="text-gray-200 font-medium">{(currentAvailability?.tbc || []).join(', ') || 'None'}</span></p>
              </div>
            </div>

            <div className="bg-[#0a0e19] border border-gray-800/60 rounded-xl p-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">TEAM LINEUP</span>
                
                <button
                  onClick={() => setShowMatchCard(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5"
                >
                  <span>📋 Match Card</span>
                </button>
              </div>

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
                        syncDataToBackend({ lineup: updated });
                      }}
                      className="w-full bg-[#121a2d] border border-gray-700 rounded-xl p-1.5 text-xs text-gray-100 font-medium outline-none"
                    >
                      <option value="">Select...</option>
                      {(currentAvailability?.going || []).map((name: string) => (
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
          <div className="space-y-2.5">
            {data?.fixtures?.map((item: any) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedFixtureId(item.id);
                  setActiveTab('next');
                }}
                className="bg-[#0f1626] border border-gray-800/80 hover:border-blue-500/60 cursor-pointer transition rounded-2xl p-3.5 flex justify-between items-center shadow gap-2"
              >
                <div className="min-w-0 flex-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${item.type === 'HOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-black text-gray-100 mt-1 whitespace-nowrap overflow-x-auto">
                    {formatTeamNameShort(item.homeTeam)} vs {formatTeamNameShort(item.awayTeam)}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">📍 {item.venue}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-blue-400 font-bold whitespace-nowrap">{item.day} {item.date} {item.month} {item.year}</span>
                </div>
              </div>
            )) || <p className="text-center text-gray-400">No fixtures available</p>}
          </div>
        )}

        {activeTab === 'player' && (
          <div className="space-y-2.5">
            {data?.players?.map((player: any) => (
              <div key={player.number} className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#080c16] flex items-center justify-center font-black text-xs">{player.number}</span>
                  <div>
                    <h3 className="text-xs font-bold">{player.subName} <span className="text-[11px] text-gray-400 font-normal">({player.name})</span></h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {showMatchCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-[#0f1626] border border-gray-700 w-full max-w-xl rounded-2xl p-3 space-y-3 max-h-[95vh] overflow-y-auto shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black tracking-wider text-white uppercase">SUTTON & DISTRICT TABLE TENNIS LEAGUE - MATCH CARD</h3>
              <button onClick={() => setShowMatchCard(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center">✕</button>
            </div>

            {/* 1) 頂頭加返個日子同 Division */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0a0e19] p-2 rounded-lg border border-gray-700">
              <div><span className="text-gray-400">Date:</span> <strong className="text-white">{currentMatchTarget?.day} {currentMatchTarget?.date} {currentMatchTarget?.month} {currentMatchTarget?.year}</strong></div>
              <div><span className="text-gray-400">Division:</span> <strong className="text-white">{data?.season || 'Division 2'}</strong></div>
            </div>

            {/* 2 & 3) 球員名稱欄：主隊ABC，客隊XYZ，各佔版面一半闊度 */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-center text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#121929] text-gray-300">
                    <th className="w-1/2 border border-gray-700 p-1 text-left font-bold text-[11px]" colSpan={3}>
                      Home Team: {isHomeTeam ? 'GS B' : formatTeamNameShort(currentMatchTarget?.homeTeam)}
                    </th>
                    <th className="w-1/2 border border-gray-700 p-1 text-left font-bold text-[11px]" colSpan={3}>
                      Away Team: {!isHomeTeam ? 'GS B' : formatTeamNameShort(currentMatchTarget?.awayTeam)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { codeH: 'A', codeX: 'X', index: 0 },
                    { codeH: 'B', codeX: 'Y', index: 1 },
                    { codeH: 'C', codeX: 'Z', index: 2 },
                  ].map((row) => {
                    const ourNameVal = selectedLineup[row.index] || `Player ${row.index + 1}`;
                    const oppNameVal = opponentNames[row.index] || `Opp ${row.index + 1}`;
                    
                    return (
                      <tr key={row.index} className="bg-[#0a0e19]">
                        {/* 主隊 (ABC) */}
                        <td className="w-8 border border-gray-700 p-1 font-bold text-blue-400">{isHomeTeam ? row.codeH : row.codeX}</td>
                        <td className="border border-gray-700 p-1 text-left font-bold text-white truncate">
                          {isHomeTeam ? ourNameVal : (
                            <input
                              type="text"
                              value={opponentNames[row.index]}
                              onChange={(e) => {
                                const updatedOpp = [...opponentNames];
                                updatedOpp[row.index] = e.target.value;
                                setOpponentNames(updatedOpp);
                                syncDataToBackend({ opponentNames: updatedOpp });
                              }}
                              placeholder={`Opp ${row.index + 1}`}
                              className="w-full bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] font-semibold text-white outline-none"
                            />
                          )}
                        </td>
                        <td className="w-10 border border-gray-700 p-1 text-gray-300 font-semibold">-</td>

                        {/* 客隊 (XYZ) */}
                        <td className="w-8 border border-gray-700 p-1 font-bold text-amber-400">{isHomeTeam ? row.codeX : row.codeH}</td>
                        <td className="border border-gray-700 p-1 text-left font-bold text-white truncate">
                          {!isHomeTeam ? ourNameVal : (
                            <input
                              type="text"
                              value={opponentNames[row.index]}
                              onChange={(e) => {
                                const updatedOpp = [...opponentNames];
                                updatedOpp[row.index] = e.target.value;
                                setOpponentNames(updatedOpp);
                                syncDataToBackend({ opponentNames: updatedOpp });
                              }}
                              placeholder={`Opp ${row.index + 1}`}
                              className="w-full bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] font-semibold text-white outline-none"
                            />
                          )}
                        </td>
                        <td className="w-10 border border-gray-700 p-1 text-gray-300 font-semibold">-</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4) 雙打（Doubles）選人專區：主客每邊各選兩位球員 */}
            <div className="bg-[#0a0e19] border border-gray-700 rounded-lg p-2.5 space-y-2">
              <span className="text-[11px] font-bold text-blue-400 uppercase">Doubles Lineup (Match 10 Selection)</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-semibold">Home Team Doubles (Pick 2)</label>
                  <div className="flex gap-1">
                    <select
                      value={doublesLineupH[0]}
                      onChange={(e) => {
                        const updated = [e.target.value, doublesLineupH[1]];
                        setDoublesLineupH(updated);
                        syncDataToBackend({ doublesLineupH: updated });
                      }}
                      className="w-1/2 bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] text-white outline-none"
                    >
                      <option value="">Player 1</option>
                      {(isHomeTeam ? (currentAvailability?.going || []) : opponentNames).map((n: string) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <select
                      value={doublesLineupH[1]}
                      onChange={(e) => {
                        const updated = [doublesLineupH[0], e.target.value];
                        setDoublesLineupH(updated);
                        syncDataToBackend({ doublesLineupH: updated });
                      }}
                      className="w-1/2 bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] text-white outline-none"
                    >
                      <option value="">Player 2</option>
                      {(isHomeTeam ? (currentAvailability?.going || []) : opponentNames).map((n: string) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-semibold">Away Team Doubles (Pick 2)</label>
                  <div className="flex gap-1">
                    <select
                      value={doublesLineupA[0]}
                      onChange={(e) => {
                        const updated = [e.target.value, doublesLineupA[1]];
                        setDoublesLineupA(updated);
                        syncDataToBackend({ doublesLineupA: updated });
                      }}
                      className="w-1/2 bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] text-white outline-none"
                    >
                      <option value="">Player 1</option>
                      {(!isHomeTeam ? (currentAvailability?.going || []) : opponentNames).map((n: string) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <select
                      value={doublesLineupA[1]}
                      onChange={(e) => {
                        const updated = [doublesLineupA[0], e.target.value];
                        setDoublesLineupA(updated);
                        syncDataToBackend({ doublesLineupA: updated });
                      }}
                      className="w-1/2 bg-[#121a2d] border border-gray-700 rounded p-1 text-[11px] text-white outline-none"
                    >
                      <option value="">Player 2</option>
                      {(!isHomeTeam ? (currentAvailability?.going || []) : opponentNames).map((n: string) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 5) 下方對賽比分表格 (Match Order, Game 1-5, F.A., 仲有自動計算嘅 WON 欄) */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-gray-700 text-xs">
                <thead>
                  <tr className="bg-[#121929] text-gray-300 text-[10px]">
                    <th className="border border-gray-700 p-1 w-16 font-bold">Match Order</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold">Game 1</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold">Game 2</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold">Game 3</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold">Game 4</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold">Game 5</th>
                    <th className="border border-gray-700 p-1 w-8 font-bold">F.A.</th>
                    <th className="border border-gray-700 p-1 w-10 font-bold text-emerald-400">WON</th>
                  </tr>
                </thead>
                <tbody>
                  {getMatchStructure().map((m) => {
                    const matchWinner = calculateMatchWinner(m.match);
                    // 根據邊個隊伍贏，顯示對應嘅代號（例如主隊贏出係 A/B/C 或 H，客隊係 X/Y/Z 或 A）
                    let displayWon = '';
                    if (matchWinner === 'H') {
                      displayWon = isHomeTeam ? m.homeCode : m.awayCode;
                    } else if (matchWinner === 'A') {
                      displayWon = isHomeTeam ? m.awayCode : m.homeCode;
                    }

                    return (
                      <tr key={m.match} className="hover:bg-gray-800/30">
                        <td className="border border-gray-700 p-1 font-bold text-blue-400 bg-[#0a0e19]">{m.label}</td>
                        
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

                        {/* F.A. 格仔 */}
                        <td className="border border-gray-700 p-1 text-gray-500 font-semibold">-</td>

                        {/* WON 欄自動顯示贏咗嗰位球員代號 */}
                        <td className="border border-gray-700 p-1 font-black text-emerald-400 bg-emerald-950/20">
                          {displayWon}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 6) RESULT 行：自動計算 H 同 A 總贏場數 */}
            <div className="bg-[#0a0e19] border border-gray-700 rounded-lg p-2.5 flex justify-between items-center px-4 font-bold text-xs">
              <span className="tracking-wider text-blue-400">RESULT (Total Matches Won)</span>
              <div className="flex gap-6">
                <span className="bg-[#121929] px-3 py-1 rounded border border-gray-700">H: <strong className="text-emerald-400 text-sm">{totalH}</strong></span>
                <span className="bg-[#121929] px-3 py-1 rounded border border-gray-700">A: <strong className="text-emerald-400 text-sm">{totalA}</strong></span>
              </div>
            </div>

            {/* 7) 已經刪除咗 home captain / away captain signed 嗰行 */}

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