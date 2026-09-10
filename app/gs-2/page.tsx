'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// INTERFACES & TYPES
// ==========================================
interface Player {
  number: number;
  subName: string;
  name: string;
}

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  venueAddress: string;
  day: string;
  date: string;
  month: string;
  year: string;
  time: string;
  type: 'HOME' | 'AWAY';
}

interface AvailabilityRecord {
  going: string[];
  cantGo: string[];
  tbc: string[];
}

interface TeamData {
  season: string;
  players: Player[];
  nextFixture: Fixture;
  fixtures: Fixture[];
  availabilityMap: Record<string, AvailabilityRecord>;
  lineup: string[];
  gameScores: Record<string, Array<{ left: string; right: string }>>;
  opponentNames: string[];
  doublesCodesH: string;
  doublesCodesA: string;
}

// ==========================================
// MAIN COMPONENT (GS-2)
// ==========================================
export default function TeamPageGS2() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal and Target states
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [currentMatchTarget, setCurrentMatchTarget] = useState<Fixture | null>(null);
  
  // Navigation & Tab States
  const [activeTab, setActiveTab] = useState<'fixtures' | 'lineup' | 'scores'>('fixtures');

  // Fetch initial data on mount
  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team-data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to load team data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updatedFields: Partial<TeamData>) => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch('/api/team-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to save data');
      }
      setData({ ...data, ...updatedFields });
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Availability Handler Logic
  const handleAvailabilityChange = (matchId: string, playerName: string, status: 'going' | 'cantGo' | 'tbc') => {
    if (!data) return;
    const currentMap = data.availabilityMap[matchId] || { going: [], cantGo: [], tbc: [] };

    const updatedGoing = currentMap.going.filter((p) => p !== playerName);
    const updatedCantGo = currentMap.cantGo.filter((p) => p !== playerName);
    const updatedTbc = currentMap.tbc.filter((p) => p !== playerName);

    if (status === 'going') updatedGoing.push(playerName);
    if (status === 'cantGo') updatedCantGo.push(playerName);
    if (status === 'tbc') updatedTbc.push(playerName);

    const newAvailabilityMap = {
      ...data.availabilityMap,
      [matchId]: { going: updatedGoing, cantGo: updatedCantGo, tbc: updatedTbc },
    };

    saveData({ availabilityMap: newAvailabilityMap });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading Graham Spicers 2 Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center space-y-2">
          <h2 className="font-bold text-lg">Error Loading Data</h2>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchTeamData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <header className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">GS-2</span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Graham Spicers 2</h1>
          </div>
          <p className="text-sm text-gray-500">Season: <span className="font-semibold text-gray-700">{data.season}</span> | Table Tennis Match & Availability Management</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'fixtures' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fixtures & Availability
          </button>
          <button
            onClick={() => setActiveTab('lineup')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'lineup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lineup & Codes
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${
              activeTab === 'scores' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scores Matrix
          </button>
        </div>
      </header>

      {/* SAVING STATUS NOTIFICATION */}
      {saving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Syncing modifications back to GitHub repository...</span>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 1: FIXTURES & AVAILABILITY             */}
      {/* ========================================== */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-800">Match Schedule & Squad Availability</h2>
            <span className="text-xs text-gray-500 font-medium">Total Fixtures: {data.fixtures.length}</span>
          </div>

          <div className="grid gap-4">
            {data.fixtures.map((fixture) => {
              const matchAvail = data.availabilityMap[fixture.id] || { going: [], cantGo: [], tbc: [] };
              const isHome = fixture.type === 'HOME';

              return (
                <div key={fixture.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
                  {/* Match Meta Top Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-extrabold rounded-md ${
                        isHome ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fixture.type}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">
                        {fixture.homeTeam} <span className="text-gray-400 font-normal mx-1">vs</span> {fixture.awayTeam}
                      </h3>
                    </div>
                    <div className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      📅 {fixture.day}, {fixture.date} {fixture.month} {fixture.year} <span className="text-blue-600 font-bold ml-1">@ {fixture.time}</span>
                    </div>
                  </div>

                  {/* Venue Details with Modal trigger */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                    <div className="text-sm space-y-0.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Match Venue Location</span>
                      <button
                        onClick={() => {
                          setCurrentMatchTarget(fixture);
                          setShowMapModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-bold text-left inline-flex items-center gap-1.5 transition-colors group"
                        title="Click to open venue map modal"
                      >
                        <span>📍 {fixture.venue}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">View Venue Map ↗</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 font-medium sm:text-right">
                      <span className="block text-gray-400 text-[10px] uppercase tracking-wider">Address details</span>
                      {fixture.venueAddress || 'Address not specified'}
                    </div>
                  </div>

                  {/* Player Availability Interactive Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Squad Availability Toggles:</p>
                      <div className="text-[11px] text-gray-500 space-x-3">
                        <span className="text-green-700 font-semibold">🟢 Yes: {matchAvail.going.length}</span>
                        <span className="text-red-700 font-semibold">🔴 No: {matchAvail.cantGo.length}</span>
                        <span className="text-amber-700 font-semibold">🟡 TBC: {matchAvail.tbc.length}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {data.players.map((player) => {
                        const isGoing = matchAvail.going.includes(player.subName);
                        const isCantGo = matchAvail.cantGo.includes(player.subName);
                        const isTbc = matchAvail.tbc.includes(player.subName);

                        return (
                          <div key={player.subName} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 shadow-2xs">
                            <div className="truncate pr-2">
                              <span className="text-xs font-bold text-gray-800 block truncate" title={player.name}>
                                {player.subName}
                              </span>
                              <span className="text-[10px] text-gray-400">#{player.number}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleAvailabilityChange(fixture.id, player.subName, 'going')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isGoing ? 'bg-green-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => handleAvailabilityChange(fixture.id, player.subName, 'cantGo')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isCantGo ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                No
                              </button>
                              <button
                                onClick={() => handleAvailabilityChange(fixture.id, player.subName, 'tbc')}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                                  isTbc ? 'bg-amber-500 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                TBC
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: LINEUP & CODES                      */}
      {/* ========================================== */}
      {activeTab === 'lineup' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Doubles Match Codes Configuration</h2>
              <p className="text-sm text-gray-500">Configure team pairing / doubles codes for home and away setups.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Doubles Code Home (doublesCodesH)</label>
                <input
                  type="text"
                  value={data.doublesCodesH}
                  onChange={(e) => saveData({ doublesCodesH: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g., A, B, C / X, Y, Z"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Doubles Code Away (doublesCodesA)</label>
                <input
                  type="text"
                  value={data.doublesCodesA}
                  onChange={(e) => saveData({ doublesCodesA: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="e.g., A, B, C / X, Y, Z"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registered Team Squad Lineup</h3>
                <p className="text-xs text-gray-500">Edit player slot sequences or roster names below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.lineup.map((playerLineupName, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 w-6 text-center">#{index + 1}</span>
                    <input
                      type="text"
                      value={playerLineupName}
                      onChange={(e) => {
                        const newLineup = [...data.lineup];
                        newLineup[index] = e.target.value;
                        saveData({ lineup: newLineup });
                      }}
                      className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Players Roster Info Box */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <h3 className="text-base font-bold text-gray-900">Full Player Roster Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.players.map((p) => (
                  <div key={p.number} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-blue-600 font-semibold">{p.subName}</p>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">#{p.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: SCORES MATRIX                       */}
      {/* ========================================== */}
      {activeTab === 'scores' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Game Scores Matrix & Opponents</h2>
              <p className="text-sm text-gray-500">Manage opposing team titles and record individual leg/game score breakdowns.</p>
            </div>

            {/* Opponent Names Editor */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Opponents List</h3>
              <div className="flex flex-wrap gap-2">
                {data.opponentNames.map((opp, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opp}
                    onChange={(e) => {
                      const newOpponents = [...data.opponentNames];
                      newOpponents[idx] = e.target.value;
                      saveData({ opponentNames: newOpponents });
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-44"
                  />
                ))}
              </div>
            </div>

            {/* Scores By Opponent Section */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Detailed Scores Breakdown per Opponent</h3>
              
              <div className="space-y-4">
                {Object.entries(data.gameScores).map(([oppKey, scoreList]) => (
                  <div key={oppKey} className="border border-gray-200 p-4 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-gray-800 tracking-wide uppercase bg-blue-50 text-blue-800 px-2.5 py-1 rounded border border-blue-100">{oppKey}</h4>
                      <span className="text-xs text-gray-400 font-medium">{scoreList.length} matches recorded</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {scoreList.map((score, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between bg-white p-2.5 border border-gray-200 rounded-lg shadow-2xs">
                          <span className="text-xs font-bold text-gray-400">#{(sIdx + 1)}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={score.left}
                              onChange={(e) => {
                                const newScores = { ...data.gameScores };
                                newScores[oppKey][sIdx].left = e.target.value;
                                saveData({ gameScores: newScores });
                              }}
                              className="w-12 border border-gray-300 rounded p-1 text-center text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                            <span className="text-xs font-bold text-gray-400">:</span>
                            <input
                              type="text"
                              value={score.right}
                              onChange={(e) => {
                                const newScores = { ...data.gameScores };
                                newScores[oppKey][sIdx].right = e.target.value;
                                saveData({ gameScores: newScores });
                              }}
                              className="w-12 border border-gray-300 rounded p-1 text-center text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VENUE MAP MODAL (GS-2 Adapted Version)     */}
      {/* ========================================== */}
      {showMapModal && currentMatchTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Venue Location Details</span>
                <h3 className="text-lg font-black text-gray-900 mt-1">{currentMatchTarget.venue}</h3>
              </div>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setCurrentMatchTarget(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Full Address</p>
              <p className="text-sm font-semibold text-gray-800">{currentMatchTarget.venueAddress || 'No address provided for this venue.'}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentMatchTarget.venue}, ${currentMatchTarget.venueAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors text-center shadow-md shadow-blue-100"
              >
                Open in Google Maps ↗
              </a>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setCurrentMatchTarget(null);
                }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}