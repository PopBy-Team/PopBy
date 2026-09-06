import { destination, point } from '@turf/turf'

export const TUTORIAL_KEY = 'popby_tutorial_v3_complete'

export const TUTORIAL = Object.freeze({
  OFF: 'off',
  ZOOM: 'zoom',
  LOCATE: 'locate',
  THOUGHT_MEANING: 'thought_meaning',
  THOUGHT_ACCESS: 'thought_access',
  OPEN_THOUGHT: 'open_thought',
  CARD_BROWSE: 'card_browse',
  CARD_ADD: 'card_add',
  LONG_PRESS_GHOST: 'long_press_ghost',
  CHOOSE_NATURE: 'choose_nature',
  CARD_ICON: 'card_icon',
  CARD_TEXT: 'card_text',
  CARD_PAPER: 'card_paper',
  CARD_CAMERA: 'card_camera',
  CARD_FONT: 'card_font',
  CARD_FONT_SIZE: 'card_font_size',
  CARD_EXIT: 'card_exit',
  COMPLETE: 'complete',
})

export const TUTORIAL_EVENT = Object.freeze({
  START: 'start',
  ZOOMED: 'zoomed',
  LOCATED: 'located',
  LOCATION_ERROR: 'location_error',
  RETRY_LOCATION: 'retry_location',
  ADVANCE: 'advance',
  THOUGHT_OPENED: 'thought_opened',
  CARD_BROWSED: 'card_browsed',
  CARD_ADD_SELECTED: 'card_add_selected',
  GHOST_LONG_PRESSED: 'ghost_long_pressed',
  NATURE_SELECTED: 'nature_selected',
  FINISH: 'finish',
  STOP: 'stop',
})

export const STEP_UI = Object.freeze({
  [TUTORIAL.ZOOM]: {
    target: 'map',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'center',
    text: 'Pinch the city closer — then let it breathe back out.',
    subtext: 'Thoughts change from firefly lights into icons as you move through the map.',
    demo: 'zoom',
  },
  [TUTORIAL.LOCATE]: {
    target: 'geolocate',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Come back to where you are.',
    subtext: 'Your location lets nearby Thoughts glow, open and be created.',
  },
  [TUTORIAL.THOUGHT_MEANING]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'This is a Thought — something someone noticed right here.',
    subtext: 'Its icon hints at what you’ll find inside.',
    demo: 'categories',
  },
  [TUTORIAL.THOUGHT_ACCESS]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'Glow means you’re close enough to look.',
    subtext: 'Within 50m it opens. Further away, it stays quiet until you get closer.',
    demo: 'availability',
  },
  [TUTORIAL.OPEN_THOUGHT]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap the glowing Thought.',
    subtext: 'The real card opens from its place on the map.',
  },
  [TUTORIAL.CARD_BROWSE]: {
    target: 'thought-card',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap either side of the card.',
    subtext: 'Move gently through the Thoughts left at one place.',
    demo: 'cardTap',
  },
  [TUTORIAL.CARD_ADD]: {
    target: 'reader-add',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Add lets you leave your own Thought at this place.',
    subtext: 'Tap it once — this practice Thought will stay private and unsent.',
  },
  [TUTORIAL.LONG_PRESS_GHOST]: {
    target: 'tutorial-ghost',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Press and hold the light to mark a nearby spot.',
    subtext: 'Real drops must be within 50m · 5 per hour · 3 at one place per hour.',
  },
  [TUTORIAL.CHOOSE_NATURE]: {
    target: 'category-nature',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Choose the icon that fits what you noticed.',
    subtext: 'For this practice round, choose Nature.',
  },
  [TUTORIAL.CARD_ICON]: {
    target: 'card-icon',
    shape: 'circle',
    mode: 'capture',
    placement: 'below',
    text: 'Change the Thought icon here.',
    subtext: 'Use the category that feels closest to what you noticed.',
  },
  [TUTORIAL.CARD_TEXT]: {
    target: 'card-text',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'center',
    text: 'Leave your words in the paper.',
    subtext: 'A detail, a feeling, a sound — up to 150 words.',
    demo: 'typing',
  },
  [TUTORIAL.CARD_PAPER]: {
    target: 'card-paper-row',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Give the Thought a paper of its own.',
    subtext: 'Try lines, dots, a grid or a quiet colour.',
  },
  [TUTORIAL.CARD_CAMERA]: {
    target: 'card-camera',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'Or capture what’s in front of you right now.',
    subtext: 'No camera opens during this tutorial.',
    emphasis: 'strong',
  },
  [TUTORIAL.CARD_FONT]: {
    target: 'card-font',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Choose how your words feel.',
    subtext: 'Tap the Aa control whenever you want a different handwriting style.',
    demo: 'font',
  },
  [TUTORIAL.CARD_FONT_SIZE]: {
    target: 'card-font-size',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Make your words quieter or louder.',
    subtext: 'Choose small, medium or big.',
    demo: 'fontSize',
  },
  [TUTORIAL.CARD_EXIT]: {
    target: 'card-blank-exit',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap a blank part of the paper to close.',
    subtext: 'This practice Thought stays a draft. Real drops shift toward a safer nearby path before appearing.',
  },
  [TUTORIAL.COMPLETE]: {
    target: 'guide-button',
    shape: 'circle',
    mode: 'none',
    placement: 'above',
    text: 'You’re ready. Wander a little.',
    subtext: 'Whenever you need a reminder, the ? guide is waiting here.',
  },
})

const COMPOSER_STEPS = new Set([
  TUTORIAL.CARD_ICON,
  TUTORIAL.CARD_TEXT,
  TUTORIAL.CARD_PAPER,
  TUTORIAL.CARD_CAMERA,
  TUTORIAL.CARD_FONT,
  TUTORIAL.CARD_FONT_SIZE,
  TUTORIAL.CARD_EXIT,
])

export function isTutorialComposerStep(step) {
  return COMPOSER_STEPS.has(step)
}

export function isTutorialCategoryAllowed(step, category) {
  return step !== TUTORIAL.CHOOSE_NATURE || category === 'Nature'
}

export function getTutorialDraftPolicy(tutorialMode) {
  const allowed = !tutorialMode
  return {
    mayPublish: allowed,
    mayUpload: allowed,
    mayRecordDwell: allowed,
  }
}

export function isTutorialFocusCandidate(node) {
  return Boolean(
    node
    && !node.disabled
    && node.tabIndex >= 0
    && node.getAttribute?.('aria-hidden') !== 'true'
    && typeof node.focus === 'function'
  )
}

export function getTutorialMarkerPresentation(step) {
  const thoughtSteps = [
    TUTORIAL.THOUGHT_MEANING,
    TUTORIAL.THOUGHT_ACCESS,
    TUTORIAL.OPEN_THOUGHT,
  ]
  if (thoughtSteps.includes(step)) {
    return {
      anchorClass: 'tutorial-marker-anchor is-thought',
      visualClass: `tutorial-thought-marker-visual ${step === TUTORIAL.THOUGHT_ACCESS ? 'is-access' : ''}`.trim(),
      target: 'tutorial-thought',
      icon: '🌳',
      interactive: true,
    }
  }

  if (step === TUTORIAL.LONG_PRESS_GHOST) {
    return {
      anchorClass: 'tutorial-marker-anchor is-ghost',
      visualClass: 'tutorial-ghost-drop-visual',
      target: 'tutorial-ghost',
      icon: '',
      interactive: false,
    }
  }

  return null
}

export function shouldRestoreTutorialMap(previousStep, nextStep) {
  return previousStep !== TUTORIAL.OFF && nextStep === TUTORIAL.OFF
}

const ADVANCE_STEPS = Object.freeze({
  [TUTORIAL.THOUGHT_MEANING]: TUTORIAL.THOUGHT_ACCESS,
  [TUTORIAL.THOUGHT_ACCESS]: TUTORIAL.OPEN_THOUGHT,
  [TUTORIAL.CARD_ICON]: TUTORIAL.CARD_TEXT,
  [TUTORIAL.CARD_TEXT]: TUTORIAL.CARD_PAPER,
  [TUTORIAL.CARD_PAPER]: TUTORIAL.CARD_CAMERA,
  [TUTORIAL.CARD_CAMERA]: TUTORIAL.CARD_FONT,
  [TUTORIAL.CARD_FONT]: TUTORIAL.CARD_FONT_SIZE,
  [TUTORIAL.CARD_FONT_SIZE]: TUTORIAL.CARD_EXIT,
})

export function createTutorialState() {
  return {
    step: TUTORIAL.OFF,
    zoom: { in: false, out: false },
    locationError: false,
  }
}

export function tutorialReducer(state, event) {
  switch (event.type) {
    case TUTORIAL_EVENT.START:
      return { ...createTutorialState(), step: TUTORIAL.ZOOM }
    case TUTORIAL_EVENT.ZOOMED: {
      if (state.step !== TUTORIAL.ZOOM || !['in', 'out'].includes(event.direction)) {
        return state
      }
      const zoom = { ...state.zoom, [event.direction]: true }
      return {
        ...state,
        zoom,
        step: zoom.in && zoom.out ? TUTORIAL.LOCATE : TUTORIAL.ZOOM,
      }
    }
    case TUTORIAL_EVENT.LOCATED:
      return state.step === TUTORIAL.LOCATE
        ? { ...state, step: TUTORIAL.THOUGHT_MEANING, locationError: false }
        : state
    case TUTORIAL_EVENT.LOCATION_ERROR:
      return state.step === TUTORIAL.LOCATE
        ? { ...state, locationError: true }
        : state
    case TUTORIAL_EVENT.RETRY_LOCATION:
      return state.step === TUTORIAL.LOCATE
        ? { ...state, locationError: false }
        : state
    case TUTORIAL_EVENT.ADVANCE:
      return ADVANCE_STEPS[state.step]
        ? { ...state, step: ADVANCE_STEPS[state.step] }
        : state
    case TUTORIAL_EVENT.THOUGHT_OPENED:
      return state.step === TUTORIAL.OPEN_THOUGHT
        ? { ...state, step: TUTORIAL.CARD_BROWSE }
        : state
    case TUTORIAL_EVENT.CARD_BROWSED:
      return state.step === TUTORIAL.CARD_BROWSE
        ? { ...state, step: TUTORIAL.CARD_ADD }
        : state
    case TUTORIAL_EVENT.CARD_ADD_SELECTED:
      return state.step === TUTORIAL.CARD_ADD
        ? { ...state, step: TUTORIAL.LONG_PRESS_GHOST }
        : state
    case TUTORIAL_EVENT.GHOST_LONG_PRESSED:
      return state.step === TUTORIAL.LONG_PRESS_GHOST
        ? { ...state, step: TUTORIAL.CHOOSE_NATURE }
        : state
    case TUTORIAL_EVENT.NATURE_SELECTED:
      return state.step === TUTORIAL.CHOOSE_NATURE
        ? { ...state, step: TUTORIAL.CARD_ICON }
        : state
    case TUTORIAL_EVENT.FINISH:
      return state.step === TUTORIAL.CARD_EXIT
        ? { ...state, step: TUTORIAL.COMPLETE }
        : state
    case TUTORIAL_EVENT.STOP:
      return createTutorialState()
    default:
      return state
  }
}

function getStorage(storage) {
  if (storage) return storage
  if (typeof localStorage !== 'undefined') return localStorage
  throw new Error('Browser storage is not available')
}

export function isTutorialComplete(storage) {
  return getStorage(storage).getItem(TUTORIAL_KEY) === 'true'
}

export function markTutorialComplete(storage) {
  getStorage(storage).setItem(TUTORIAL_KEY, 'true')
}

export function getTutorialGhostCoordinate(userCoordinate) {
  if (!userCoordinate) return null
  return destination(point(userCoordinate), 0.02, 135, {
    units: 'kilometers',
  }).geometry.coordinates
}
