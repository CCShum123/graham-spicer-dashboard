'use client';

import React, { useEffect, useState, useRef } from 'react';

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

  // 第 10 場雙打代號選擇
  const [doublesCodesH, setDoublesCodesH] = useState<string>('');
  const [doublesCodesA, setDoublesCodesA] = useState<string>('');

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

  const syncTimeoutRef = useRef<any>(null);

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
          if (json.data.doublesCodesH !== undefined) setDoublesCodesH(json.data.doublesCodesH);
          if (json.data.doublesCodesA !== undefined) setDoublesCodesA(json.data.doublesCodesA);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const syncDataToBackend = (updatedState: {
    availabilityMap?: any;
    lineup?: any;
    gameScores?: any;
    opponentNames?: any;
    doublesCodesH?: string;
    doublesCodesA?: string;
  }) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/gs-b/api/team-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            availabilityMap: updatedState.availabilityMap || availabilityMap,
            lineup: updatedState.lineup || selectedLineup,
            gameScores: updatedState.gameScores || gameScores,
            opponentNames: updatedState.opponentNames || opponentNames,
            doublesCodesH: updatedState.doublesCodesH !== undefined ? updatedState.doublesCodesH : doublesCodesH,
            doublesCodesA: updatedState.doublesCodesA !== undefined ? updatedState.doublesCodesA : doublesCodesA,
          }),
        });
      } catch (err) {
        console.error('Failed to sync data to backend:', err);
      }
    }, 500);
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

  const getGoogleMapsUrl = (venue: string, venueAddress?: string) => {
    const addressToUse = (venueAddress && venueAddress.trim() !== '') ? venueAddress : `${venue}, UK`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressToUse)}`;
  };

  const getMatchStructure = () => {
    return [
      { match: 1, label: 'A v X', homeCode: 'A', awayCode: 'X' },
      { match: 2, label: 'B v Y', homeCode: 'B', awayCode: 'Y' },
      { match: 3, label: 'C v Z', homeCode: 'C', awayCode: 'Z' },
      { match: 4, label: 'B v X', homeCode: 'B', awayCode: 'X' },
      { match: 5, label: 'A v Z', homeCode: 'A', awayCode: 'Z' },
      { match: 6, label: 'C v Y', homeCode: 'C', awayCode: 'Y' },
      { match: 7, label: 'B v Z', homeCode: 'B', awayCode: 'Z' },
      { match: 8, label: 'C v X', homeCode: 'C', awayCode: 'X' },
      { match: 9, label: 'A v Y', homeCode: 'A', awayCode: 'Y' },
      { match: 10, label: 'Doubles v', homeCode: doublesCodesH || 'H-Dbl', awayCode: doublesCodesA || 'A-Dbl' },
    ];
  };

  const calculateMatchWinner = (matchNum: number) => {
    const scores = gameScores[matchNum];
    if (!scores) return '';

    let leftWins = 0;
    let rightWins = 0;
    let hasPlayed = false;

    for (let i = 0; i < 5; i++) {
      const leftVal = parseInt(scores[i]?.left, 10);
      const rightVal = parseInt(scores[i]?.right, 10);

      if (!isNaN(leftVal) && !isNaN(rightVal) && (scores[i].left !== '' || scores[i].right !== '')) {
        hasPlayed = true;
        if (leftVal > rightVal) {
          leftWins++;
        } else if (rightVal > leftVal) {
          rightWins++;
        }
      }
    }

    if (!hasPlayed) return '';
    if (leftWins >= 3 || leftWins > rightWins) return 'L';
    if (rightWins >= 3 || rightWins > leftWins) return 'R';
    return '';
  };

  const getTotalResults = () => {
    let totalH = 0;
    let totalA = 0;
    for (let m = 1; m <= 10; m++) {
      const winner = calculateMatchWinner(m);
      if (winner === 'L') totalH++;
      if (winner === 'R') totalA++;
    }
    return { totalH, totalA };
  };

  const getPlayerWonCount = (code: string) => {
    let wins = 0;
    const structure = getMatchStructure();
    structure.forEach((m) => {
      const res = calculateMatchWinner(m.match);
      if (res === 'L') {
        if (m.homeCode.includes(code)) wins++;
      } else if (res === 'R') {
        if (m.awayCode.includes(code)) wins++;
      }
    });
    return wins > 0 ? wins : '-';
  };

  const handleNextMatchClick = () => {
    if (!data?.fixtures || data.fixtures.length === 0) return;
    const currentIndex = data.fixtures.findIndex((f: any) => f.id === selectedFixtureId);
    if (currentIndex !== -1 && currentIndex < data.fixtures.length - 1) {
      setSelectedFixtureId(data.fixtures[currentIndex + 1].id);
    } else if (data.fixtures.length > 0) {
      setSelectedFixtureId(data.fixtures[0].id);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white text-xs">Loading...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-rose-400 text-xs">Error: {error}</div>;

  const { totalH, totalA } = getTotalResults();

  return (
    <main className="min-h-screen bg-[#070a12] text-white pb-28 font-sans text-xs">
      <header className="sticky top-0 z-20 bg-[#070a12]/90 px-4 py-3 border-b border-gray-800/40 flex justify-between items-center backdrop-blur-md">
        <h1 className="text-base font-black tracking-tight text-white">
          GRAHAM SPICER <span className="text-blue-500">B</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="bg-[#121929] text-xs text-gray-300 px-3 py-1 rounded-md border border-gray-700/60 font-semibold">{data?.season}</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-3 pt-3 space-y-3">
        {activeTab === 'next' && (
          <div className="bg-[#0f1626] border border-gray-800/80 rounded-2xl p-3.5 space-y-3 shadow-xl">
            <div className="flex justify-between items-start border-b border-gray-800/80 pb-3 gap-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {selectedFixtureId === data?.nextFixture?.id ? 'COMING FIXTURE' : 'SELECTED FIXTURE'}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isHomeTeam ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {isHomeTeam ? 'HOME' : 'AWAY'}
                  </span>
                </div>
                <h2 className="text-sm font-black text-white tracking-tight whitespace-nowrap overflow-x-auto">
                  {formatTeamNameShort(currentMatchTarget?.homeTeam)} vs {formatTeamNameShort(currentMatchTarget?.awayTeam)}
                </h2>
                <p className="mt-1">
                  <a
                    href={getGoogleMapsUrl(currentMatchTarget?.venue, currentMatchTarget?.venueAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium underline transition"
                  >
                    <span>📍</span>
                    <span>{currentMatchTarget?.venue}</span>
                  </a>
                </p>
              </div>

              <div className="text-right shrink-0 space-y-1 flex flex-col items-end">
                <p className="text-[11px] text-gray-200 font-semibold whitespace-nowrap">🕒 {currentMatchTarget?.day} {currentMatchTarget?.date} {currentMatchTarget?.month} {currentMatchTarget?.year} {currentMatchTarget?.time}</p>
                <button
                  onClick={handleNextMatchClick}
                  className="bg-[#1c273c] hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-lg text-[10px] font-bold transition"
                >
                  Next match-&gt;
                </button>
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
                className="bg-[#0f1626] border border-gray-800/80 hover:border-blue-500/60 transition rounded-2xl p-3.5 flex justify-between items-center shadow gap-2"
              >
                <div
                  onClick={() => {
                    setSelectedFixtureId(item.id);
                    setActiveTab('next');
                  }}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${item.type === 'HOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-black text-gray-100 mt-1 whitespace-nowrap overflow-x-auto">
                    {formatTeamNameShort(item.homeTeam)} vs {formatTeamNameShort(item.awayTeam)}
                  </h3>
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={getGoogleMapsUrl(item.venue, item.venueAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium underline"
                    >
                      <span>📍</span>
                      <span>{item.venue}</span>
                    </a>
                  </div>
                </div>
                <div className="text-right shrink-0 cursor-pointer" onClick={() => { setSelectedFixtureId(item.id); setActiveTab('next'); }}>
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#070a12]/95 backdrop-blur-md border-t border-gray-800/60 px-6 py-3 flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`text-[11px] font-extrabold uppercase tracking-wider transition ${activeTab === 'fixtures' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          FIXTURES
        </button>

        <button
          onClick={() => {
            if (data?.nextFixture?.id) {
              setSelectedFixtureId(data.nextFixture.id);
            }
            setActiveTab('next');
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition ${
            activeTab === 'next'
              ? 'bg-blue-600 border-blue-400 shadow-blue-500/30'
              : 'bg-[#121929] border-gray-700/80 hover:bg-[#1c273c]'
          }`}
        >
          <span className="text-xl">🏓</span>
        </button>

        <button
          onClick={() => setActiveTab('player')}
          className={`text-[11px] font-extrabold uppercase tracking-wider transition ${activeTab === 'player' ? 'text-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
        >
          PLAYER
        </button>
      </nav>

      {showMatchCard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2">
          <div className="bg-[#0f1626] border border-gray-700 w-full max-w-xl rounded-2xl p-3 space-y-3 max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black tracking-wider text-white uppercase">SUTTON & DISTRICT TABLE TENNIS LEAGUE - MATCH CARD</h3>
              <button onClick={() => setShowMatchCard(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0a0e19] p-2 rounded-lg border border-gray-700">
              <div><span className="text-gray-400">Date:</span> <strong className="text-white">{currentMatchTarget?.day} {currentMatchTarget?.date} {currentMatchTarget?.month} {currentMatchTarget?.year}</strong></div>
              <div><span className="text-gray-400">Division:</span> <strong className="text-white">{data?.season || 'Division 2'}</strong></div>
            </div>

            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-center text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#121929] text-gray-300">
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px] w-1/2">
                      Home Team: {isHomeTeam ? 'GS B' : formatTeamNameShort(currentMatchTarget?.homeTeam)}
                    </th>
                    <th className="border border-gray-700 p-1 text-left font-bold text-[11px] w-1/2">
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
                    const homeWon = getPlayerWonCount(row.codeH);
                    const awayWon = getPlayerWonCount(row.codeX);

                    return (
                      <tr key={row.index} className="bg-[#0a0e19]">
                        <td className="border border-gray-700 p-1 w-1/2">
                          <div className="flex items-center gap-1">
                            <span className="w-7 shrink-0 font-bold text-blue-400 text-center">{row.codeH}</span>
                            <div className="flex-1 min-w-0 text-left font-bold text-white">
                              {isHomeTeam ? (
                                <div className="truncate px-1">{ourNameVal}</div>
                              ) : (
                                <input
                                  type="text"
                                  value={opponentNames[row.index] || ''}
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
                            </div>
                            <span className="w-8 shrink-0 border border-gray-700 rounded bg-[#121929] text-emerald-400 font-bold py-1 text-center">{homeWon}</span>
                          </div>
                        </td>

                        <td className="border border-gray-700 p-1 w-1/2">
                          <div className="flex items-center gap-1">
                            <span className="w-7 shrink-0 font-bold text-amber-400 text-center">{row.codeX}</span>
                            <div className="flex-1 min-w-0 text-left font-bold text-white">
                              {!isHomeTeam ? (
                                <div className="truncate px-1">{ourNameVal}</div>
                              ) : (
                                <input
                                  type="text"
                                  value={opponentNames[row.index] || ''}
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
                            </div>
                            <span className="w-8 shrink-0 border border-gray-700 rounded bg-[#121929] text-emerald-400 font-bold py-1 text-center">{awayWon}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse border border-gray-700 text-xs">
                <thead>
                  <tr className="bg-[#121929] text-gray-300 text-[10px]">
                    <th className="border border-gray-700 p-1 w-28 font-bold">Match Order</th>
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
                    const matchWinnerResult = calculateMatchWinner(m.match);
                    let displayWon = '';
                    if (matchWinnerResult === 'L') {
                      displayWon = m.homeCode;
                    } else if (matchWinnerResult === 'R') {
                      displayWon = m.awayCode;
                    }

                    return (
                      <tr key={m.match} className="hover:bg-gray-800/30">
                        <td className="border border-gray-700 p-1 font-bold text-blue-400 bg-[#0a0e19]">
                          {m.match === 10 ? (
                            <div className="flex items-center justify-center gap-1 text-[11px]">
                              <select
                                value={doublesCodesH.substring(0, 1)}
                                onChange={(e) => {
                                  const secondChar = doublesCodesH.substring(1, 2) || 'B';
                                  const val = e.target.value + secondChar;
                                  setDoublesCodesH(val);
                                  syncDataToBackend({ doublesCodesH: val });
                                }}
                                className="w-8 h-7 bg-[#121a2d] border border-gray-700 rounded text-center text-white font-bold p-0 outline-none text-[11px]"
                              >
                                <option value="">-</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                              </select>
                              <select
                                value={doublesCodesH.substring(1, 2)}
                                onChange={(e) => {
                                  const firstChar = doublesCodesH.substring(0, 1) || 'A';
                                  const val = firstChar + e.target.value;
                                  setDoublesCodesH(val);
                                  syncDataToBackend({ doublesCodesH: val });
                                }}
                                className="w-8 h-7 bg-[#121a2d] border border-gray-700 rounded text-center text-white font-bold p-0 outline-none text-[11px]"
                              >
                                <option value="">-</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                              </select>

                              <span className="text-gray-300 font-bold px-0.5">v</span>

                              <select
                                value={doublesCodesA.substring(0, 1)}
                                onChange={(e) => {
                                  const secondChar = doublesCodesA.substring(1, 2) || 'Y';
                                  const val = e.target.value + secondChar;
                                  setDoublesCodesA(val);
                                  syncDataToBackend({ doublesCodesA: val });
                                }}
                                className="w-8 h-7 bg-[#121a2d] border border-gray-700 rounded text-center text-white font-bold p-0 outline-none text-[11px]"
                              >
                                <option value="">-</option>
                                <option value="X">X</option>
                                <option value="Y">Y</option>
                                <option value="Z">Z</option>
                              </select>
                              <select
                                value={doublesCodesA.substring(1, 2)}
                                onChange={(e) => {
                                  const firstChar = doublesCodesA.substring(0, 1) || 'X';
                                  const val = firstChar + e.target.value;
                                  setDoublesCodesA(val);
                                  syncDataToBackend({ doublesCodesA: val });
                                }}
                                className="w-8 h-7 bg-[#121a2d] border border-gray-700 rounded text-center text-white font-bold p-0 outline-none text-[11px]"
                              >
                                <option value="">-</option>
                                <option value="X">X</option>
                                <option value="Y">Y</option>
                                <option value="Z">Z</option>
                              </select>
                            </div>
                          ) : (
                            m.label
                          )}
                        </td>

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
                                className="w-5 text-center bg-transparent text-white font-bold outline-none text-[11px]"
                              />
                              <span className="text-gray-500 text-[10px]">-</span>
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
                                className="w-5 text-center bg-transparent text-white font-bold outline-none text-[11px]"
                              />
                            </div>
                          </td>
                        ))}

                        <td className="border border-gray-700 p-1 text-[10px] text-gray-400 bg-[#0a0e19]">
                          -
                        </td>
                        <td className="border border-gray-700 p-1 font-bold text-emerald-400 bg-[#0a0e19]">
                          {displayWon}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-[#121929] px-3 py-2 rounded-xl border border-gray-700 text-xs font-bold">
              <span>Total Match Score:</span>
              <span className="text-blue-400 text-sm">
                Home {totalH} - {totalA} Away
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}