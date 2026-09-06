import { useState } from 'react'
import { ONBOARDING_STEPS } from '../lib/guidance'

export default function OnboardingTour({ onComplete, onReplay }) {
  const [index, setIndex] = useState(0)
  const step = ONBOARDING_STEPS[index]
  const isLast = index === ONBOARDING_STEPS.length - 1

  function next() {
    if (isLast) {
      onComplete?.()
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div
      className="onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onComplete?.()
      }}
    >
      <section
        className="onboarding-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="onboarding-visual">{step.visual}</div>

        <div className="onboarding-eyebrow">
          {step.eyebrow}
          <span>{index + 1}/{ONBOARDING_STEPS.length}</span>
        </div>

        <h1>{step.title}</h1>
        <p>{step.body}</p>

        {step.legend && (
          <div className="onboarding-legend" aria-label="Thought category icons">
            {step.legend.map((item) => (
              <span key={item.name}>
                <b aria-hidden="true">{item.icon}</b>
                {item.name}
              </span>
            ))}
          </div>
        )}

        <div className="onboarding-note">{step.note}</div>

        {onReplay && (
          <button className="onboarding-replay" type="button" onClick={onReplay}>
            Replay animated field guide
          </button>
        )}

        <div className="onboarding-dots" aria-hidden="true">
          {ONBOARDING_STEPS.map((_, i) => (
            <span key={i} className={i === index ? 'active' : ''} />
          ))}
        </div>

        <div className="onboarding-actions">
          {index > 0 ? (
            <button className="secondary-button" onClick={() => setIndex((i) => i - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}

          <button className="primary-button compact" onClick={next}>
            {isLast ? 'Start exploring' : 'Next'}
          </button>
        </div>
      </section>
    </div>
  )
}
