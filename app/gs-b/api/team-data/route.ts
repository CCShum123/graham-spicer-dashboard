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
    if (!getRes.ok) {
      throw new Error('Failed to fetch from npoint during POST');
    }
    let currentData = await getRes.json();

    // 2. 合併更新
    if (body.availabilityMap !== undefined) currentData.availabilityMap = body.availabilityMap;
    if (body.lineup !== undefined) currentData.lineup = body.lineup;
    if (body.gameScores !== undefined) currentData.gameScores = body.gameScores;
    if (body.opponentNames !== undefined) currentData.opponentNames = body.opponentNames;

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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}