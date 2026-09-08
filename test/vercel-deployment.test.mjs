import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const configPath = fileURLToPath(new URL("../vercel.json", import.meta.url));

function run(command) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: repositoryRoot,
      env: process.env,
      shell: true,
      stdio: "inherit",
    });

    child.on("exit", (code) => resolve(code));
  });
}

test("the repository-level Vercel build produces the introduction site", { timeout: 120_000 }, async () => {
  assert.ok(existsSync(configPath), "vercel.json must define the repository-level deployment");

  const config = JSON.parse(await readFile(configPath, "utf8"));
  const exitCode = await run(config.buildCommand);
  const outputDirectory = new URL(`../${config.outputDirectory}/`, import.meta.url);

  assert.equal(exitCode, 0, "the configured Vercel build command must succeed");
  assert.ok(existsSync(new URL("BUILD_ID", outputDirectory)), "the configured output must be a Next.js build");
});
