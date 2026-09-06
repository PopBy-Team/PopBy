import { destination, distance, point } from '@turf/turf'

export const TUTORIAL_KEY = 'popby_tutorial_v3_complete'

export function shouldForceTutorial(
  search = typeof window !== 'undefined' ? window.location.search : '',
) {
  const value = new URLSearchParams(search).get('tutorial')
  return value === '1' || value === 'true'
}

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
    text: 'Pinch in. Pinch out.',
    subtext: 'Dots become Thought icons up close.',
    demo: 'zoom',
  },
  [TUTORIAL.LOCATE]: {
    target: 'geolocate',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Find yourself.',
    subtext: 'Tap once to center the map.',
  },
  [TUTORIAL.THOUGHT_MEANING]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'These are Thoughts.',
    subtext: 'Each icon shows what someone noticed here.',
    demo: 'categories',
  },
  [TUTORIAL.THOUGHT_ACCESS]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'Near opens. Far waits.',
    subtext: 'Get within 50m to read.',
    demo: 'availability',
  },
  [TUTORIAL.OPEN_THOUGHT]: {
    target: 'tutorial-thought',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap the Thought.',
  },
  [TUTORIAL.CARD_BROWSE]: {
    target: 'thought-card',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap either side.',
    subtext: 'Move between Thoughts.',
    demo: 'cardTap',
  },
  [TUTORIAL.CARD_ADD]: {
    target: 'reader-add',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Add your own.',
    subtext: 'This practice stays private.',
  },
  [TUTORIAL.LONG_PRESS_GHOST]: {
    target: 'tutorial-press-zone',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Press and hold inside the glow.',
    subtext: 'Create within 50m of you.',
  },
  [TUTORIAL.CHOOSE_NATURE]: {
    target: 'category-nature',
    shape: 'circle',
    mode: 'passthrough',
    placement: 'above',
    text: 'Choose Nature.',
  },
  [TUTORIAL.CARD_ICON]: {
    target: 'card-icon',
    shape: 'circle',
    mode: 'capture',
    placement: 'below',
    text: 'Change the icon here.',
  },
  [TUTORIAL.CARD_TEXT]: {
    target: 'card-text',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'center',
    text: 'Write what you noticed.',
    subtext: 'Up to 150 words.',
    demo: 'typing',
  },
  [TUTORIAL.CARD_PAPER]: {
    target: 'card-paper-row',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Choose a background.',
    subtext: 'Paper, pattern or colour.',
  },
  [TUTORIAL.CARD_CAMERA]: {
    target: 'card-camera',
    shape: 'circle',
    mode: 'capture',
    placement: 'above',
    text: 'Take a live photo.',
    subtext: 'The camera stays closed in this practice.',
    emphasis: 'strong',
  },
  [TUTORIAL.CARD_FONT]: {
    target: 'card-font',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Choose a font.',
    demo: 'font',
  },
  [TUTORIAL.CARD_FONT_SIZE]: {
    target: 'card-font-size',
    shape: 'roundRect',
    mode: 'capture',
    placement: 'above',
    text: 'Choose a text size.',
    subtext: 'Small, medium or big.',
    demo: 'fontSize',
  },
  [TUTORIAL.CARD_EXIT]: {
    target: 'card-blank-exit',
    shape: 'roundRect',
    mode: 'passthrough',
    placement: 'above',
    text: 'Tap blank paper to finish.',
    subtext: 'Nothing will be published.',
  },
  [TUTORIAL.COMPLETE]: {
    target: 'guide-button',
    shape: 'circle',
    mode: 'none',
    placement: 'above',
    text: 'You’re ready to explore.',
    subtext: 'Tap ? anytime for help.',
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
      anchorClass: 'tutorial-marker-anchor is-press-zone',
      visualClass: 'tutorial-press-zone-visual',
      target: 'tutorial-press-zone',
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

export function isWithinTutorialPressZone(coordinate, zoneCenter) {
  if (!coordinate || !zoneCenter) return false
  return distance(point(coordinate), point(zoneCenter), {
    units: 'meters',
  }) <= 24
}
