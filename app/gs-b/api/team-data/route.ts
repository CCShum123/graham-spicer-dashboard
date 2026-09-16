export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. 先從 GitHub 拎現有檔案嘅內容同埋 sha (GitHub 每次更新檔案必須提供上一個版本嘅 sha)
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

    // 2. 安全地合併資料（已加入 fixtureMatchRecords 以支援每場獨立嘅 lineup 同 match card 紀錄）
    if (body) {
      if (body.availabilityMap) existingContent.availabilityMap = body.availabilityMap;
      if (body.fixtureMatchRecords) existingContent.fixtureMatchRecords = body.fixtureMatchRecords; // <--- 呢度係新加入嘅關鍵！
      if (body.lineup) existingContent.lineup = body.lineup;
      if (body.gameScores) existingContent.gameScores = body.gameScores;
      if (body.opponentNames) existingContent.opponentNames = body.opponentNames;
      if (body.doublesCodesH !== undefined) existingContent.doublesCodesH = body.doublesCodesH;
      if (body.doublesCodesA !== undefined) existingContent.doublesCodesA = body.doublesCodesA;
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
        message: 'Auto-update team data via app',
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