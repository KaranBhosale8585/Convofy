import PusherServer from "pusher";
import Pusher from "pusher-js";
import { env } from "./env";

export const pusherServer = new PusherServer({
  appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

export async function safeTrigger(channel: string, event: string, data: any) {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error(`Pusher trigger failed on channel ${channel}:`, error);
    // We don't throw here to prevent Pusher failures from breaking DB operations
  }
}
