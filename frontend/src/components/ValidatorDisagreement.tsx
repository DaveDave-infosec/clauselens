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
      label: "Strong consensus",
      description: "Validators reached strong consensus on intent",
    }
  }
  if (score <= 50) {
    return {
      tier: 1,
      label: "Partial agreement",
      description: "Some interpretive disagreement detected — intent is partially ambiguous",
    }
  }
  if (score <= 80) {
    return {
      tier: 2,
      label: "Significant disagreement",
      description: "Significant validator disagreement — this document's intent is deliberately unclear",
    }
  }
  return {
    tier: 3,
    label: "No consensus",
    description: "Validators could not agree — this document may be intentionally deceptive",
  }
}

export function ValidatorDisagreement({ score }: ValidatorDisagreementProps) {
  const v = Math.max(0, Math.min(100, Math.round(score)))
  const { tier, label, description } = tierFor(v)

  // 20 segments — segmented bar visual to distinguish from regular score bars
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
          <h3 className="cl-disagree__title">Validator Disagreement</h3>
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
        Traditional chains cannot surface this. GenLayer validators reason independently — when they diverge on intent, that divergence is itself signal.
      </p>
    </div>
  )
}