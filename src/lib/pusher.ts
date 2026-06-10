import PusherServer from "pusher";
import Pusher from "pusher-js";
import { env } from "./env";

// Helper to check if Pusher keys are available
const hasPusherServerKeys = !!(env.NEXT_PUBLIC_PUSHER_APP_ID && env.NEXT_PUBLIC_PUSHER_KEY && env.PUSHER_SECRET && env.NEXT_PUBLIC_PUSHER_CLUSTER);
const hasPusherClientKeys = !!(env.NEXT_PUBLIC_PUSHER_KEY && env.NEXT_PUBLIC_PUSHER_CLUSTER);

export const pusherServer = hasPusherServerKeys 
  ? new PusherServer({
      appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
      key: env.NEXT_PUBLIC_PUSHER_KEY,
      secret: env.PUSHER_SECRET,
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

export const pusherClient = hasPusherClientKeys
  ? new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
      authTransport: "ajax",
    })
  : null;

export async function safeTrigger(channel: string | string[], event: string, data: any) {
  if (!pusherServer) {
    console.warn(`Pusher server not initialized. Skipping trigger on channel ${channel}.`);
    return;
  }

  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error(`Pusher trigger failed on channel ${channel}:`, error);
  }
}
