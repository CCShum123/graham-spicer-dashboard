import { NextResponse } from 'next/server';

let gsBData = {
  season: '2026/27 Sutton',
  nextFixture: {
    id: 'b-1',
    day: 'Thu',
    date: '17',
    month: 'SEP',
    year: '2026',
    time: '19:30',
    type: 'AWAY',
    homeTeam: 'Eldon B',
    awayTeam: 'Graham Spicers B',
    venue: 'Eldon Phab'
  },
  fixtures: [
    { id: 'b-1', day: 'Thu', date: '17', month: 'SEP', year: '2026', time: '19:30', type: 'AWAY', homeTeam: 'Eldon B', awayTeam: 'Graham Spicers B', venue: 'Eldon Phab' },
    { id: 'b-2', day: 'Mon', date: '21', month: 'SEP', year: '2026', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Crusaders B', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-3', day: 'Thu', date: '01', month: 'OCT', year: '2026', time: '19:30', type: 'AWAY', homeTeam: 'Crusaders A', awayTeam: 'Graham Spicers B', venue: 'Crusader Hall' },
    { id: 'b-4', day: 'Mon', date: '05', month: 'OCT', year: '2026', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Rosehill A', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-5', day: 'Wed', date: '14', month: 'OCT', year: '2026', time: '19:30', type: 'AWAY', homeTeam: 'Graham Spicers A', awayTeam: 'Graham Spicers B', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-6', day: 'Mon', date: '02', month: 'NOV', year: '2026', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Ballards A', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-7', day: 'Mon', date: '09', month: 'NOV', year: '2026', time: '19:30', type: 'AWAY', homeTeam: 'Kingsway A', awayTeam: 'Graham Spicers B', venue: 'TBC' },
    { id: 'b-8', day: 'Mon', date: '23', month: 'NOV', year: '2026', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Rosehill B', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-9', day: 'Thu', date: '10', month: 'DEC', year: '2026', time: '19:30', type: 'AWAY', homeTeam: 'Eldon A', awayTeam: 'Graham Spicers B', venue: 'Eldon Phab' },
    { id: 'b-10', day: 'Mon', date: '14', month: 'DEC', year: '2026', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Eldon B', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-11', day: 'Thu', date: '07', month: 'JAN', year: '2027', time: '19:30', type: 'AWAY', homeTeam: 'Crusaders B', awayTeam: 'Graham Spicers B', venue: 'Crusader Hall' },
    { id: 'b-12', day: 'Mon', date: '18', month: 'JAN', year: '2027', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Crusaders A', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-13', day: 'Tue', date: '26', month: 'JAN', year: '2027', time: '19:30', type: 'AWAY', homeTeam: 'Rosehill A', awayTeam: 'Graham Spicers B', venue: 'The Rosehill Pavilion' },
    { id: 'b-14', day: 'Mon', date: '08', month: 'FEB', year: '2027', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Graham Spicers A', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-15', day: 'Mon', date: '22', month: 'FEB', year: '2027', time: '19:30', type: 'AWAY', homeTeam: 'Ballards A', awayTeam: 'Graham Spicers B', venue: 'Sir Philip Game Centre' },
    { id: 'b-16', day: 'Mon', date: '01', month: 'MAR', year: '2027', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Kingsway A', venue: 'Graham Spicer Table Tennis Club' },
    { id: 'b-17', day: 'Wed', date: '17', month: 'MAR', year: '2027', time: '19:30', type: 'AWAY', homeTeam: 'Rosehill B', awayTeam: 'Graham Spicers B', venue: 'The Rosehill Pavilion' },
    { id: 'b-18', day: 'Mon', date: '22', month: 'MAR', year: '2027', time: '19:30', type: 'HOME', homeTeam: 'Graham Spicers B', awayTeam: 'Eldon A', venue: 'Graham Spicer Table Tennis Club' }
  ],
  players: [
    { number: 1, name: 'Chi Cheung Shum', subName: 'CC' },
    { number: 2, name: 'Daniel Heo', subName: 'Daniel' },
    { number: 3, name: 'Tsz-Kit Chan', subName: 'Kit' },
    { number: 4, name: 'James Ng Hing Cheung', subName: 'James' },
    { number: 5, name: 'Rohit Kumar', subName: 'Rohit' },
    { number: 6, name: 'Peter Lyall', subName: 'Peter' },
    { number: 7, name: 'AJAY SHAH', subName: 'Ajay' },
    { number: 8, name: 'Benjamin Richmond', subName: 'Benjamin' },
    { number: 9, name: 'Kostiantyn Motovilin', subName: 'Kostiantyn' },
    { number: 10, name: 'Hojeong Yoon', subName: 'Hojeong' },
    { number: 11, name: 'Brandon Cann', subName: 'Brandon' }
  ],
  availabilityMap: {},
  lineup: ['', '', ''],
  opponentNames: ['', '', ''],
  gameScores: {}
};

export async function GET() {
  return NextResponse.json({ success: true, data: gsBData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.availabilityMap) gsBData.availabilityMap = body.availabilityMap;
    if (body.lineup) gsBData.lineup = body.lineup;
    if (body.gameScores) gsBData.gameScores = body.gameScores;
    if (body.opponentNames) gsBData.opponentNames = body.opponentNames;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}