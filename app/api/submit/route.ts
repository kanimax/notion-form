// app/api/submit/route.ts
import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

export async function POST(req: Request) {
  console.log("✅ API route called!"); // フォーム送信時に呼び出されたか確認
  console.log("🔑 NOTION_TOKEN:", process.env.NOTION_TOKEN);
  console.log("📄 DATABASE_ID:", process.env.NOTION_DATABASE_ID);
  

  try {
    const body = await req.json();
    const { name, email, message } = body;

    console.log("📨 Received data:", { name, email, message }); // 受け取ったデータを表示

    if (!name || !email || !message) {
      console.warn("⚠️ Missing required fields");
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        Email: {
          email: email,
        },
        Message: {
          rich_text: [{ text: { content: message } }],
        },
      },
    });

    console.log("✅ Notion submission successful!");
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    console.error("❌ Notion API error:", error);
    return NextResponse.json(
      { message: 'Failed to submit to Notion', error: error },
      { status: 500 }
    );
  }
}

// =============================
// テスト用GETエンドポイント（後で削除してください）
// =============================
export async function GET() {
  // 環境変数の値を取得
  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  // 結果格納用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let notionResult: any = null;
  let notionError = null;
  let databaseInfo = null;
  let integrationInfo = null;

  // Notion APIでデータベースの詳細情報を取得
  if (notionToken && databaseId) {
    try {
      const notion = new Client({ auth: notionToken });
      
      // データベースの詳細情報を取得
      notionResult = await notion.databases.retrieve({ database_id: databaseId });
      
      // データベースの基本情報を抽出
      databaseInfo = {
        id: notionResult.id,
        title: notionResult.title?.[0]?.plain_text || 'No title',
        properties: Object.keys(notionResult.properties || {}).map((key: string) => ({
          name: key,
          type: notionResult.properties[key]?.type || 'unknown'
        }))
      };

      // インテグレーション情報を取得（利用可能な場合）
      try {
        const user = await notion.users.me({});
        integrationInfo = {
          name: user.name,
          type: user.type,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bot: (user as any).bot || false
        };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        integrationInfo = { error: e.message || 'Failed to get integration info' };
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      notionError = e.message || String(e);
    }
  }

  return NextResponse.json({
    NOTION_TOKEN: notionToken ? `${notionToken.substring(0, 10)}...` : null,
    NOTION_DATABASE_ID: databaseId,
    databaseInfo,
    integrationInfo,
    notionError,
  });
}
