import "server-only";
import { z } from "zod";
import { parsePublicEnv } from "./public";

const serverSecretSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().trim().min(1),
});

export type ServerEnv = ReturnType<typeof parseServerEnv>;

export function parseServerEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
) {
  return { ...parsePublicEnv(source), ...serverSecretSchema.parse(source) };
}
