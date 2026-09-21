# Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reproducible, tested Dealer Smart web foundation with the approved design tokens, light/dark themes, accessible shell, validated environment contract, separated Supabase clients, local Supabase workspace, and CI gates.

**Architecture:** Build a single Next.js modular monolith without business features. Browser, request-scoped server, and privileged Supabase clients remain in separate modules; UI uses CSS-first Tailwind tokens and a minimal accessible shell. This plan stops at local foundation: creating or linking remote Supabase projects remains a separately authorized external gate.

**Tech Stack:** Node.js 24.21.x, pnpm 12.5.1, Next.js 16.3.5, React 19.3.0, TypeScript 7.0.2 strict, Tailwind CSS 4.3.3, Supabase JS 2.116.0, Supabase SSR 0.12.7, Zod 4.6.5, Vitest 5.0.1, Testing Library 16.3.3, Playwright 1.63.0.

**Spec:** `docs/superpowers/specs/2026-09-21-dealer-smart-architecture-design.md`

## Global Constraints

- Supabase is mandatory for Auth, PostgreSQL, Storage, Realtime, and server-side functions when applicable.
- The hierarchy remains Platform Owner Tenant → Contractor → Business Group → Company → Headquarters → Branch.
- No business table, tenant data, remote project, migration deployment, secret, or production integration is created in Phase 0.
- `DESIGN.md` is authoritative: Headline uses Outfit; Body and Label use Plus Jakarta Sans.
- Default light/dark tokens must match `DESIGN.md`; every component supports both themes.
- Browser code may receive only the Supabase URL and publishable key. Secret/service-role credentials are server-only.
- TypeScript remains strict; validation at one boundary never replaces validation at another.
- Dependencies are exact-pinned and `pnpm-lock.yaml` is committed.
- Each task ends in a locally verifiable state and a focused commit.

## Review Focus

- Missing or malformed Supabase environment values fail with named validation errors instead of a generic runtime crash; Task 3 tests this.
- A client component cannot import the privileged Supabase client or server environment module; Task 3 adds an architecture test.
- Theme selection survives reload without a hydration mismatch and both themes expose the canonical tokens; Task 4 tests this in Playwright.
- At 320 px width, the shell has no page-level horizontal overflow and navigation remains keyboard-accessible; Task 5 tests this.
- CI must use Node 24, pnpm 12.5.1, and a frozen lockfile rather than silently changing dependencies; Task 7 tests the workflow contract.

---

## File Map

### Repository and tooling

- `package.json` — exact dependencies and executable quality scripts.
- `pnpm-lock.yaml` — reproducible dependency graph.
- `.node-version` — Node 24.21.0 baseline.
- `.npmrc` — exact-save and strict engine behavior.
- `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore` — compiler and quality configuration.
- `.gitignore`, `.env.example` — local artifact and environment boundaries.

### Application

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — root composition and canonical tokens.
- `app/fonts.ts` — centralized Outfit and Plus Jakarta Sans loading.
- `components/providers/theme-provider.tsx` — class-based theme orchestration.
- `components/theme/theme-toggle.tsx` — accessible theme control.
- `components/shell/app-shell.tsx` — responsive application frame.
- `components/ui/button.tsx`, `components/ui/card.tsx` — first reusable primitives.
- `lib/ui/cn.ts` — class composition helper.

### Supabase and environment

- `lib/env/public.ts`, `lib/env/server.ts` — validated environment contracts.
- `lib/supabase/browser.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` — separated client factories.
- `supabase/config.toml` — CLI-generated local workspace configuration.

### Tests and automation

- `vitest.config.ts`, `tests/setup.ts` — unit/component harness.
- `tests/unit/env.test.ts`, `tests/unit/server-boundaries.test.ts`, `tests/unit/ui-primitives.test.tsx` — fast contracts.
- `playwright.config.ts`, `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts` — browser and accessibility checks.
- `.github/workflows/ci.yml`, `tests/unit/ci-contract.test.ts` — immutable CI contract.
- `docs/ENVIRONMENTS.md` — environment responsibilities and external gates.

---

### Task 1: Bootstrap the pinned Next.js repository

**Files:**
- Create: `.gitignore`, `.node-version`, `.npmrc`, `package.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Generate: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: approved documentation already in the repository.
- Produces: scripts `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, `test:run`, `test:e2e`, and `verify`.

- [ ] **Step 1: Initialize Git without altering documentation**

Run:

```bash
git init -b main
git status --short
```

Expected: the existing Markdown files appear as untracked; no file is deleted or moved.

- [ ] **Step 2: Create the exact package contract**

Create `package.json` with `private: true`, `packageManager: "pnpm@12.5.1"`, Node engine `>=24.21.0 <25`, and these exact versions:

```json
{
  "dependencies": {
    "@supabase/ssr": "0.12.7",
    "@supabase/supabase-js": "2.116.0",
    "clsx": "2.1.1",
    "next": "16.3.5",
    "next-themes": "0.4.6",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "server-only": "0.0.1",
    "tailwind-merge": "3.7.0",
    "zod": "4.6.5"
  },
  "devDependencies": {
    "@axe-core/playwright": "4.13.0",
    "@playwright/test": "1.63.0",
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.3",
    "@testing-library/user-event": "14.6.7",
    "@types/node": "26.6.2",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "eslint": "10.11.0",
    "eslint-config-next": "16.3.5",
    "eslint-config-prettier": "10.1.8",
    "jsdom": "30.1.0",
    "postcss": "8.5.28",
    "prettier": "3.9.8",
    "prettier-plugin-tailwindcss": "0.8.1",
    "supabase": "2.117.0",
    "tailwindcss": "4.3.3",
    "typescript": "7.0.2",
    "vitest": "5.0.1"
  }
}
```

Add these exact scripts at the top level of `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "verify": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:run && pnpm build"
  }
}
```

- [ ] **Step 3: Create strict compiler and tool configuration**

Set `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noEmit: true`, alias `@/*` to the repository root, and Next.js plugin support in `tsconfig.json`. Configure Next with `reactStrictMode: true` and `poweredByHeader: false`. Configure Tailwind 4 through `@tailwindcss/postcss`.

- [ ] **Step 4: Create the smallest buildable application**

`app/page.tsx` must render one semantic `main`, an `h1` containing `Dealer Smart`, and a paragraph containing `Fundação técnica`. `app/layout.tsx` must set `lang="pt-BR"` and import `app/globals.css`.

- [ ] **Step 5: Install and verify the baseline**

Run:

```bash
corepack enable
corepack prepare pnpm@12.5.1 --activate
pnpm install
pnpm typecheck
pnpm build
```

Expected: install writes `pnpm-lock.yaml`; typecheck and production build exit 0.

- [ ] **Step 6: Commit the bootstrap**

```bash
git add .gitignore .node-version .npmrc package.json pnpm-lock.yaml tsconfig.json next-env.d.ts next.config.ts postcss.config.mjs eslint.config.mjs .prettierrc.json .prettierignore app
git commit -m "chore: bootstrap dealer smart foundation"
```

### Task 2: Establish unit and browser test harnesses

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/unit/root-page.test.tsx`
- Create: `playwright.config.ts`, `tests/e2e/root.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `app/page.tsx` from Task 1.
- Produces: deterministic jsdom tests and Playwright web-server orchestration on port 3100.

- [ ] **Step 1: Write the failing root component test**

```tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("identifies the Dealer Smart foundation", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: "Dealer Smart" })).toBeInTheDocument();
  expect(screen.getByText(/Fundação técnica/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test before configuring Vitest**

Run: `pnpm test:run tests/unit/root-page.test.tsx`

Expected: FAIL because the Vitest setup/alias is not configured.

- [ ] **Step 3: Configure Vitest and Testing Library**

Use `environment: "jsdom"`, load `tests/setup.ts`, resolve alias `@` to the repository root, and import `@testing-library/jest-dom/vitest` in setup.

- [ ] **Step 4: Add a browser smoke test**

```ts
import { expect, test } from "@playwright/test";

test("renders the foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dealer Smart" })).toBeVisible();
});
```

Configure Playwright to run `pnpm dev --port 3100`, use `http://127.0.0.1:3100`, Chromium only, screenshot on failure, trace on first retry, and reuse the local server outside CI.

- [ ] **Step 5: Verify both harnesses**

Run:

```bash
pnpm test:run
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: one unit test and one browser smoke test pass.

- [ ] **Step 6: Commit the test foundation**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts playwright.config.ts tests
git commit -m "test: add foundation test harnesses"
```

### Task 3: Validate environment values and isolate Supabase clients

**Files:**
- Create: `.env.example`
- Create: `lib/env/public.ts`, `lib/env/server.ts`
- Create: `lib/supabase/browser.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- Create: `tests/unit/env.test.ts`, `tests/unit/server-boundaries.test.ts`

**Interfaces:**
- Produces: `parsePublicEnv(source): PublicEnv`, `parseServerEnv(source): ServerEnv`, `createBrowserSupabaseClient()`, `createServerSupabaseClient()`, `createAdminSupabaseClient()`.
- Consumes: `@supabase/ssr`, `@supabase/supabase-js`, Next cookies, and Zod.

- [ ] **Step 1: Write failing environment contract tests**

```ts
it("rejects a malformed Supabase URL", () => {
  expect(() => parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key"
  })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
});

it("requires the server-only secret", () => {
  expect(() => parseServerEnv({
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key"
  })).toThrow(/SUPABASE_SECRET_KEY/);
});
```

- [ ] **Step 2: Confirm the tests fail**

Run: `pnpm test:run tests/unit/env.test.ts`

Expected: FAIL because `parsePublicEnv` and `parseServerEnv` do not exist.

- [ ] **Step 3: Implement the exact environment schemas**

`PublicEnv` contains a valid URL and non-empty publishable key. `ServerEnv` extends it with a non-empty `SUPABASE_SECRET_KEY`. Export parser functions that accept `NodeJS.ProcessEnv | Record<string, string | undefined>` so tests never mutate process globals. Prefix `lib/env/server.ts` with `import "server-only"`.

```ts
// lib/env/public.ts
import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export const parsePublicEnv = (
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
): PublicEnv => publicEnvSchema.parse(source);
```

```ts
// lib/env/server.ts
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
```

- [ ] **Step 4: Implement the three client factories**

- Browser: `createBrowserClient(url, publishableKey)`.
- Server: async `createServerClient` with `cookies().getAll()` and guarded `setAll()` for Server Component read contexts.
- Admin: `createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } })`, prefixed with `import "server-only"`.

Do not export a singleton request-scoped server client.

The browser factory must have exactly this public signature:

```ts
export function createBrowserSupabaseClient(): ReturnType<typeof createBrowserClient>;
```

The request-scoped server factory must be asynchronous:

```ts
export async function createServerSupabaseClient(): Promise<SupabaseClient>;
```

The privileged factory remains unexported from any barrel consumed by client code:

```ts
export function createAdminSupabaseClient(): SupabaseClient;
```

- [ ] **Step 5: Add the client-boundary architecture test**

The test recursively reads `.tsx` files containing the literal `"use client"` and fails if their source imports `@/lib/env/server` or `@/lib/supabase/admin`. Create a fixture string inside the test proving both forbidden imports are detected and a browser import is accepted.

- [ ] **Step 6: Document non-secret local names**

`.env.example` contains exactly:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=obtain-from-supabase-status
SUPABASE_SECRET_KEY=obtain-from-supabase-status
```

Ensure `.env*` is ignored except `.env.example`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test:run tests/unit/env.test.ts tests/unit/server-boundaries.test.ts && pnpm typecheck`

Expected: all tests and typecheck pass.

```bash
git add .env.example .gitignore lib tests/unit/env.test.ts tests/unit/server-boundaries.test.ts
git commit -m "feat: add validated Supabase client boundaries"
```

### Task 4: Implement canonical fonts, tokens, and theme persistence

**Files:**
- Create: `app/fonts.ts`, `components/providers/theme-provider.tsx`, `components/theme/theme-toggle.tsx`
- Modify: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `tests/e2e/theme.spec.ts`

**Interfaces:**
- Produces: `ThemeProvider({ children })` and `ThemeToggle()`.
- Consumes: canonical values from `DESIGN.md` and `next-themes` using `attribute="class"`.

- [ ] **Step 1: Write the failing theme E2E test**

The test must assert all of the following:

```ts
await page.goto("/");
await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
await page.getByRole("button", { name: /ativar modo escuro/i }).click();
await expect(page.locator("html")).toHaveClass(/dark/);
await page.reload();
await expect(page.locator("html")).toHaveClass(/dark/);
expect(await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily)).toContain("Plus Jakarta Sans");
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test:e2e tests/e2e/theme.spec.ts`

Expected: FAIL because the theme control and font are absent.

- [ ] **Step 3: Load only the approved font families**

Use `Outfit` and `Plus_Jakarta_Sans` from `next/font/google`, with Latin subset, `display: "swap"`, and CSS variables `--font-headline` and `--font-body`. Apply both variables to `<body>`.

- [ ] **Step 4: Encode the canonical tokens**

In `app/globals.css`, use Tailwind 4 `@import "tailwindcss"`, register class-based dark variants, and copy every light/dark value from the palette table in `DESIGN.md`. Map headline to `--font-headline`; map body and labels to `--font-body`. Do not add a third font family.

The file must begin with this structure and include the remaining tokens from `DESIGN.md` in the same two blocks:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg-viewport: #f8f9ff;
  --surface: #f8f9ff;
  --surface-card: #ffffff;
  --surface-card-high: #f0f4fd;
  --surface-input: #ffffff;
  --border-regular: #e2e8f0;
  --border-subtle: #edf2f7;
  --color-primary: #1e3a5f;
  --color-primary-hover: #162c48;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  --status-success: #059669;
  --status-warning: #d97706;
  --status-danger: #dc2626;
}

.dark {
  --bg-viewport: #090e17;
  --surface: #0f131d;
  --surface-card: #171c25;
  --surface-card-high: #1e2430;
  --surface-input: #0a0e18;
  --border-regular: #263042;
  --border-subtle: #1e2533;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-danger: #ef4444;
}
```

- [ ] **Step 5: Implement persisted theme selection**

Wrap the app in `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. Add `suppressHydrationWarning` on `<html>`. `ThemeToggle` renders only after mount, exposes an accessible name for the destination mode, and toggles between `light` and `dark`.

- [ ] **Step 6: Verify and commit**

Run: `pnpm test:e2e tests/e2e/theme.spec.ts && pnpm build`

Expected: persistence, font assertion, and build pass without hydration warnings.

```bash
git add app components/providers components/theme tests/e2e/theme.spec.ts
git commit -m "feat: add canonical bimodal design foundation"
```

### Task 5: Build the accessible responsive shell and primitives

**Files:**
- Create: `lib/ui/cn.ts`
- Create: `components/ui/button.tsx`, `components/ui/card.tsx`
- Create: `components/shell/app-shell.tsx`
- Modify: `app/page.tsx`
- Create: `tests/unit/ui-primitives.test.tsx`, `tests/e2e/shell.spec.ts`

**Interfaces:**
- Produces: `cn(...inputs)`, `Button`, `Card`, and `AppShell({ children })`.
- Consumes: theme tokens and `ThemeToggle` from Task 4.

- [ ] **Step 1: Write failing primitive tests**

```tsx
it("exposes button semantics and focusable content", async () => {
  const user = userEvent.setup();
  render(<Button>Salvar</Button>);
  await user.tab();
  expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();
});

it("renders a card heading with accessible structure", () => {
  render(<Card title="Visão geral">Conteúdo</Card>);
  expect(screen.getByRole("heading", { name: "Visão geral" })).toBeVisible();
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test:run tests/unit/ui-primitives.test.tsx`

Expected: FAIL because the primitives do not exist.

- [ ] **Step 3: Implement minimal primitives**

`Button` forwards native button props, defaults to `type="button"`, preserves `className`, and uses token-based focus/disabled states. `Card` accepts `{ title: string; children: ReactNode }` and renders semantic heading/content regions. `cn` combines `clsx` and `tailwind-merge`.

```ts
// lib/ui/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

```tsx
// components/ui/button.tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-[4px] bg-[var(--color-primary)] px-4 py-2 font-semibold text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Implement the shell**

The shell contains a skip link, semantic header, desktop navigation, compact mobile navigation control, main landmark, product name, and theme toggle. Navigation labels for Phase 0 are `Visão geral` and `Governança`, with non-functional destinations explicitly disabled or pointing to the current foundation page; do not invent business screens.

- [ ] **Step 5: Add 320 px and accessibility browser coverage**

At viewport `320x720`, assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, tab to the skip link, activate it, and assert the main landmark is focused. Run `AxeBuilder` and fail on serious or critical violations.

- [ ] **Step 6: Verify and commit**

Run: `pnpm test:run tests/unit/ui-primitives.test.tsx && pnpm test:e2e tests/e2e/shell.spec.ts`

Expected: component, overflow, keyboard, and axe checks pass.

```bash
git add app/page.tsx components/shell components/ui lib/ui tests/unit/ui-primitives.test.tsx tests/e2e/shell.spec.ts
git commit -m "feat: add accessible application shell"
```

### Task 6: Initialize and verify the local Supabase workspace

**Files:**
- Create: `supabase/config.toml` through the pinned CLI
- Modify: `.gitignore`, `package.json`
- Create: `docs/ENVIRONMENTS.md`

**Interfaces:**
- Produces: scripts `supabase:start`, `supabase:stop`, `supabase:status`, and a documented local-only workflow.
- Consumes: Supabase CLI 2.117.0 and Docker.

- [ ] **Step 1: Discover the pinned CLI contract**

Run:

```bash
pnpm exec supabase --version
pnpm exec supabase init --help
```

Expected: version `2.117.0`; help confirms the current init syntax before use.

- [ ] **Step 2: Initialize local configuration**

Run: `pnpm exec supabase init`

Expected: `supabase/config.toml` is created; no remote project is linked.

- [ ] **Step 3: Add local lifecycle scripts**

Add package scripts mapping directly to `supabase start`, `supabase stop`, and `supabase status`. Keep generated cache/state paths ignored while committing `supabase/config.toml`.

- [ ] **Step 4: Document environment boundaries**

`docs/ENVIRONMENTS.md` must state:

- local uses the CLI stack and values emitted by `supabase status`;
- development, homologation, and production require separate Supabase projects;
- project creation/linking, remote migrations, secrets, and Auth settings need explicit authorization;
- evidence of local success does not prove any remote state;
- no production data is copied into local or development environments.

- [ ] **Step 5: Run the local smoke**

Run:

```bash
pnpm supabase:start
pnpm supabase:status
pnpm supabase:stop
```

Expected: local services become healthy, status returns URLs/keys, and stop exits 0. If Docker is unavailable, stop this task and report that prerequisite; do not substitute a remote project.

- [ ] **Step 6: Commit the local workspace**

```bash
git add package.json pnpm-lock.yaml .gitignore supabase/config.toml docs/ENVIRONMENTS.md
git commit -m "chore: add local Supabase workspace"
```

### Task 7: Add immutable CI gates and final foundation verification

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/unit/ci-contract.test.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: CI jobs for static verification and Chromium E2E; documents exact local commands.
- Consumes: all scripts and tests from Tasks 1–6.

- [ ] **Step 1: Write the failing CI contract test**

The test reads `.github/workflows/ci.yml` and asserts it contains:

```ts
expect(workflow).toContain("node-version: 24.21.0");
expect(workflow).toContain("pnpm@12.5.1");
expect(workflow).toContain("pnpm install --frozen-lockfile");
expect(workflow).toContain("pnpm verify");
expect(workflow).toContain("pnpm test:e2e");
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test:run tests/unit/ci-contract.test.ts`

Expected: FAIL because the workflow does not exist.

- [ ] **Step 3: Implement the workflow**

Create two jobs on pull requests and pushes to `main`:

1. `verify`: checkout, setup Node 24.21.0, enable pnpm 12.5.1, frozen install, then `pnpm verify`.
2. `e2e`: same setup, `pnpm exec playwright install --with-deps chromium`, then `pnpm test:e2e`.

Use least-privilege workflow permissions with `contents: read`. Do not add Supabase secrets or remote commands.

The workflow shape is:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: 24.21.0
          cache: pnpm
      - run: corepack enable && corepack prepare pnpm@12.5.1 --activate
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version: 24.21.0
          cache: pnpm
      - run: corepack enable && corepack prepare pnpm@12.5.1 --activate
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

- [ ] **Step 4: Update the repository entry point**

Add prerequisites, `pnpm install`, `pnpm supabase:start`, environment file setup, `pnpm dev`, `pnpm verify`, and `pnpm test:e2e` to `README.md`. Preserve the existing documentation map and the statement that remote state is unproven.

- [ ] **Step 5: Run the complete local gate**

Run:

```bash
pnpm test:run tests/unit/ci-contract.test.ts
pnpm verify
pnpm test:e2e
git status --short
```

Expected: every command exits 0; only intended Phase 0 files are modified or untracked.

- [ ] **Step 6: Commit the completed Phase 0 foundation**

```bash
git add .github/workflows/ci.yml tests/unit/ci-contract.test.ts README.md
git commit -m "ci: enforce phase zero quality gates"
```

## Completion Gate

Phase 0 local foundation is complete only when:

- all seven task commits exist;
- `pnpm verify` and `pnpm test:e2e` pass from a clean checkout;
- local Supabase start/status/stop succeeds;
- computed fonts are Outfit for headlines and Plus Jakarta Sans for body/labels;
- light and dark themes match the canonical tokens;
- 320 px accessibility/overflow checks pass;
- no secret or remote project identifier is committed;
- `git status --short` is clean.

Remote Supabase projects, Auth configuration, schema migrations, deployment, authenticated smoke, and homologation remain separate future gates and must not be reported as complete from this plan.
