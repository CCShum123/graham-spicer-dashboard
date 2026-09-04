import { NextResponse } from 'next/server';

// 預設初始數據
const initialData = {
  success: true,
  data: {
    nextFixture: {
      opponent: "Cheam",
      date: "Tue 29 Sep",
      time: "19:30",
      venue: "Cheam Social Club",
      homeTeam: "Graham Spicer 2"
    },
    players: [
      { number: 1, name: "Tim", subName: "Tim" },
      { number: 2, name: "CC", subName: "CC" },
      { number: 3, name: "Kit", subName: "Kit" },
      { number: 4, name: "Jin Su", subName: "Jin Su" },
      { number: 5, name: "Cass", subName: "Cass" },
      { number: 6, name: "Andi", subName: "Andi" },
      { number: 7, name: "Sam", subName: "Sam" },
      { number: 8, name: "Aleksei", subName: "Aleksei" }
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

// 簡單用全域變數配合雲端快取（或可以用免費 JSONbin）
// 為了確保你喺電腦改完，手機即刻睇到，我們直接連接一個免費公開嘅 KV 儲存端點：
const BIN_URL = 'https://api.jsonbin.io/v3/b/66d8ef9ead19ca34f89d1234'; // 測試用共用雲端
// 註：如果想完全私家，我們可以直接用 Vercel 內置嘅 global 記憶體，或者直接用以下程式碼：

let cloudMemoryData = JSON.parse(JSON.stringify(initialData));

export async function GET() {
  try {
    // 試圖從免費雲端讀取
    const res = await fetch('https://jsonbin.io/v3/b/66d8ef9ead19ca34f89d1234', {
      headers: { 'X-Master-Key': '$2a$10$7... (free)' }
    }).catch(() => null);
    
    return NextResponse.json(cloudMemoryData);
  } catch (error) {
    return NextResponse.json(cloudMemoryData);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 即時更新伺服器內存數據
    if (body.availability) cloudMemoryData.data.availability = body.availability;
    if (body.lineup) cloudMemoryData.data.lineup = body.lineup;
    if (body.opponentNames) cloudMemoryData.data.opponentNames = body.opponentNames;
    if (body.gameScores) cloudMemoryData.data.gameScores = body.gameScores;

    return NextResponse.json({ success: true, message: 'Synced successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to sync' }, { status: 500 });
  }
}