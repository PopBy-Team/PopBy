import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

async function source(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), 'utf8')
}

test('drop pin is a larger borderless hollow marker and the fan uses an equal-radius arc', async () => {
  const [fan, css] = await Promise.all([
    source('../src/components/DropCategoryFan.jsx'),
    source('../src/styles.css'),
  ])
  const pinRule = css.match(/\.drop-coordinate-pin\s*\{[^}]*\}/)?.[0] || ''
  const pathRule = css.match(/\.drop-coordinate-pin path\s*\{[^}]*\}/)?.[0] || ''

  assert.doesNotMatch(fan, /<circle/)
  assert.match(fan, /fillRule="evenodd"/)
  assert.match(pinRule, /width:\s*54px/)
  assert.match(pinRule, /height:\s*68px/)
  assert.match(pathRule, /stroke:\s*none/)
  assert.match(fan, /radiusX:\s*124/)
  assert.match(fan, /radiusY:\s*124/)
})

test('composer locks typing and persistent controls throughout a tutorial draft', async () => {
  const [composer, reader, app, map, overlay] = await Promise.all([
    source('../src/components/DropComposer.jsx'),
    source('../src/components/ThoughtSheet.jsx'),
    source('../src/App.jsx'),
    source('../src/components/MapView.jsx'),
    source('../src/tutorial/TutorialOverlay.jsx'),
  ])

  assert.match(composer, /readOnly=\{textEntryLocked \|\| tutorialMode\}/)
  assert.match(composer, /disabled=\{tutorialMode\}/)
  assert.match(composer, /disabled=\{busy \|\| tutorialMode\}/)
  assert.match(composer, /className="composer-blank-paper-exit"[\s\S]{0,240}onClick=\{exitFromBlankPaper\}/)
  assert.match(composer, /disabled=\{tutorialMode && tutorialStep !== TUTORIAL\.CARD_EXIT\}/)
  assert.match(reader, /disabled=\{tutorialMode\}/)
  assert.match(reader, /if \(tutorialMode\) return/)
  assert.match(reader, /event\.key === 'Escape' && !tutorialMode/)
  assert.match(app, /disabled=\{tutorial\.active\}/)
  assert.match(map, /disabled=\{tutorialStep !== TUTORIAL\.OFF\}/)
  assert.match(map, /disabled=\{tutorialStep !== TUTORIAL\.OFF && tutorialStep !== TUTORIAL\.LOCATE\}/)
  assert.match(overlay, /keepFocusInsideGuide/)
  assert.match(composer, /aria-hidden="true">📷</)
  assert.match(composer, /Thought text is required/)
})

test('guide closes from its backdrop and reader navigation uses light taps', async () => {
  const [guide, reader] = await Promise.all([
    source('../src/components/OnboardingTour.jsx'),
    source('../src/components/ThoughtSheet.jsx'),
  ])

  assert.match(
    guide,
    /className="onboarding-backdrop"[\s\S]{0,220}onClick=\{\(event\)/,
  )
  assert.doesNotMatch(
    guide,
    /className="onboarding-backdrop"[\s\S]{0,220}onPointerDown=/,
  )
  assert.match(reader, /getTapDirection/)
  assert.match(reader, /tap either side/i)
  assert.doesNotMatch(reader, /getSwipeDirection/)
})

test('progress is a two-row compact rail and bottom labels clear Mapbox information', async () => {
  const [progress, css] = await Promise.all([
    source('../src/components/ProgressCard.jsx'),
    source('../src/styles.css'),
  ])

  assert.match(progress, /progress-main-row/)
  assert.match(css, /\.progress-card\s*\{[^}]*height:\s*44px/)
  assert.match(css, /\.demo-badge\s*\{[^}]*bottom:\s*calc\(52px/)
  assert.match(css, /\.map-compass svg\s*\{[^}]*fill:\s*none/)
})
