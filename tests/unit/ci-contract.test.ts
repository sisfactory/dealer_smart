import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { parseDocument } from "yaml";
import { describe, expect, it } from "vitest";

const workflowPath = resolve(process.cwd(), ".github/workflows/ci.yml");
const checkoutAction =
  "actions/checkout@11d5960a326750d5838078e36cf38b85af677262";
const setupNodeAction =
  "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020";

type RecordValue = Record<string, unknown>;

type MutationFixture = {
  name: string;
  mutate: (workflow: string) => string;
};

type ApprovedStep =
  | { kind: "action"; uses: string; with?: Record<string, string> }
  | { kind: "run"; run: string };

const verifySteps: readonly ApprovedStep[] = [
  { kind: "action", uses: checkoutAction },
  {
    kind: "action",
    uses: setupNodeAction,
    with: { "node-version": "24.21.0", cache: "pnpm" },
  },
  {
    kind: "run",
    run: "corepack enable && corepack prepare pnpm@12.5.1 --activate",
  },
  { kind: "run", run: "pnpm install --frozen-lockfile" },
  { kind: "run", run: "pnpm verify" },
];

const e2eSteps: readonly ApprovedStep[] = [
  ...verifySteps.slice(0, 4),
  {
    kind: "run",
    run: "pnpm exec playwright install --with-deps chromium",
  },
  { kind: "run", run: "pnpm test:e2e" },
];

function readWorkflow(): string {
  expect(existsSync(workflowPath)).toBe(true);
  return existsSync(workflowPath) ? readFileSync(workflowPath, "utf8") : "";
}

function asRecord(value: unknown, label: string): RecordValue {
  expect(value, `${label} must be an object`).not.toBeNull();
  expect(typeof value, `${label} must be an object`).toBe("object");
  expect(Array.isArray(value), `${label} must not be an array`).toBe(false);

  return value as RecordValue;
}

function asArray(value: unknown, label: string): unknown[] {
  expect(Array.isArray(value), `${label} must be an array`).toBe(true);
  return Array.isArray(value) ? value : [];
}

function expectExactKeys(
  value: RecordValue,
  label: string,
  expectedKeys: readonly string[],
): void {
  expect(Object.keys(value).sort(), `${label} keys`).toEqual(
    [...expectedKeys].sort(),
  );
}

function validateSteps(
  value: unknown,
  jobName: string,
  expected: readonly ApprovedStep[],
): void {
  const steps = asArray(value, `${jobName}.steps`);

  expect(steps, `${jobName}.steps`).toHaveLength(expected.length);

  for (const [index, expectedStep] of expected.entries()) {
    const step = asRecord(steps[index], `${jobName}.steps[${index}]`);

    if (expectedStep.kind === "run") {
      expectExactKeys(step, `${jobName}.steps[${index}]`, ["run"]);
      expect(step.run, `${jobName}.steps[${index}].run`).toBe(expectedStep.run);
      continue;
    }

    const expectedKeys = expectedStep.with ? ["uses", "with"] : ["uses"];
    expectExactKeys(step, `${jobName}.steps[${index}]`, expectedKeys);
    expect(step.uses, `${jobName}.steps[${index}].uses`).toBe(
      expectedStep.uses,
    );

    if (expectedStep.with) {
      const withValues = asRecord(step.with, `${jobName}.steps[${index}].with`);
      expectExactKeys(
        withValues,
        `${jobName}.steps[${index}].with`,
        Object.keys(expectedStep.with),
      );
      expect(withValues).toEqual(expectedStep.with);
    }
  }
}

function validateJob(
  value: unknown,
  jobName: "verify" | "e2e",
  expectedSteps: readonly ApprovedStep[],
): void {
  const job = asRecord(value, `jobs.${jobName}`);

  expectExactKeys(job, `jobs.${jobName}`, ["runs-on", "steps"]);
  expect(job["runs-on"], `jobs.${jobName}.runs-on`).toBe("ubuntu-latest");
  validateSteps(job.steps, jobName, expectedSteps);
}

function validateWorkflow(workflow: string): void {
  const document = parseDocument(workflow, {
    uniqueKeys: true,
    version: "1.2",
  });

  expect(document.errors, "workflow must be valid YAML 1.2").toHaveLength(0);

  const root = asRecord(document.toJS(), "workflow");
  expectExactKeys(root, "workflow", ["name", "on", "permissions", "jobs"]);
  expect(root.name, "workflow.name").toBe("CI");

  const triggers = asRecord(root.on, "workflow.on");
  expectExactKeys(triggers, "workflow.on", ["pull_request", "push"]);
  expect(triggers.pull_request, "workflow.on.pull_request").toBeNull();

  const push = asRecord(triggers.push, "workflow.on.push");
  expectExactKeys(push, "workflow.on.push", ["branches"]);
  expect(asArray(push.branches, "workflow.on.push.branches")).toEqual(["main"]);

  const permissions = asRecord(root.permissions, "workflow.permissions");
  expectExactKeys(permissions, "workflow.permissions", ["contents"]);
  expect(permissions.contents, "workflow.permissions.contents").toBe("read");

  const jobs = asRecord(root.jobs, "workflow.jobs");
  expectExactKeys(jobs, "workflow.jobs", ["verify", "e2e"]);
  validateJob(jobs.verify, "verify", verifySteps);
  validateJob(jobs.e2e, "e2e", e2eSteps);
}

const rejectedMutations: MutationFixture[] = [
  {
    name: "a third job",
    mutate: (workflow) =>
      `${workflow}\n  audit:\n    runs-on: ubuntu-latest\n    steps: []\n`,
  },
  {
    name: "invalid YAML",
    mutate: (workflow) => `${workflow}\ninvalid: [\n`,
  },
  {
    name: "job-level write permission",
    mutate: (workflow) =>
      workflow.replace(
        "  verify:\n    runs-on: ubuntu-latest",
        "  verify:\n    permissions:\n      contents: write\n    runs-on: ubuntu-latest",
      ),
  },
  {
    name: "job-level read permission",
    mutate: (workflow) =>
      workflow.replace(
        "  verify:\n    runs-on: ubuntu-latest",
        "  verify:\n    permissions:\n      contents: read\n    runs-on: ubuntu-latest",
      ),
  },
  {
    name: "an unapproved action",
    mutate: (workflow) =>
      workflow.replace(
        "      - run: pnpm verify",
        "      - run: pnpm verify\n      - { uses: evil/action@deadbeef }",
      ),
  },
  {
    name: "an extra command",
    mutate: (workflow) =>
      workflow.replace(
        "      - run: pnpm verify",
        '      - run: pnpm verify\n      - { run: "echo unexpected" }',
      ),
  },
  {
    name: "a Supabase remote command",
    mutate: (workflow) =>
      workflow.replace(
        "      - run: pnpm verify",
        "      - run: pnpm exec supabase link --project-ref example",
      ),
  },
  {
    name: "a network command",
    mutate: (workflow) =>
      workflow.replace(
        "      - run: pnpm verify",
        "      - run: curl https://example.invalid",
      ),
  },
  {
    name: "a deploy command",
    mutate: (workflow) =>
      workflow.replace("      - run: pnpm verify", "      - run: pnpm deploy"),
  },
  {
    name: "an extra environment value",
    mutate: (workflow) =>
      workflow.replace(
        "  e2e:\n    runs-on: ubuntu-latest",
        "  e2e:\n    env:\n      CI_DEBUG: true\n    runs-on: ubuntu-latest",
      ),
  },
  {
    name: "a secret reference",
    mutate: (workflow) =>
      workflow.replace(
        "  e2e:\n    runs-on: ubuntu-latest",
        "  e2e:\n    env:\n      CI_TOKEN: ${{ secrets.CI_TOKEN }}\n    runs-on: ubuntu-latest",
      ),
  },
];

describe("CI workflow contract", () => {
  it("accepts the approved workflow", () => {
    validateWorkflow(readWorkflow());
  });

  for (const fixture of rejectedMutations) {
    it(`rejects ${fixture.name}`, () => {
      expect(() => validateWorkflow(fixture.mutate(readWorkflow()))).toThrow();
    });
  }
});
