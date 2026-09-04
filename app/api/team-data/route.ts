import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 原始賽程表資料（直接對應你張 Excel 填寫主家同客家）
    const rawFixtures = [
      { homeTeam: 'Cheam', awayTeam: 'Graham Spicer 2', month: 'SEP', date: '29', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 3', month: 'OCT', date: '8', time: '19:30' },
      { homeTeam: 'Graham Spicer 5', awayTeam: 'Graham Spicer 2', month: 'OCT', date: '13', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Malden 1', month: 'OCT', date: '29', time: '19:30' },
      { homeTeam: 'Graham Spicer 4', awayTeam: 'Graham Spicer 2', month: 'NOV', date: '4', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Teddington 1', month: 'NOV', date: '19', time: '19:30' },
      { homeTeam: 'Graham Spicer 1', awayTeam: 'Graham Spicer 2', month: 'DEC', date: '8', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Cheam', month: 'JAN', date: '14', time: '19:30' },
      { homeTeam: 'Graham Spicer 3', awayTeam: 'Graham Spicer 2', month: 'JAN', date: '28', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 5', month: 'FEB', date: '4', time: '19:30' },
      { homeTeam: 'Malden 1', awayTeam: 'Graham Spicer 2', month: 'FEB', date: '17', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 4', month: 'FEB', date: '25', time: '19:30' },
      { homeTeam: 'Teddington 1', awayTeam: 'Graham Spicer 2', month: 'MAR', date: '9', time: '19:30' },
      { homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 1', month: 'MAR', date: '25', time: '19:30' },
    ];

    // 自動判斷：如果 homeTeam 係 'Graham Spicer 2' 就出 'HOME'，否則出 'AWAY'
    const fixtures = rawFixtures.map(f => ({
      ...f,
      status: 'UPCOMING',
      type: f.homeTeam === 'Graham Spicer 2' ? 'HOME' : 'AWAY'
    }));

    const teamData = {
      teamName: 'Graham Spicer 2',
      league: 'Thames Valley Table Tennis League - Division 1',
      season: '2026-2027',
      nextFixture: {
        opponent: 'Cheam',
        date: 'Tue 29 Sep',
        time: '19:30',
        venue: 'Cheam Social Club',
      },
      players: [
        { number: 1, name: 'Timothy Denby', subName: 'Tim' },
        { number: 2, name: 'Aleksei Dhillon-Francis', subName: 'Aleksei' },
        { number: 3, name: 'Chi Cheung Shum', subName: 'CC' },
        { number: 4, name: 'Tsz-Kit Chan', subName: 'Kit' },
        { number: 5, name: 'Jin Su Choi', subName: 'Jin Su' },
        { number: 6, name: 'Cassius Collett', subName: 'Cass' },
        { number: 7, name: 'Andi Skevis', subName: 'Andi' },
        { number: 8, name: 'Sam Choi', subName: 'Sam' },
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
      fixtures,
    };

    return NextResponse.json({ success: true, data: teamData });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}