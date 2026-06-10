import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const chats = await Chat.find({ userId: dbUser._id }).sort({ updatedAt: -1 }).limit(50);
    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error("Fetch chats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
