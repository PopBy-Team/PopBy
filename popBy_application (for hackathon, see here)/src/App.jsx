import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import ProgressCard from './components/ProgressCard'
import Toast from './components/Toast'
import DropComposer from './components/DropComposer'
import ThoughtSheet from './components/ThoughtSheet'
import OnboardingTour from './components/OnboardingTour'
import CoachTip from './components/CoachTip'
import {
  getLocationThoughts,
  getMapLocations,
  getSuburbProgress,
  unlockLocation,
} from './lib/api'
import { DEMO_LOCATION, DEMO_MODE, getDeviceId } from './lib/device'
import { distanceMeters } from './lib/geo'
import { getDropPermission } from './lib/dropIntent'
import {
  completeOnboarding,
  getCoachTipPolicy,
  getMapStatus,
  markTipShown,
  friendlyPublishError,
  getLockedAreaTip,
} from './lib/guidance'
import { shouldDismissProgress } from './lib/mapPresentation'
import { setPageZoomLocked } from './lib/mapLifecycle'
import { getSafeAnchor } from './lib/privacy'
import TutorialOverlay from './tutorial/TutorialOverlay'
import { TUTORIAL } from './tutorial/tutorialSteps'
import { useTutorialController } from './tutorial/useTutorialController'

const EMPTY_STATS = {
  active_locations: 0,
  total_thoughts: 0,
  unique_contributors: 0,
  successful_unlocks: 0,
  progress: 0,
}

function makeTutorialThoughts() {
  const now = Date.now()
  return [
    {
      id: 'tutorial-thought-newest',
      category: 'Nature',
      body: 'New leaves found the afternoon light before I did.',
      background_type: 'lined',
      background_color: 'white',
      font_family: 'caveat',
      font_size: 16,
      image_url: null,
      music_url: null,
      created_at: new Date(now).toISOString(),
      is_own: false,
    },
    {
      id: 'tutorial-thought-oldest',
      category: 'Sound',
      body: 'A tram bell, two magpies, then a tiny pocket of quiet.',
      background_type: 'dots',
      background_color: 'white',
      font_family: 'patrick-hand',
      font_size: 14,
      image_url: null,
      music_url: null,
      created_at: new Date(now - 60000).toISOString(),
      is_own: false,
    },
  ]
}

export default function App() {
  const deviceId = useMemo(() => getDeviceId(), [])
  const tutorial = useTutorialController()
  const [userLocation, setUserLocation] = useState(DEMO_MODE ? DEMO_LOCATION : null)
  const [mapLocations, setMapLocations] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [mineMode, setMineMode] = useState(false)
  const [dropDraft, setDropDraft] = useState(null)
  const [thoughts, setThoughts] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeLocation, setActiveLocation] = useState(null)
  const [toast, setToast] = useState('')
  const [coachTip, setCoachTip] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [progressDismissed, setProgressDismissed] = useState(false)
  const [areaLabel, setAreaLabel] = useState('MELBOURNE · FITZROY')
  const coachPresentationRef = useRef(0)

  useEffect(() => setPageZoomLocked(sheetOpen || Boolean(dropDraft)), [sheetOpen, dropDraft])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(showToast.timer)
    showToast.timer = window.setTimeout(() => setToast(''), 1900)
  }, [])

  const dismissCoach = useCallback(() => {
    if (coachTip?.rememberOnDismiss && coachTip?.key) markTipShown(coachTip.key)
    setCoachTip(null)
  }, [coachTip])

  const showCoach = useCallback((key, tip) => {
    const policy = getCoachTipPolicy(key)
    if (!policy.shouldShow) return
    coachPresentationRef.current += 1
    setCoachTip({
      key,
      presentationId: coachPresentationRef.current,
      rememberOnDismiss: policy.rememberOnDismiss,
      ...tip,
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [locations, progress] = await Promise.all([
        getMapLocations(deviceId),
        getSuburbProgress('Fitzroy'),
      ])

      const enriched = (locations || []).map((loc) => {
        const coordinate = [Number(loc.lng), Number(loc.lat)]
        const meters = distanceMeters(userLocation, coordinate)

        return {
          ...loc,
          lat: Number(loc.lat),
          lng: Number(loc.lng),
          thought_count: Number(loc.thought_count),
          isMine: Boolean(loc.is_mine),
          isUnlocked: Boolean(loc.is_unlocked),
          distanceMeters: meters,
          isClose: meters <= 50,
          isApproaching: meters > 50 && meters <= 120,
        }
      })

      setMapLocations(enriched)
      setStats(progress || EMPTY_STATS)
    } catch (error) {
      console.error(error)
      showToast('Database not ready')
    } finally {
      setLoading(false)
    }
  }, [deviceId, userLocation, showToast])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function openLocation(loc) {
    dismissCoach()
    setActiveLocation(loc)

    if (mineMode && loc.isMine) {
      try {
        const data = await getLocationThoughts(loc.location_id, deviceId, true)
        setThoughts(data || [])
        setSheetOpen(true)
      } catch (error) {
        showToast(error.message)
      }
      return
    }

    if (!loc.isUnlocked) {
      if (!userLocation) {
        showCoach('location_required', {
          position: 'bottom-right',
          eyebrow: 'Location needed',
          title: 'Turn on your location',
          body: 'Tap the ◎ control in the bottom-right. PopBy uses your live position to check the 50m unlock and drop rules.',
        })
        return
      }

      if (!loc.isClose) {
        showCoach('unlock_distance', {
          position: 'center',
          eyebrow: loc.isApproaching ? 'Approaching…' : 'Get closer',
          title: 'Thoughts unlock within 50m',
          body: loc.isApproaching
            ? 'You’re nearly there. Keep moving toward this icon and it will glow when it becomes unlockable.'
            : 'This Thought is waiting there. Head closer to discover it.',
        })
        return
      }

      try {
        await unlockLocation(deviceId, loc.location_id, userLocation)
        await refresh()
      } catch (error) {
        showToast(error.message)
        return
      }
    }

    try {
      const data = await getLocationThoughts(loc.location_id, deviceId, false)
      setThoughts(data || [])
      setSheetOpen(true)
    } catch (error) {
      showToast(error.message)
    }
  }

  function handleLongPress(coordinate) {
    dismissCoach()
    const permission = getDropPermission(userLocation, coordinate)
    if (!permission.allowed) {
      showDropPermissionTip(permission)
      return
    }

    setDropDraft({ coordinate, category: null, targetLocationId: null })
  }

  function showDropPermissionTip(permission) {
    const copy = {
      location_required: {
        key: 'drop_location_required',
        position: 'bottom-right',
        eyebrow: 'Before you add',
        title: 'Turn on your location',
        body: 'PopBy needs your position before you add here.',
      },
      outside_active_area: {
        key: 'drop_area',
        position: 'center',
        title: 'This area isn’t open yet',
      },
      too_far: {
        key: 'drop_distance',
        position: 'center',
        eyebrow: 'Before you add',
        title: 'Move closer to add here',
        body: `This place is about ${Math.round(permission.distanceMeters)}m away. Walk over when you’re ready to leave a Thought here.`,
      },
    }[permission.reason]

    if (copy) showCoach(copy.key, copy)
  }

  function beginDropAtLocation(location, openComposer = false) {
    if (!location) return
    dismissCoach()
    const coordinate = [Number(location.lng), Number(location.lat)]
    const permission = getDropPermission(userLocation, coordinate)
    if (!permission.allowed) {
      showDropPermissionTip(permission)
      return
    }

    setSheetOpen(false)
    setDropDraft({
      coordinate,
      category: openComposer ? 'Moment' : null,
      targetLocationId: location.location_id,
    })
  }

  function completeTour() {
    completeOnboarding()
    setShowOnboarding(false)
  }

  function replayAnimatedTutorial() {
    setShowOnboarding(false)
    setCoachTip(null)
    setSheetOpen(false)
    setThoughts([])
    setActiveLocation(null)
    setDropDraft(null)
    tutorial.replay()
  }

  function skipAnimatedTutorial() {
    setSheetOpen(false)
    setThoughts([])
    setActiveLocation(null)
    setDropDraft(null)
    tutorial.skip()
  }

  function openTutorialThought(coordinate) {
    const location = {
      location_id: 'tutorial-location',
      suburb: 'Fitzroy',
      lng: coordinate[0],
      lat: coordinate[1],
      is_mine: false,
      is_unlocked: true,
    }
    setActiveLocation(location)
    setThoughts(makeTutorialThoughts())
    setSheetOpen(true)
    tutorial.onThoughtOpened()
  }

  function toggleMine() {
    const next = !mineMode
    setMineMode(next)

    if (next) {
      showCoach('mine', {
        position: 'top-right',
        eyebrow: 'Mine is on',
        title: 'Only your memories are showing',
        body: 'Your own Thought locations stay easy to find and can be opened from anywhere. Other people’s Thoughts at the same location stay hidden in Mine.',
      })
    }
  }

  function showLockedSuburb(name) {
    setCoachTip(getLockedAreaTip(name))
  }

  const visibleLocations = mineMode
    ? mapLocations.filter((loc) => loc.isMine)
    : mapLocations
  const mapStatus = getMapStatus({
    loading,
    mineMode,
    locationCount: visibleLocations.length,
  })

  return (
    <main
      className={`app ${tutorial.active ? 'tutorial-active' : ''}`.trim()}
      data-tutorial-step={tutorial.step}
    >
      <MapView
        locations={visibleLocations}
        progress={Number(stats.progress || 0)}
        userLocation={userLocation}
        dropCoordinate={dropDraft && !dropDraft.category ? dropDraft.coordinate : null}
        onDropCategorySelect={(category, privacy) => {
          if (dropDraft?.tutorial) {
            setDropDraft((current) => current ? { ...current, category, privacy } : null)
            tutorial.onNatureSelected()
            return
          }
          setDropDraft((current) => current ? {
            ...current,
            category,
            privacy,
            anchorMoved: Boolean(
              privacy?.insideBuilding
              && Number(privacy?.distanceMeters || 0) > 0.5
            ),
          } : null)
        }}
        onDropAnchorResolve={(coordinate) => getSafeAnchor(coordinate)}
        onDropResolveError={(error) => {
          setDropDraft(null)
          const friendly = friendlyPublishError(error.message)
          setCoachTip({
            position: 'center',
            eyebrow: 'Safer location',
            ...friendly,
          })
        }}
        onDropCancel={() => setDropDraft(null)}
        onUserLocation={(coordinate) => {
          setUserLocation(coordinate)
          if (coachTip?.key === 'locate' || coachTip?.key === 'location_required') {
            dismissCoach()
          }
        }}
        onLocationClick={openLocation}
        onLocationLongPress={(location) => beginDropAtLocation(location, false)}
        onLongPress={handleLongPress}
        onLockedSuburbClick={showLockedSuburb}
        onViewportModeChange={(viewportMode) => {
          setProgressDismissed((current) =>
            shouldDismissProgress(current, 'zoomend', viewportMode)
          )
        }}
        onAreaLabelChange={setAreaLabel}
        tutorialStep={tutorial.step}
        tutorialLocateRequest={tutorial.locateRequest}
        onMapReady={tutorial.startIfNeeded}
        onTutorialZoom={tutorial.onZoom}
        onTutorialLocated={tutorial.onLocated}
        onTutorialLocationError={tutorial.onLocationError}
        onTutorialThoughtOpen={openTutorialThought}
        onTutorialLongPress={(coordinate) => {
          setDropDraft({
            coordinate,
            category: null,
            targetLocationId: null,
            tutorial: true,
          })
          tutorial.onTutorialLongPress()
        }}
      />

      {mapStatus && !showOnboarding && !tutorial.active && (
        <div className="map-status" role="status" aria-live="polite">
          <strong>{mapStatus.title}</strong>
          <span>{mapStatus.body}</span>
        </div>
      )}

      <ProgressCard stats={stats} hidden={progressDismissed} />

      <div className="brand-mark">PopBy</div>

      <button
        className={mineMode ? 'mine-toggle active' : 'mine-toggle'}
        onClick={toggleMine}
        type="button"
        disabled={tutorial.active}
        aria-pressed={mineMode}
        aria-label={mineMode ? 'Show all Thoughts' : 'Show only my Thoughts'}
        title="Mine"
      >
        Mine
      </button>

      <button
        className="guide-button"
        data-tutorial-id="guide-button"
        onClick={() => {
          setCoachTip(null)
          setShowOnboarding(true)
        }}
        type="button"
        disabled={tutorial.active}
        aria-label="Open PopBy guide"
      >
        ?
      </button>

      <div className="demo-badge" aria-live="polite">{areaLabel}</div>

      <Toast message={toast} />

      <CoachTip
        key={coachTip?.presentationId}
        tip={coachTip}
        onDismiss={dismissCoach}
      />

      {showOnboarding && (
        <OnboardingTour onComplete={completeTour} onReplay={replayAnimatedTutorial} />
      )}

      {dropDraft?.category && (
        <DropComposer
          rawCoordinate={dropDraft.coordinate}
          initialCategory={dropDraft.category}
          userLocation={userLocation}
          deviceId={deviceId}
          targetLocationId={dropDraft.targetLocationId}
          privacyResult={dropDraft.privacy}
          showAnchorNotice={dropDraft.anchorMoved}
          tutorialMode={Boolean(dropDraft.tutorial)}
          tutorialStep={tutorial.step}
          onTutorialFinish={() => {
            setDropDraft(null)
            tutorial.finish()
          }}
          onClose={() => setDropDraft(null)}
          onPublished={async () => {
            showToast('Thought dropped')
            await refresh()

            showCoach('after_drop', {
              position: 'top-right',
              eyebrow: 'Saved',
              title: 'Find it again with Mine',
              body: 'Turn on Mine to show only your own Thought locations. Your own cards can be reopened remotely.',
            })
          }}
        />
      )}

      {sheetOpen && (
        <ThoughtSheet
          thoughts={thoughts}
          location={activeLocation}
          deviceId={deviceId}
          onClose={() => setSheetOpen(false)}
          onReported={refresh}
          onDeleted={async (thoughtId) => {
            setThoughts((current) => current.filter((thought) => thought.id !== thoughtId))
            await refresh()
          }}
          onAdd={(location) => {
            if (tutorial.step === TUTORIAL.CARD_ADD) {
              setSheetOpen(false)
              setThoughts([])
              setActiveLocation(null)
              tutorial.onCardAddSelected()
              return
            }
            beginDropAtLocation(location, true)
          }}
          tutorialMode={tutorial.step === TUTORIAL.CARD_BROWSE || tutorial.step === TUTORIAL.CARD_ADD}
          onTutorialBrowse={tutorial.onCardBrowsed}
        />
      )}

      <TutorialOverlay
        step={tutorial.step}
        zoom={tutorial.zoom}
        locationError={tutorial.locationError}
        onAdvance={tutorial.next}
        onRetryLocation={tutorial.retryLocation}
        onSkip={skipAnimatedTutorial}
      />
    </main>
  )
}
