import { useCallback, useEffect, useMemo, useState } from 'react'
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
import {
  completeOnboarding,
  getMapStatus,
  isOnboardingComplete,
  markTipShown,
  shouldShowTip,
} from './lib/guidance'
import { pointInsideFitzroy } from './data/suburbs'

const EMPTY_STATS = {
  active_locations: 0,
  total_thoughts: 0,
  unique_contributors: 0,
  successful_unlocks: 0,
  progress: 0,
}

export default function App() {
  const deviceId = useMemo(() => getDeviceId(), [])
  const [userLocation, setUserLocation] = useState(DEMO_MODE ? DEMO_LOCATION : null)
  const [mapLocations, setMapLocations] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [mineMode, setMineMode] = useState(false)
  const [dropCoordinate, setDropCoordinate] = useState(null)
  const [thoughts, setThoughts] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [coachTip, setCoachTip] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete())
  const [loading, setLoading] = useState(true)

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(showToast.timer)
    showToast.timer = window.setTimeout(() => setToast(''), 1900)
  }, [])

  const dismissCoach = useCallback(() => {
    if (coachTip?.key) markTipShown(coachTip.key)
    setCoachTip(null)
  }, [coachTip])

  const showCoachOnce = useCallback((key, tip) => {
    if (!shouldShowTip(key)) return
    setCoachTip({ key, ...tip })
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
        showCoachOnce('location_required', {
          position: 'bottom-right',
          eyebrow: 'Location needed',
          title: 'Turn on your location',
          body: 'Tap the ◎ control in the bottom-right. PopBy uses your live position to check the 50m unlock and drop rules.',
        })
        return
      }

      if (!loc.isClose) {
        showCoachOnce('unlock_distance', {
          position: 'center',
          eyebrow: loc.isApproaching ? 'Approaching…' : 'Get closer',
          title: 'Thoughts unlock within 50m',
          body: loc.isApproaching
            ? 'You’re nearly there. Keep moving toward this icon and it will glow when it becomes unlockable.'
            : 'This Thought is still too far away. Walk closer and try again.',
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

    if (!userLocation) {
      showCoachOnce('drop_location_required', {
        position: 'bottom-right',
        eyebrow: 'Before you drop',
        title: 'Turn on your location',
        body: 'PopBy needs your live position to confirm the point you choose is within 50m of you.',
      })
      return
    }

    if (!pointInsideFitzroy(coordinate)) {
      showCoachOnce('drop_area', {
        position: 'center',
        eyebrow: 'Awaiting unlock',
        title: 'Drop inside the open area',
        body: 'For this MVP, new Thoughts can only be left inside Fitzroy. Grey suburbs open later as the community reaches the progress goals.',
      })
      return
    }

    const meters = distanceMeters(userLocation, coordinate)
    if (meters > 50) {
      showCoachOnce('drop_distance', {
        position: 'center',
        eyebrow: 'Too far to drop',
        title: 'Long-press within 50m of you',
        body: `That point is about ${Math.round(meters)}m away. Pick somewhere closer to where you’re actually standing.`,
      })
      return
    }

    setDropCoordinate(coordinate)
  }

  function completeTour() {
    completeOnboarding()
    setShowOnboarding(false)

    if (!DEMO_MODE) {
      window.setTimeout(() => {
        showCoachOnce('locate', {
          position: 'bottom-right',
          eyebrow: 'First step',
          title: 'Find yourself on the map',
          body: 'Tap the ◎ location control. You’ll need location access to unlock and drop Thoughts.',
        })
      }, 200)
    } else {
      window.setTimeout(() => {
        showCoachOnce('map_basics', {
          position: 'bottom-left',
          eyebrow: 'Try the map',
          title: 'Zoom out, then zoom back in',
          body: 'Far away, Thoughts appear as dots. Closer in, their category icons and sizes become visible.',
        })
      }, 200)
    }
  }

  function toggleMine() {
    const next = !mineMode
    setMineMode(next)

    if (next) {
      showCoachOnce('mine', {
        position: 'top-right',
        eyebrow: 'Mine is on',
        title: 'Only your memories are showing',
        body: 'Your own Thought locations glow and can be opened from anywhere. Other people’s Thoughts at the same location stay hidden in Mine.',
      })
    }
  }

  function showLockedSuburb(name) {
    setCoachTip({
      position: 'top-left',
      eyebrow: 'Awaiting unlock',
      title: `${name} isn’t open yet`,
      body:
        'Fitzroy must reach all four goals first: 15 active locations, 50 Thoughts, 30 contributors and 50 successful unlocks.',
    })
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
    <main className="app">
      <MapView
        locations={visibleLocations}
        progress={Number(stats.progress || 0)}
        onUserLocation={(coordinate) => {
          setUserLocation(coordinate)
          if (coachTip?.key === 'locate' || coachTip?.key === 'location_required') {
            dismissCoach()
          }
        }}
        onLocationClick={openLocation}
        onLongPress={handleLongPress}
        onLockedSuburbClick={showLockedSuburb}
      />

      {mapStatus && !showOnboarding && (
        <div className="map-status" role="status" aria-live="polite">
          <strong>{mapStatus.title}</strong>
          <span>{mapStatus.body}</span>
        </div>
      )}

      <ProgressCard stats={stats} />

      <div className="brand-mark">PopBy</div>

      <button
        className={mineMode ? 'mine-toggle active' : 'mine-toggle'}
        onClick={toggleMine}
        type="button"
        aria-pressed={mineMode}
      >
        Mine
      </button>

      <button
        className="guide-button"
        onClick={() => {
          setCoachTip(null)
          setShowOnboarding(true)
        }}
        type="button"
        aria-label="Open PopBy guide"
      >
        ?
      </button>

      {DEMO_MODE && (
        <div className="demo-badge">Demo GPS · Fitzroy</div>
      )}

      <Toast message={toast} />

      <CoachTip tip={coachTip} onDismiss={dismissCoach} />

      {showOnboarding && (
        <OnboardingTour onComplete={completeTour} />
      )}

      {dropCoordinate && (
        <DropComposer
          rawCoordinate={dropCoordinate}
          userLocation={userLocation}
          deviceId={deviceId}
          onClose={() => setDropCoordinate(null)}
          onPublished={async () => {
            showToast('Thought dropped')
            await refresh()

            showCoachOnce('after_drop', {
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
          deviceId={deviceId}
          mineMode={mineMode}
          onClose={() => setSheetOpen(false)}
          onReported={refresh}
        />
      )}
    </main>
  )
}
