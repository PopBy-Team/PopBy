import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  TUTORIAL,
  TUTORIAL_EVENT,
  createTutorialState,
  isTutorialComplete,
  markTutorialComplete,
  tutorialReducer,
} from './tutorialSteps'

export function useTutorialController() {
  const shouldAutoStartRef = useRef(!isTutorialComplete())
  const startedRef = useRef(false)
  const [state, dispatch] = useReducer(tutorialReducer, undefined, createTutorialState)
  const [locateRequest, setLocateRequest] = useState(0)

  const startIfNeeded = useCallback(() => {
    if (!shouldAutoStartRef.current || startedRef.current) return
    startedRef.current = true
    dispatch({ type: TUTORIAL_EVENT.START })
  }, [])

  const replay = useCallback(() => {
    startedRef.current = true
    dispatch({ type: TUTORIAL_EVENT.START })
  }, [])

  const onZoom = useCallback((direction) => {
    dispatch({ type: TUTORIAL_EVENT.ZOOMED, direction })
  }, [])

  const onLocated = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.LOCATED })
  }, [])

  const onLocationError = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.LOCATION_ERROR })
  }, [])

  const retryLocation = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.RETRY_LOCATION })
    setLocateRequest((value) => value + 1)
  }, [])

  const next = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.ADVANCE })
  }, [])

  const onThoughtOpened = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.THOUGHT_OPENED })
  }, [])

  const onCardBrowsed = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.CARD_BROWSED })
  }, [])

  const onCardAddSelected = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.CARD_ADD_SELECTED })
  }, [])

  const onTutorialLongPress = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.GHOST_LONG_PRESSED })
  }, [])

  const onNatureSelected = useCallback(() => {
    dispatch({ type: TUTORIAL_EVENT.NATURE_SELECTED })
  }, [])

  const finish = useCallback(() => {
    markTutorialComplete()
    shouldAutoStartRef.current = false
    dispatch({ type: TUTORIAL_EVENT.FINISH })
  }, [])

  const skip = useCallback(() => {
    markTutorialComplete()
    shouldAutoStartRef.current = false
    dispatch({ type: TUTORIAL_EVENT.STOP })
  }, [])

  useEffect(() => {
    if (state.step !== TUTORIAL.COMPLETE) return undefined
    const timer = window.setTimeout(() => {
      dispatch({ type: TUTORIAL_EVENT.STOP })
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [state.step])

  return {
    ...state,
    active: state.step !== TUTORIAL.OFF,
    locateRequest,
    startIfNeeded,
    replay,
    onZoom,
    onLocated,
    onLocationError,
    retryLocation,
    next,
    onThoughtOpened,
    onCardBrowsed,
    onCardAddSelected,
    onTutorialLongPress,
    onNatureSelected,
    finish,
    skip,
  }
}
