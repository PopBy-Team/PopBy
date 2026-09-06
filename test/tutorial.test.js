import test from 'node:test'
import assert from 'node:assert/strict'

import {
  TUTORIAL,
  TUTORIAL_EVENT,
  STEP_UI,
  createTutorialState,
  getTutorialGhostCoordinate,
  getTutorialDraftPolicy,
  getTutorialMarkerPresentation,
  isTutorialCategoryAllowed,
  isTutorialComposerStep,
  isTutorialComplete,
  isTutorialFocusCandidate,
  markTutorialComplete,
  shouldRestoreTutorialMap,
  tutorialReducer,
} from '../src/tutorial/tutorialSteps.js'
import { distanceMeters } from '../src/lib/geo.js'
import {
  getSpotlightRect,
  getSpotlightBlockers,
} from '../src/tutorial/tutorialGeometry.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('the tutorial requires both zoom directions before asking for location', () => {
  let state = tutorialReducer(createTutorialState(), { type: TUTORIAL_EVENT.START })
  assert.equal(state.step, TUTORIAL.ZOOM)

  state = tutorialReducer(state, { type: TUTORIAL_EVENT.ZOOMED, direction: 'in' })
  assert.equal(state.step, TUTORIAL.ZOOM)
  assert.deepEqual(state.zoom, { in: true, out: false })

  state = tutorialReducer(state, { type: TUTORIAL_EVENT.ZOOMED, direction: 'out' })
  assert.equal(state.step, TUTORIAL.LOCATE)
  assert.deepEqual(state.zoom, { in: true, out: true })
})

test('the tutorial uses real explore and create milestones in order', () => {
  let state = { ...createTutorialState(), step: TUTORIAL.LOCATE }

  const milestones = [
    [TUTORIAL_EVENT.LOCATED, TUTORIAL.THOUGHT_MEANING],
    [TUTORIAL_EVENT.ADVANCE, TUTORIAL.THOUGHT_ACCESS],
    [TUTORIAL_EVENT.ADVANCE, TUTORIAL.OPEN_THOUGHT],
    [TUTORIAL_EVENT.THOUGHT_OPENED, TUTORIAL.CARD_BROWSE],
    [TUTORIAL_EVENT.CARD_BROWSED, TUTORIAL.CARD_ADD],
    [TUTORIAL_EVENT.CARD_ADD_SELECTED, TUTORIAL.LONG_PRESS_GHOST],
    [TUTORIAL_EVENT.GHOST_LONG_PRESSED, TUTORIAL.CHOOSE_NATURE],
    [TUTORIAL_EVENT.NATURE_SELECTED, TUTORIAL.CARD_ICON],
  ]

  for (const [type, expectedStep] of milestones) {
    state = tutorialReducer(state, { type })
    assert.equal(state.step, expectedStep)
  }
})

test('the composer walkthrough keeps its fixed control order and finishes from blank paper', () => {
  let state = { ...createTutorialState(), step: TUTORIAL.CARD_ICON }
  const sequence = [
    TUTORIAL.CARD_TEXT,
    TUTORIAL.CARD_PAPER,
    TUTORIAL.CARD_CAMERA,
    TUTORIAL.CARD_FONT,
    TUTORIAL.CARD_FONT_SIZE,
    TUTORIAL.CARD_EXIT,
  ]

  for (const expectedStep of sequence) {
    state = tutorialReducer(state, { type: TUTORIAL_EVENT.ADVANCE })
    assert.equal(state.step, expectedStep)
  }

  assert.equal(
    tutorialReducer(state, { type: TUTORIAL_EVENT.FINISH }).step,
    TUTORIAL.COMPLETE,
  )
})

test('location errors keep the user on the retryable locate step', () => {
  const state = tutorialReducer(
    { ...createTutorialState(), step: TUTORIAL.LOCATE },
    { type: TUTORIAL_EVENT.LOCATION_ERROR },
  )

  assert.equal(state.step, TUTORIAL.LOCATE)
  assert.equal(state.locationError, true)
  assert.equal(
    tutorialReducer(state, { type: TUTORIAL_EVENT.RETRY_LOCATION }).locationError,
    false,
  )
})

test('tutorial completion is versioned without changing other browser memories', () => {
  const storage = memoryStorage()
  assert.equal(isTutorialComplete(storage), false)
  markTutorialComplete(storage)
  assert.equal(isTutorialComplete(storage), true)
})

test('the temporary tutorial target is about 20m southeast of the user', () => {
  const user = [144.9788, -37.8005]
  const ghost = getTutorialGhostCoordinate(user)
  const meters = distanceMeters(user, ghost)

  assert.ok(meters > 19 && meters < 21, `expected 20m, received ${meters}`)
  assert.ok(ghost[0] > user[0], 'expected the target east of the user')
  assert.ok(ghost[1] < user[1], 'expected the target south of the user')
})

test('every active tutorial step maps to a real semantic target and interaction mode', () => {
  const expected = {
    [TUTORIAL.ZOOM]: ['map', 'passthrough'],
    [TUTORIAL.LOCATE]: ['geolocate', 'passthrough'],
    [TUTORIAL.THOUGHT_MEANING]: ['tutorial-thought', 'capture'],
    [TUTORIAL.THOUGHT_ACCESS]: ['tutorial-thought', 'capture'],
    [TUTORIAL.OPEN_THOUGHT]: ['tutorial-thought', 'passthrough'],
    [TUTORIAL.CARD_BROWSE]: ['thought-card', 'passthrough'],
    [TUTORIAL.CARD_ADD]: ['reader-add', 'passthrough'],
    [TUTORIAL.LONG_PRESS_GHOST]: ['tutorial-ghost', 'passthrough'],
    [TUTORIAL.CHOOSE_NATURE]: ['category-nature', 'passthrough'],
    [TUTORIAL.CARD_ICON]: ['card-icon', 'capture'],
    [TUTORIAL.CARD_TEXT]: ['card-text', 'capture'],
    [TUTORIAL.CARD_PAPER]: ['card-paper-row', 'capture'],
    [TUTORIAL.CARD_CAMERA]: ['card-camera', 'capture'],
    [TUTORIAL.CARD_FONT]: ['card-font', 'capture'],
    [TUTORIAL.CARD_FONT_SIZE]: ['card-font-size', 'capture'],
    [TUTORIAL.CARD_EXIT]: ['card-blank-exit', 'passthrough'],
  }

  for (const [step, [target, mode]] of Object.entries(expected)) {
    assert.equal(STEP_UI[step].target, target)
    assert.equal(STEP_UI[step].mode, mode)
    assert.ok(STEP_UI[step].text.length > 0)
  }
})

test('tutorial category and composer guards only permit the intended draft flow', () => {
  assert.equal(isTutorialCategoryAllowed(TUTORIAL.CHOOSE_NATURE, 'Nature'), true)
  assert.equal(isTutorialCategoryAllowed(TUTORIAL.CHOOSE_NATURE, 'Sound'), false)
  assert.equal(isTutorialCategoryAllowed(TUTORIAL.OFF, 'Sound'), true)
  assert.equal(isTutorialComposerStep(TUTORIAL.CARD_ICON), true)
  assert.equal(isTutorialComposerStep(TUTORIAL.CARD_EXIT), true)
  assert.equal(isTutorialComposerStep(TUTORIAL.LONG_PRESS_GHOST), false)
})

test('spotlight geometry stays inside a phone viewport and blocks everything around it', () => {
  const spotlight = getSpotlightRect(
    { left: 350, top: 780, width: 44, height: 44 },
    { width: 390, height: 844, padding: 12 },
  )
  assert.deepEqual(spotlight, {
    left: 338,
    top: 768,
    width: 52,
    height: 68,
  })

  assert.deepEqual(getSpotlightBlockers(spotlight, { width: 390, height: 844 }), [
    { left: 0, top: 0, width: 390, height: 768 },
    { left: 0, top: 768, width: 338, height: 68 },
    { left: 390, top: 768, width: 0, height: 68 },
    { left: 0, top: 836, width: 390, height: 8 },
  ])
})

test('tutorial drafts forbid every persistent side effect', () => {
  assert.deepEqual(getTutorialDraftPolicy(true), {
    mayPublish: false,
    mayUpload: false,
    mayRecordDwell: false,
  })
  assert.deepEqual(getTutorialDraftPolicy(false), {
    mayPublish: true,
    mayUpload: true,
    mayRecordDwell: true,
  })
})

test('Mapbox owns the marker anchor while a nested visual owns animation', () => {
  assert.deepEqual(getTutorialMarkerPresentation(TUTORIAL.THOUGHT_ACCESS), {
    anchorClass: 'tutorial-marker-anchor is-thought',
    visualClass: 'tutorial-thought-marker-visual is-access',
    target: 'tutorial-thought',
    icon: '🌳',
    interactive: true,
  })
  assert.deepEqual(getTutorialMarkerPresentation(TUTORIAL.LONG_PRESS_GHOST), {
    anchorClass: 'tutorial-marker-anchor is-ghost',
    visualClass: 'tutorial-ghost-drop-visual',
    target: 'tutorial-ghost',
    icon: '',
    interactive: false,
  })
})

test('the 3D map view restores only when tutorial mode ends', () => {
  assert.equal(shouldRestoreTutorialMap(TUTORIAL.CARD_EXIT, TUTORIAL.COMPLETE), false)
  assert.equal(shouldRestoreTutorialMap(TUTORIAL.COMPLETE, TUTORIAL.OFF), true)
  assert.equal(shouldRestoreTutorialMap(TUTORIAL.LONG_PRESS_GHOST, TUTORIAL.OFF), true)
  assert.equal(shouldRestoreTutorialMap(TUTORIAL.OFF, TUTORIAL.OFF), false)
})

test('the tutorial focus loop skips plain spotlight divs and disabled controls', () => {
  const attributes = new Map()
  const node = (tabIndex, disabled = false) => ({
    tabIndex,
    disabled,
    focus() {},
    getAttribute: (name) => attributes.get(name) ?? null,
  })

  assert.equal(isTutorialFocusCandidate(node(-1)), false)
  assert.equal(isTutorialFocusCandidate(node(0, true)), false)
  assert.equal(isTutorialFocusCandidate(node(0)), true)
  attributes.set('aria-hidden', 'true')
  assert.equal(isTutorialFocusCandidate(node(0)), false)
})
