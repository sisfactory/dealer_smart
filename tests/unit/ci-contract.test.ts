import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const workflowPath = resolve(process.cwd(), ".github/workflows/ci.yml");

function readWorkflow(): string {
  expect(existsSync(workflowPath)).toBe(true);
  return existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
}

function jobBlock(workflow: string, jobName: string): string {
  const match = workflow.match(
    new RegExp(
      `^  ${jobName}:\\n([\\s\\S]*?)(?=^  [A-Za-z0-9_-]+:|^\\S|$(?![\\s\\S]))`,
      "m",
    ),
  );

  expect(match, `missing ${jobName} job`).not.toBeNull();
  return match?.[1] ?? "";
}

function runCommands(job: string): string[] {
  return [...job.matchAll(/^      - run: (.+)$/gm)].map(
    (match) => match[1] ?? "",
  );
}

function permissionLines(workflow: string): string[] {
  const match = workflow.match(/^permissions:\n((?:  .+(?:\n|$))*)/m);

  expect(match, "missing top-level permissions").not.toBeNull();
  return (match?.[1] ?? "")
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.trim());
}

describe("CI workflow contract", () => {
  it("triggers for pull requests and main pushes", () => {
    const workflow = readWorkflow();

    expect(workflow).toMatch(
      /^on:\n  pull_request:\n  push:\n    branches: \[main\]$/m,
    );
  });

  it("grants only repository-read permission", () => {
    const workflow = readWorkflow();

    expect((workflow.match(/^permissions:/gm) ?? []).length).toBe(1);
    expect(permissionLines(workflow)).toEqual(["contents: read"]);
  });

  it("runs the static gate with the pinned toolchain", () => {
    const workflow = readWorkflow();
    const verify = jobBlock(workflow, "verify");

    expect(verify).toContain(
      "uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4",
    );
    expect(verify).toContain(
      "uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4",
    );
    expect(verify).toContain("node-version: 24.21.0");
    expect(verify).toContain("cache: pnpm");
    expect(runCommands(verify)).toEqual([
      "corepack enable && corepack prepare pnpm@12.5.1 --activate",
      "pnpm install --frozen-lockfile",
      "pnpm verify",
    ]);
  });

  it("runs Chromium E2E in its dedicated job", () => {
    const workflow = readWorkflow();
    const e2e = jobBlock(workflow, "e2e");

    expect(e2e).toContain(
      "uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4",
    );
    expect(e2e).toContain(
      "uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4",
    );
    expect(e2e).toContain("node-version: 24.21.0");
    expect(e2e).toContain("cache: pnpm");
    expect(runCommands(e2e)).toEqual([
      "corepack enable && corepack prepare pnpm@12.5.1 --activate",
      "pnpm install --frozen-lockfile",
      "pnpm exec playwright install --with-deps chromium",
      "pnpm test:e2e",
    ]);
    expect(e2e).not.toContain("pnpm verify");
  });
});
