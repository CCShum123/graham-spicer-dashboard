import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 假設今日係 2026-09-04，你可以用呢個日期嚟做自動對比基準
    // 格式：YYYY-MM-DD
    const today = new Date('2026-09-04');

    // 原始賽程表資料（加入咗日期格式 YYYY-MM-DD 方便系統自動比對，同埋 day 顯示星期幾）
    const rawFixtures = [
      { dateStr: '2026-09-29', homeTeam: 'Cheam', awayTeam: 'Graham Spicer 2', month: 'SEP', date: '29', day: 'Tue', time: '19:30' },
      { dateStr: '2026-10-08', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 3', month: 'OCT', date: '8', day: 'Thu', time: '19:30' },
      { dateStr: '2026-10-13', homeTeam: 'Graham Spicer 5', awayTeam: 'Graham Spicer 2', month: 'OCT', date: '13', day: 'Tue', time: '19:30' },
      { dateStr: '2026-10-29', homeTeam: 'Graham Spicer 2', awayTeam: 'Malden 1', month: 'OCT', date: '29', day: 'Thu', time: '19:30' },
      { dateStr: '2026-11-04', homeTeam: 'Graham Spicer 4', awayTeam: 'Graham Spicer 2', month: 'NOV', date: '4', day: 'Wed', time: '19:30' },
      { dateStr: '2026-11-19', homeTeam: 'Graham Spicer 2', awayTeam: 'Teddington 1', month: 'NOV', date: '19', day: 'Thu', time: '19:30' },
      { dateStr: '2026-12-08', homeTeam: 'Graham Spicer 1', awayTeam: 'Graham Spicer 2', month: 'DEC', date: '8', day: 'Tue', time: '19:30' },
      { dateStr: '2027-01-14', homeTeam: 'Graham Spicer 2', awayTeam: 'Cheam', month: 'JAN', date: '14', day: 'Thu', time: '19:30' },
      { dateStr: '2027-01-28', homeTeam: 'Graham Spicer 3', awayTeam: 'Graham Spicer 2', month: 'JAN', date: '28', day: 'Thu', time: '19:30' },
      { dateStr: '2027-02-04', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 5', month: 'FEB', date: '4', day: 'Thu', time: '19:30' },
      { dateStr: '2027-02-17', homeTeam: 'Malden 1', awayTeam: 'Graham Spicer 2', month: 'FEB', date: '17', day: 'Wed', time: '19:30' },
      { dateStr: '2027-02-25', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 4', month: 'FEB', date: '25', day: 'Thu', time: '19:30' },
      { dateStr: '2027-03-09', homeTeam: 'Teddington 1', awayTeam: 'Graham Spicer 2', month: 'MAR', date: '9', day: 'Tue', time: '19:30' },
      { dateStr: '2027-03-25', homeTeam: 'Graham Spicer 2', awayTeam: 'Graham Spicer 1', month: 'MAR', date: '25', day: 'Thu', time: '19:30' },
    ];

    // 自動計算 status (UPCOMING / COMPLETED) 同埋主客場 (HOME / AWAY)
    const fixtures = rawFixtures.map(f => {
      const fixtureDate = new Date(f.dateStr);
      const isPast = fixtureDate < today;
      return {
        ...f,
        status: isPast ? 'COMPLETED' : 'UPCOMING',
        type: f.homeTeam === 'Graham Spicer 2' ? 'HOME' : 'AWAY'
      };
    });

    // 自動搵出下一場未比嘅比賽作為 nextFixture
    const upcomingFixture = fixtures.find(f => f.status === 'UPCOMING') || fixtures[0];
    const opponentName = upcomingFixture.homeTeam === 'Graham Spicer 2' ? upcomingFixture.awayTeam : upcomingFixture.homeTeam;

    const teamData = {
      teamName: 'Graham Spicer 2',
      league: 'Thames Valley Table Tennis League - Division 1',
      season: '2026-2027', // 只保留 2026-2027
      nextFixture: {
        opponent: opponentName,
        date: `${upcomingFixture.day} ${upcomingFixture.date} ${upcomingFixture.month}`,
        time: upcomingFixture.time,
        venue: upcomingFixture.homeTeam === 'Graham Spicer 2' ? 'Graham Spicer Table Tennis Club' : 'Away Venue',
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