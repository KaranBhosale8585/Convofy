import { NextRequest, NextResponse } from "next/server";
import { safeTrigger } from "@/lib/pusher";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { receiverId, content, senderId } = await req.json();

    if (!receiverId || !content || !senderId) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    await safeTrigger(`user-${receiverId}`, "new-message", {
      message,
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error sending message via API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
