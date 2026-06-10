import { pusherServer } from "@/lib/pusher";
import { getDbUserId } from "@/actions/user.action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.formData();
    const socketId = body.get("socket_id") as string;
    const channelName = body.get("channel_name") as string;

    if (!socketId || !channelName) {
      return new NextResponse("Missing socket_id or channel_name", { status: 400 });
    }

    const presenceData = {
      user_id: userId,
      user_info: { id: userId },
    };

    const authResponse = pusherServer?.authorizeChannel(socketId, channelName, presenceData);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
