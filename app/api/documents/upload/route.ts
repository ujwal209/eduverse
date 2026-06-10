import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Document from "@/models/Document";

function chunkText(text: string, size = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.substring(index, index + size));
    index += size - overlap;
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId, name, content } = await req.json();
    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 });
    }

    await dbConnect();
    let dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let chat;
    let targetChatId = chatId;
    if (!chatId) {
      chat = await Chat.create({ 
        userId: dbUser._id, 
        title: `Study: ${name.substring(0, 20)}` 
      });
      targetChatId = chat._id;
    } else {
      chat = await Chat.findOne({ _id: chatId, userId: dbUser._id });
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
    }

    const chunks = chunkText(content);

    const doc = await Document.create({
      chatId: targetChatId,
      name,
      content,
      chunks
    });

    return NextResponse.json({
      document: {
        _id: doc._id,
        name: doc.name,
      },
      chatId: targetChatId
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
