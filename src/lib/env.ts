import { z } from "zod";

const envSchema = z.object({
  DB_URL: z.string().url().optional().or(z.string().url()),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).optional().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1).optional().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1).optional().default("/"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1).optional().default("/"),
  PUSHER_SECRET: z.string().min(1),
  NEXT_PUBLIC_PUSHER_APP_ID: z.string().min(1),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
  UPLOADTHING_SECRET: z.string().min(1).optional(),
  UPLOADTHING_APP_ID: z.string().min(1).optional(),
});

const _env = envSchema.safeParse({
  DB_URL: process.env.DB_URL || process.env.DATABASE_URL,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  PUSHER_SECRET: process.env.PUSHER_SECRET,
  NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
});

if (!_env.success) {
  console.error("⚠️ Environment variable validation failed:", _env.error.format());
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables in production");
  }
}

export const env = _env.data || ({} as z.infer<typeof envSchema>);
