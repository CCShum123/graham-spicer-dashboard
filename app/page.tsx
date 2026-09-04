'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/team-data');
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        } else {
          throw new Error('Invalid API response structure');
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
        <p className="animate-pulse text-lg">Loading team dashboard...</p>
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
    <main className="min-h-screen bg-gray-900 p-4 text-white pb-20">
      {/* Header */}
      <header className="mb-6 rounded-lg bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold text-blue-400">{data?.teamName || 'Graham Spicer 2'}</h1>
        <p className="text-sm text-gray-400">{data?.league}</p>
        <span className="mt-2 inline-block rounded bg-blue-900 px-2 py-1 text-xs text-blue-200">
          Season {data?.season}
        </span>
      </header>

      {/* Next Fixture */}
      <section className="mb-6 rounded-lg bg-gray-800 p-4 shadow-md">
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Next Fixture</h2>
        <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
          <div>
            <p className="font-bold text-lg">{data?.nextFixture?.opponent || 'TBD'}</p>
            <p className="text-sm text-gray-400">{data?.nextFixture?.venue || 'TBD'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-yellow-400">{data?.nextFixture?.date || '-'}</p>
            <p className="text-xs text-gray-400">{data?.nextFixture?.time || '-'}</p>
          </div>
        </div>
      </section>

      {/* Standings */}
      <section className="mb-6 rounded-lg bg-gray-800 p-4 shadow-md">
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Division Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Team</th>
                <th className="p-2 text-center">P</th>
                <th className="p-2 text-center">PTS</th>
              </tr>
            </thead>
            <tbody>
              {data?.standings?.map((item: any) => (
                <tr
                  key={item.team}
                  className={`border-b border-gray-700 ${
                    item.isMyTeam ? 'bg-blue-900/40 font-bold text-blue-300' : ''
                  }`}
                >
                  <td className="p-2">{item.pos}</td>
                  <td className="p-2">{item.team}</td>
                  <td className="p-2 text-center">{item.p}</td>
                  <td className="p-2 text-center">{item.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Roster */}
      <section className="rounded-lg bg-gray-800 p-4 shadow-md">
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Squad Roster</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data?.players?.map((player: any) => (
            <div key={player.number} className="flex items-center space-x-3 bg-gray-700/40 p-2 rounded-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                {player.number}
              </span>
              <div>
                <p className="text-sm font-medium">{player.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}