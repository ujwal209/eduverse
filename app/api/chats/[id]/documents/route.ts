import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Document from "@/models/Document";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const chat = await Chat.findOne({ _id: id, userId: dbUser._id });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const documents = await Document.find({ chatId: chat._id }, { content: 0, chunks: 0 }).sort({ createdAt: -1 });
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Fetch documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
