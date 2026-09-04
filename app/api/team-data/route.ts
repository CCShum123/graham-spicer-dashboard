import { NextResponse } from 'next/server';

export async function GET() {
  const teamData = {
    teamName: 'Graham Spicer 2',
    league: 'Thames Valley Table Tennis League - Division 1',
    season: '2026-2027',
    nextFixture: {
      opponent: 'Graham Spicer 1',
      date: 'Thu 24 Sep',
      time: '19:30',
      venue: 'Graham Spicer Table Tennis Club',
    },
    players: [
      { number: 1, name: 'Timothy Denby', subName: 'TIMOTHY DENBY' },
      { number: 2, name: 'Aleksei Dhillon-Francis', subName: 'ALEKSEI DHILLON-FRANCIS' },
      { number: 3, name: 'Chi Cheung Shum', subName: 'CHI CHEUNG SHUM' },
      { number: 4, name: 'Tsz-Kit Chan', subName: 'TSZ-KIT CHAN' },
      { number: 5, name: 'Jin Su Choi', subName: 'JIN SU CHOI' },
      { number: 6, name: 'Cassius Collett', subName: 'CASSIUS COLLETT' },
      { number: 7, name: 'Andi Skevis', subName: 'ANDI SKEVIS' },
    ],
    standings: [
      { pos: 1, team: 'Graham Spicer 1', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 2, team: 'Graham Spicer 2', p: 0, w: 0, d: 0, l: 0, pts: 0, isMyTeam: true },
      { pos: 3, team: 'Teddington 1', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 4, team: 'Graham Spicer 5', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 5, team: 'Graham Spicer 3', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 6, team: 'Graham Spicer 4', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 7, team: 'Cheam', p: 0, w: 0, d: 0, l: 0, pts: 0 },
      { pos: 8, team: 'Malden 1', p: 0, w: 0, d: 0, l: 0, pts: 0 },
    ],
    fixtures: [
      { type: 'WEEK 1', status: 'UPCOMING', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 1', month: 'SEP', date: 24, time: '19:30' },
      { type: 'WEEK 2', status: 'UPCOMING', homeTeam: 'Cheam', awayTeam: 'Graham Spicer 2', month: 'SEP', date: 29, time: '19:30' },
      { type: 'WEEK 3', status: 'UPCOMING', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 3', month: 'OCT', date: 8, time: '19:30' },
      { type: 'WEEK 4', status: 'UPCOMING', homeTeam: 'Malden 1', awayTeam: 'Graham Spicer 2', month: 'OCT', date: 13, time: '19:30' },
    ],
  };

  return NextResponse.json({
    success: true,
    data: teamData,
  });
}