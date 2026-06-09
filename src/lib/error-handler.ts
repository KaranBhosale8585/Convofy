import { Prisma } from "@/generated/prisma";

export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function handleActionError(error: unknown, defaultMessage: string): ActionResponse {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    switch (error.code) {
      case "P2002":
        return { success: false, error: "A unique constraint violation occurred." };
      case "P2025":
        return { success: false, error: "Record not found." };
      default:
        return { success: false, error: `Database error: ${error.code}` };
    }
  }

  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: defaultMessage };
}
