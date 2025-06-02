// pages/api/submit.ts
import { Client } from "@notionhq/client";
import type { NextApiRequest, NextApiResponse } from "next";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: name },
            },
          ],
        },
        Email: {
          email,
        },
        Message: {
          rich_text: [
            {
              text: { content: message },
            },
          ],
        },
      },
    });

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Notion API error:", error);
    return res.status(500).json({ message: "Failed to submit to Notion" });
  }
}
