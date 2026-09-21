const forbiddenClientImports = [
  "@/lib/env/server",
  "@/lib/supabase/admin",
] as const;
const clientDirectivePattern =
  /^\s*(?:(?:\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)\s*)*["']use client["']\s*;?/;

export function findForbiddenClientImports(source: string): string[] {
  if (!clientDirectivePattern.test(source)) {
    return [];
  }

  return forbiddenClientImports.filter((modulePath) =>
    new RegExp(`(?:from\\s*|import\\s*)["']${modulePath}["']`).test(source),
  );
}
