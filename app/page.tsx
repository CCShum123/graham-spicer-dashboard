'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'next' | 'fixtures' | 'standings' | 'roster'>('next');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/team-data');
        if (!res.ok) {
          throw new Error(`API status: ${res.status}`);
        }
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="animate-pulse text-lg font-medium">Loading Graham Spicer 2 Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
        <p className="mb-2 text-xl font-bold text-red-500">Failed to load data</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-gray-800/90 p-4 shadow-lg backdrop-blur-md border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-400">{data?.teamName || 'Graham Spicer 2'}</h1>
            <p className="text-xs text-gray-400">{data?.league}</p>
          </div>
          <span className="rounded-full bg-blue-900/80 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-700">
            {data?.season || '2026-2027'}
          </span>
        </div>
      </header>

      {/* Main Content Area based on Active Tab */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">

        {/* TAB 1: NEXT MATCH */}
        {activeTab === 'next' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <span>⚡ Next Match</span>
            </h2>
            <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-800/80 p-5 shadow-lg border border-gray-700/60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800">
                    HOME GAME
                  </span>
                  <h3 className="text-xl font-bold mt-2">{data?.nextFixture?.opponent || 'Graham Spicer 1'}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-400">{data?.nextFixture?.date || 'Thu 24 Sep'}</p>
                  <p className="text-xs text-gray-400">{data?.nextFixture?.time || '19:30'}</p>
                </div>
              </div>
              <div className="border-t border-gray-700/60 pt-3 text-xs text-gray-400 flex items-center gap-1">
                <span>📍 Venue: {data?.nextFixture?.venue || 'Graham Spicer Table Tennis Club'}</span>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: FIXTURES */}
        {activeTab === 'fixtures' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <span>📅 Upcoming Fixtures</span>
            </h2>
            <div className="space-y-3">
              {data?.fixtures?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-gray-800 p-4 shadow-md border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-blue-900/40 p-2 min-w-[50px] border border-blue-800/50">
                      <span className="text-xs font-bold text-blue-400">{item.month}</span>
                      <span className="text-lg font-bold text-white">{item.date}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.homeTeam} vs {item.awayTeam}</p>
                      <p className="text-xs text-gray-400">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-yellow-400 bg-yellow-950/50 px-2 py-1 rounded border border-yellow-800/40">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: STANDINGS */}
        {activeTab === 'standings' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <span>🏆 Division 1 Standings</span>
            </h2>
            <div className="overflow-hidden rounded-xl bg-gray-800 shadow-md border border-gray-700/50">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-700/60 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Team</th>
                    <th className="p-3 text-center">P</th>
                    <th className="p-3 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {data?.standings?.map((item: any) => (
                    <tr
                      key={item.team}
                      className={item.isMyTeam ? 'bg-blue-900/40 font-bold text-blue-300' : 'hover:bg-gray-700/30'}
                    >
                      <td className="p-3">{item.pos}</td>
                      <td className="p-3">{item.team}</td>
                      <td className="p-3 text-center">{item.p}</td>
                      <td className="p-3 text-center font-bold text-yellow-400">{item.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: ROSTER */}
        {activeTab === 'roster' && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <span>👥 Squad Roster</span>
            </h2>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {data?.players?.map((player: any) => (
                <div key={player.number} className="flex items-center space-x-3 rounded-xl bg-gray-800 p-3 shadow-md border border-gray-700/50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {player.number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{player.name}</p>
                    <p className="text-[10px] text-gray-400">{player.subName}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Bottom App Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-gray-800/95 border-t border-gray-700 backdrop-blur-lg">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">

          <button
            onClick={() => setActiveTab('next')}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              activeTab === 'next' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-lg mb-0.5">⚡</span>
            <span>Next</span>
          </button>

          <button
            onClick={() => setActiveTab('fixtures')}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              activeTab === 'fixtures' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-lg mb-0.5">📅</span>
            <span>Fixtures</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              activeTab === 'standings' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-lg mb-0.5">🏆</span>
            <span>Standings</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              activeTab === 'roster' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-lg mb-0.5">👥</span>
            <span>Roster</span>
          </button>

        </div>
      </nav>
    </main>
  );
}
