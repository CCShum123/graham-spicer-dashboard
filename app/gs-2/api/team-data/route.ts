import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // 假設你同 Gs-b 用緊同一個 Repo
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = 'data/gs2-team.json'; // 指向 GS-2 專屬嘅 json 檔案

const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

export async function GET() {
  try {
    const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`GitHub fetch failed with status ${res.status}`);
    }

    const fileData = await res.json();
    const buffer = Buffer.from(fileData.content, 'base64');
    const data = JSON.parse(buffer.toString('utf-8'));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('GitHub GET Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 先從 GitHub 拎現有檔案嘅內容同埋 sha
    const getRes = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    });

    if (!getRes.ok) {
      throw new Error(`Failed to fetch current file from GitHub: ${getRes.status}`);
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;
    
    const existingContent = JSON.parse(
      Buffer.from(fileData.content, 'base64').toString('utf-8')
    );

    // 2. 安全地合併資料
    if (body) {
      if (body.availabilityMap) existingContent.availabilityMap = body.availabilityMap;
      if (body.lineup) existingContent.lineup = body.lineup;
      if (body.gameScores) existingContent.gameScores = body.gameScores;
      if (body.opponentNames) existingContent.opponentNames = body.opponentNames;
    }

    // 3. 用 PUT 請求叫 GitHub API 自動幫你 commit 新檔案
    const updatedContentBase64 = Buffer.from(
      JSON.stringify(existingContent, null, 2)
    ).toString('base64');

    const updateRes = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Auto-update GS-2 team data via app',
        content: updatedContentBase64,
        sha: sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`GitHub update failed: ${errText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('GitHub POST Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}