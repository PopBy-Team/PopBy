import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";

const port = 4317;
const origin = `http://127.0.0.1:${port}`;
let server;
let html = "";
let css = "";

before(async () => {
  server = spawn(process.execPath, ["./node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: new URL("..", import.meta.url),
    stdio: "ignore",
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) {
        html = await response.text();
        const cssPath = html.match(/href="([^"]+\.css[^"]*)"/)?.[1];
        if (!cssPath) throw new Error("The rendered page did not include a stylesheet");
        css = await fetch(new URL(cssPath, origin)).then((asset) => asset.text());
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("The introduction site did not start for its integration test");
});

after(() => {
  server?.kill("SIGTERM");
});

test("the introduction uses the final slogan without the old hyphen", () => {
  assert.match(html, /Pop up when/);
  assert.doesNotMatch(html, /Pop-up when/);
});

test("the four main story blocks expose one-screen section boundaries", () => {
  assert.equal((html.match(/data-viewport-section="true"/g) ?? []).length, 4);
});

test("the production stylesheet contains the Tailwind utilities used by the page", () => {
  assert.match(css, /\.rounded-full/);
  assert.match(css, /\.bg-paper/);
  assert.match(css, /\.md\\:grid-cols/);
});

test("the design section keeps one wide feature card above two smaller cards", () => {
  assert.equal((html.match(/data-feature-size="wide"/g) ?? []).length, 1);
  assert.equal((html.match(/data-feature-size="half"/g) ?? []).length, 2);
});

test("the design section keeps the original one-large-two-small card composition", () => {
  assert.match(html, /class="[^"]*feature-layout[^"]*"/);
  assert.match(html, /class="[^"]*feature-card-primary[^"]*sm:col-span-2[^"]*"/);
  assert.equal((html.match(/class="[^"]*feature-card /g) ?? []).length, 3);
});
