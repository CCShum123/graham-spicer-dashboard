import { NextResponse } from 'next/server';

const NPOINT_URL = 'https://api.npoint.io/d25616ebd24559079ee6';

export async function GET() {
  try {
    const res = await fetch(NPOINT_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`npoint fetch failed with status ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('GET Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. 拎現有資料
    const getRes = await fetch(NPOINT_URL, { cache: 'no-store' });
    let currentData: any = {};
    if (getRes.ok) {
      currentData = await getRes.json();
    }

    // 2. 安全地合併資料（如果 body 有傳先覆蓋）
    if (body) {
      if (body.availabilityMap) currentData.availabilityMap = body.availabilityMap;
      if (body.lineup) currentData.lineup = body.lineup;
      if (body.gameScores) currentData.gameScores = body.gameScores;
      if (body.opponentNames) currentData.opponentNames = body.opponentNames;
    }

    // 3. 寫返落 npoint
    const updateRes = await fetch(NPOINT_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentData),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`npoint update failed: ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST Error:', err.message);
    // 回傳詳細嘅 error message 畀前端 Console 睇
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}