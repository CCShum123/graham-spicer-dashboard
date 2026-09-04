import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 驗證 Vercel Cron Header (安全機制)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const targetUrl = 'https://thamesvalley.ttleagues.com/league/4619/division/13125/table';

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TTLeagues. Status: ${response.status}`);
    }

    const html = await response.text();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Standings fetched successfully from TTLeagues.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}