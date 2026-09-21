const forbiddenClientImports = [
  "@/lib/env/server",
  "@/lib/supabase/admin",
] as const;

export function findForbiddenClientImports(source: string): string[] {
  if (!source.includes('"use client"')) {
    return [];
  }

  return forbiddenClientImports.filter((modulePath) =>
    new RegExp(`(?:from\\s*|import\\s*)["']${modulePath}["']`).test(source),
  );
}
