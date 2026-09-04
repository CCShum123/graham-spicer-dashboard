import { NextResponse } from 'next/server';

const initialData = {
  success: true,
  data: {
    // 賽程列表：你可以在這裡隨時加減所有比賽
    fixtures: [
      { type: "AWAY", homeTeam: "Cheam", awayTeam: "Graham Spicer 2", date: "Tue 29 Sep", time: "19:30", venue: "Cheam Social Club" },
      { type: "HOME", homeTeam: "Graham Spicer 2", awayTeam: "Teddington 1", date: "Tue 6 Oct", time: "19:30", venue: "Graham Spicer" },
      { type: "AWAY", homeTeam: "Malden 1", awayTeam: "Graham Spicer 2", date: "Tue 13 Oct", time: "19:30", venue: "Malden Centre" }
    ],
    players: [
      { number: 1, name: "Tim" },
      { number: 2, name: "CC" },
      { number: 3, name: "Kit" },
      { number: 4, name: "Jin Su" },
      { number: 5, name: "Cass" },
      { number: 6, name: "Andi" },
      { number: 7, name: "Sam" },
      { number: 8, name: "Aleksei" }
    ],
    availability: {
      going: [],
      cantGo: [],
      tbc: ["Tim", "CC", "Kit", "Jin Su", "Cass", "Andi", "Sam", "Aleksei"]
    },
    lineup: ['', '', ''],
    opponentNames: ['', '', ''],
    gameScores: {}
  }
};

let cloudMemoryData = JSON.parse(JSON.stringify(initialData));

export async function GET() {
  try {
    // 自動魔法：直接將 fixtures 的第一場比賽當作 nextFixture 提取出來！
    if (cloudMemoryData.data.fixtures && cloudMemoryData.data.fixtures.length > 0) {
      const nextOne = cloudMemoryData.data.fixtures[0];
      // 判斷對手是誰（如果 homeTeam 是我們，對手就是 awayTeam；反之亦然）
      const isUsHome = nextOne.homeTeam.toLowerCase().includes('graham spicer') || nextOne.homeTeam.toLowerCase().includes('gs');
      
      cloudMemoryData.data.nextFixture = {
        opponent: isUsHome ? nextOne.awayTeam : nextOne.homeTeam,
        date: nextOne.date,
        time: nextOne.time || "19:30",
        venue: nextOne.venue,
        homeTeam: nextOne.homeTeam
      };
    }

    return NextResponse.json(cloudMemoryData);
  } catch (error) {
    return NextResponse.json(cloudMemoryData);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.availability) cloudMemoryData.data.availability = body.availability;
    if (body.lineup) cloudMemoryData.data.lineup = body.lineup;
    if (body.opponentNames) cloudMemoryData.data.opponentNames = body.opponentNames;
    if (body.gameScores) cloudMemoryData.data.gameScores = body.gameScores;

    return NextResponse.json({ success: true, message: 'Synced successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to sync' }, { status: 500 });
  }
}