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
