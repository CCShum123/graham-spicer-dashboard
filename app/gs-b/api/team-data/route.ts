import { NextResponse } from 'next/server';

// 你的 npoint 雲端 JSON API 網址
const NPOINT_URL = 'https://api.npoint.io/d25616ebd24559079ee6';

export async function GET() {
  try {
    const res = await fetch(NPOINT_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch from npoint');
    }
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error reading from npoint:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. 先從 npoint 讀取現有最新資料
    const getRes = await fetch(NPOINT_URL, { cache: 'no-store' });
    if (!getRes.ok) {
      throw new Error('Failed to fetch current data from npoint');
    }
    let currentData: any = await getRes.json();

    // 2. 更新對應傳入嘅欄位
    if (body.availabilityMap) currentData.availabilityMap = body.availabilityMap;
    if (body.lineup) currentData.lineup = body.lineup;
    if (body.gameScores) currentData.gameScores = body.gameScores;
    if (body.opponentNames) currentData.opponentNames = body.opponentNames;

    // 3. 將更新後嘅完整資料寫返落 npoint (用 PUT 方法覆蓋)
    const updateRes = await fetch(NPOINT_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentData),
    });

    if (!updateRes.ok) {
      throw new Error('Failed to update npoint');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating npoint:', err);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}