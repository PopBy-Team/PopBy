import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let deck;

before(async () => {
  server = await createServer({
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });
  deck = await server.ssrLoadModule("/src/App.tsx");
});

after(async () => {
  await server?.close();
});

test("the deck opens with a dedicated PopBy cover", () => {
  const cover = deck.slides[0];
  const scene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 0 }));

  assert.equal(deck.slides.length, 10);
  assert.equal(cover.cover, true);
  assert.match(scene, /PopBy<span>\.<\/span>/);
  assert.match(scene, /Pop up when[\s\S]*you pop by\./);
  assert.match(scene, /class="cover-mark"><div class="cover-mark-inner"/);
});

test("research evidence leads the content flow before market positioning", () => {
  assert.match(deck.slides[1].eyebrow, /^01 \/ RESEARCH & EVIDENCE$/);
  assert.match(deck.slides[2].eyebrow, /^02 \/ MARKET POSITIONING$/);
});

test("the first two content pages keep their matching visual stories", () => {
  const researchScene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 1 }));
  const positioningScene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 2 }));

  assert.match(researchScene, /class="scene bench-scene"/);
  assert.match(positioningScene, /class="scene persona-scene"/);
});

test("the evidence slide exposes one equal-height grid containing all four cards", () => {
  const markup = renderToStaticMarkup(deck.slides[1].content);

  assert.match(markup, /class="cards compact evidence-grid"/);
  assert.equal((markup.match(/<article class="card">/g) ?? []).length, 4);
});

test("the pain-point cloud preserves four named layers and at least eight weighted concepts", () => {
  const markup = renderToStaticMarkup(React.createElement(deck.Scene, { index: 5 }));

  assert.match(markup, /aria-label="Pain-point concept hierarchy"/);
  assert.equal((markup.match(/class="pain-layer /g) ?? []).length, 4);
  assert.ok((markup.match(/class="pain-word /g) ?? []).length >= 8);
  assert.ok((markup.match(/data-weight="primary"/g) ?? []).length >= 3);
});

test("the market-positioning and user-pain pages do not show a source block", () => {
  assert.equal(deck.slides[2].source, "");
  assert.equal(deck.slides[5].source, "");
  assert.equal(renderToStaticMarkup(React.createElement(deck.SourceLabel, { source: "" })), "");

  for (const slide of deck.slides.filter((item) => item.source)) {
    const markup = renderToStaticMarkup(
      React.createElement(deck.SourceLabel, { source: slide.source }),
    );

    assert.match(markup, /<aside class="source-label" aria-label="Report source">/);
    assert.match(markup, /<strong>[^<]+<\/strong><span>[^<]+<\/span>/);
  }
});

test("the growth slide shows three flywheel stages and all four Fitzroy unlock milestones", () => {
  const content = renderToStaticMarkup(deck.slides[6].content);
  const scene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 6 }));

  assert.match(content, /class="growth-summary strategy-stack"/);
  assert.equal((content.match(/class="growth-step"/g) ?? []).length, 3);
  assert.equal((content.match(/class="strategy-kicker"/g) ?? []).length, 3);
  assert.equal((scene.match(/class="milestone"/g) ?? []).length, 4);
  assert.equal((scene.match(/class="flywheel-node /g) ?? []).length, 3);
  assert.match(scene, /15/);
  assert.match(scene, /50/);
  assert.match(scene, /30/);
});

test("the business model is split into focused B2C and B2B pages", () => {
  const consumer = deck.slides[7];
  const partner = deck.slides[8];
  const consumerContent = renderToStaticMarkup(consumer.content);
  const partnerContent = renderToStaticMarkup(partner.content);
  const consumerScene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 7 }));
  const partnerScene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 8 }));

  assert.equal(consumer.businessKind, "B2C");
  assert.equal(partner.businessKind, "B2B");
  assert.equal(consumer.title, "Poetic & Non-Invasive");
  assert.equal(partner.title, "Poetic & Non-Invasive");
  assert.equal(consumer.italic, "Monetization");
  assert.equal(partner.italic, "Monetization");
  assert.equal(consumer.copy, "Monetizing through foot traffic and emotional experiences—never invasive ads or social clout.");
  assert.equal(partner.copy, consumer.copy);
  assert.match(consumerContent, /class="revenue-content strategy-stack"/);
  assert.match(partnerContent, /class="revenue-content strategy-stack"/);
  assert.equal((consumerContent.match(/class="revenue-card b2c"/g) ?? []).length, 2);
  assert.equal((partnerContent.match(/class="revenue-card b2b"/g) ?? []).length, 2);
  assert.equal((consumerContent.match(/class="strategy-kicker"/g) ?? []).length, 2);
  assert.equal((partnerContent.match(/class="strategy-kicker"/g) ?? []).length, 2);
  assert.equal((consumerScene.match(/class="revenue-stream /g) ?? []).length, 2);
  assert.equal((partnerScene.match(/class="revenue-stream /g) ?? []).length, 2);
  assert.match(consumerContent, /No social clout/);
  assert.match(partnerContent, /No intrusive ads/);
});

test("the pain-point page links directly to the deployed introduction site", () => {
  const markup = renderToStaticMarkup(deck.slides[5].content);

  assert.match(markup, /class="showcase-link"/);
  assert.match(markup, /href="https:\/\/popbypop\.vercel\.app"/);
  assert.match(markup, /Open the PopBy experience/);
});

test("the final slide is a text-free visual with one centered phone image", () => {
  assert.equal(deck.slides.length, 10);
  assert.equal(deck.slides[9].visualOnly, true);

  const scene = renderToStaticMarkup(React.createElement(deck.Scene, { index: 9 }));
  const visibleText = scene.replace(/<[^>]+>/g, "").trim();

  assert.equal((scene.match(/class="phone-hero"/g) ?? []).length, 1);
  assert.match(scene, /class="finale-scene"/);
  assert.equal(visibleText, "");
});
