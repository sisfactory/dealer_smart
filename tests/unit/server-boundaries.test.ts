import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findForbiddenClientImports } from "@/tests/helpers/client-import-boundaries";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const ignoredDirectories = new Set([".git", ".next", "node_modules", "tests"]);

async function collectTsxFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (ignoredDirectories.has(entry.name)) {
          return [];
        }

        return collectTsxFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".tsx") ? [entryPath] : [];
    }),
  );

  return files.flat();
}

describe("client/server Supabase boundaries", () => {
  it("detects privileged imports in client component source while allowing browser imports", () => {
    expect(
      findForbiddenClientImports(
        '"use client";\nimport "@/lib/env/server";\nimport { createAdminSupabaseClient } from "@/lib/supabase/admin";',
      ),
    ).toEqual(["@/lib/env/server", "@/lib/supabase/admin"]);
    expect(
      findForbiddenClientImports(
        '"use client";\nimport { createBrowserSupabaseClient } from "@/lib/supabase/browser";',
      ),
    ).toEqual([]);
    expect(
      findForbiddenClientImports(
        '\'use client\';\nimport "@/lib/env/server";\nimport { createAdminSupabaseClient } from "@/lib/supabase/admin";',
      ),
    ).toEqual(["@/lib/env/server", "@/lib/supabase/admin"]);
  });

  it("does not treat a later string literal as a client directive", () => {
    expect(
      findForbiddenClientImports(
        'const directive = "use client";\nimport "@/lib/env/server";',
      ),
    ).toEqual([]);
  });

  it("reads browser configuration through statically referenced public variables", async () => {
    const browserClientSource = await readFile(
      path.join(repositoryRoot, "lib/supabase/browser.ts"),
      "utf8",
    );

    expect(browserClientSource).not.toContain("parsePublicEnv(process.env)");
    expect(browserClientSource).toContain(
      "NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL",
    );
    expect(browserClientSource).toMatch(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:\s*process\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  it("keeps privileged Supabase modules out of client components", async () => {
    const files = await collectTsxFiles(repositoryRoot);
    const violations = await Promise.all(
      files.map(async (filePath) => ({
        filePath: path.relative(repositoryRoot, filePath),
        forbiddenImports: findForbiddenClientImports(
          await readFile(filePath, "utf8"),
        ),
      })),
    );

    expect(
      violations.filter(({ forbiddenImports }) => forbiddenImports.length > 0),
    ).toEqual([]);
  });
});
