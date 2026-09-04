import { NextResponse } from 'next/server';

const initialData = {
  success: true,
  data: {
    teamName: 'Graham Spicer 2',
    league: 'Thames Valley Table Tennis League - Division 1',
    season: '2026-2027',
    nextFixture: {
      opponent: '',
      date: '',
      time: '19:30',
      venue: '',
      homeTeam: ''
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
    fixtures: [],
    availabilityMap: {}, // 支援儲存每一場比賽獨立嘅 availability
    lineup: ['', '', ''],
    opponentNames: ['', '', ''],
    gameScores: {}
  }
};

let cloudMemoryData = JSON.parse(JSON.stringify(initialData));

export async function GET() {
  try {
    const today = new Date('2026-09-04');

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

    const fixtures = rawFixtures.map((f, idx) => {
      const fixtureDate = new Date(f.dateStr);
      const isPast = fixtureDate < today;
      const isHome = f.homeTeam.toLowerCase().includes('graham spicer');
      return {
        id: `fix-${idx}`,
        ...f,
        status: isPast ? 'COMPLETED' : 'UPCOMING',
        type: isHome ? 'HOME' : 'AWAY',
        venue: isHome ? 'Graham Spicer Table Tennis Club' : 'Away Venue'
      };
    });

    const upcomingFixture = fixtures.find(f => f.status === 'UPCOMING') || fixtures[0];
    const opponentName = upcomingFixture.homeTeam === 'Graham Spicer 2' ? upcomingFixture.awayTeam : upcomingFixture.homeTeam;

    cloudMemoryData.data.fixtures = fixtures;
    cloudMemoryData.data.nextFixture = {
      id: upcomingFixture.id,
      opponent: opponentName,
      date: `${upcomingFixture.day} ${upcomingFixture.date} ${upcomingFixture.month}`,
      time: upcomingFixture.time,
      venue: upcomingFixture.venue,
      homeTeam: upcomingFixture.homeTeam
    };

    return NextResponse.json(cloudMemoryData);
  } catch (error) {
    return NextResponse.json(cloudMemoryData);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.availabilityMap) cloudMemoryData.data.availabilityMap = body.availabilityMap;
    if (body.lineup) cloudMemoryData.data.lineup = body.lineup;
    if (body.opponentNames) cloudMemoryData.data.opponentNames = body.opponentNames;
    if (body.gameScores) cloudMemoryData.data.gameScores = body.gameScores;

    return NextResponse.json({ success: true, message: 'Synced successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to sync' }, { status: 500 });
  }
}