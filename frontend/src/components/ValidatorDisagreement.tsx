import "./ValidatorDisagreement.css"

interface ValidatorDisagreementProps {
  score: number // 0-100
}

function tierFor(score: number): {
  tier: 0 | 1 | 2 | 3
  label: string
  description: string
} {
  if (score <= 20) {
    return {
      tier: 0,
      label: "Clear intent",
      description: "The model reads the document's intent as clear and unambiguous",
    }
  }
  if (score <= 50) {
    return {
      tier: 1,
      label: "Somewhat ambiguous",
      description: "The model is less certain here, the document's intent is partially ambiguous",
    }
  }
  if (score <= 80) {
    return {
      tier: 2,
      label: "Highly ambiguous",
      description: "The model reads this document's intent as deliberately unclear",
    }
  }
  return {
    tier: 3,
    label: "Intent unclear",
    description: "The model could not confidently read the intent, so this document may be intentionally deceptive",
  }
}

export function ValidatorDisagreement({ score }: ValidatorDisagreementProps) {
  const v = Math.max(0, Math.min(100, Math.round(score)))
  const { tier, label, description } = tierFor(v)

  // 20 segments, segmented bar visual to distinguish from regular score bars
  const segments = Array.from({ length: 20 }, (_, i) => {
    const segMin = i * 5
    const filled = v > segMin
    return { i, filled }
  })

  return (
    <div className={`cl-disagree cl-disagree--tier-${tier}`}>
      <div className="cl-disagree__header">
        <div className="cl-disagree__title-block">
          <span className="cl-disagree__eyebrow">GenLayer Native</span>
          <h3 className="cl-disagree__title">Intent Ambiguity</h3>
        </div>
        <div className="cl-disagree__value-block">
          <span className="cl-disagree__value mono">{v}</span>
          <span className="cl-disagree__suffix">/100</span>
        </div>
      </div>

      <div className="cl-disagree__meter" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        {segments.map((seg) => (
          <div
            key={seg.i}
            className={`cl-disagree__segment ${seg.filled ? "cl-disagree__segment--filled" : ""}`}
          />
        ))}
        <div
          className="cl-disagree__indicator"
          style={{ left: `${v}%` }}
          aria-hidden="true"
        >
          <div className="cl-disagree__indicator-dot" />
        </div>
      </div>

      <div className="cl-disagree__tier">
        <span className="cl-disagree__tier-label">{label}</span>
        <p className="cl-disagree__tier-description">{description}</p>
      </div>

      <p className="cl-disagree__footnote">
        This score is the model's own confidence about the document's intent, surfaced on-chain and confirmed by GenLayer validator consensus. It is not a measurement of how much validators diverged. Measuring real cross-validator divergence is a planned upgrade.
      </p>
    </div>
  )
}