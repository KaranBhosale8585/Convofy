import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { v4 as uuidv4 } from "uuid";

async function saveMessageToDb(
  senderId: string,
  receiverId: string,
  content: string
) {
  const savedMessage = {
    id: uuidv4(),
    content,
    sender: { id: senderId },
    receiverId,
    createdAt: new Date().toISOString(),
  };
  return savedMessage;
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, content } = await req.json();

    if (!receiverId || !senderId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      );
    }

    const savedMessage = await saveMessageToDb(senderId, receiverId, content);

    await pusherServer.trigger(`private-chat-${receiverId}`, "new-message", {
      message: savedMessage,
    });

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
