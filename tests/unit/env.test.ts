import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "@/lib/env/public";
import { parseServerEnv } from "@/lib/env/server";

const validPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key",
};

describe("Supabase environment contracts", () => {
  it("rejects a malformed Supabase URL", () => {
    expect(() =>
      parsePublicEnv({
        ...validPublicEnv,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("requires the server-only secret", () => {
    expect(() => parseServerEnv(validPublicEnv)).toThrow(/SUPABASE_SECRET_KEY/);
  });

  it("normalizes neither the source object nor environment values", () => {
    const source = {
      ...validPublicEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "  publishable-test-key  ",
    };

    const parsed = parsePublicEnv(source);

    expect(parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      "publishable-test-key",
    );
    expect(source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      "  publishable-test-key  ",
    );
  });
});
