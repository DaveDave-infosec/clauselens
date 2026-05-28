import { ValidatorCluster } from "./ValidatorCluster"
import { useCountUp } from "../hooks/useCountUp"
import { useAnalysisStats } from "../hooks/useAnalysisStats"
import "./Hero.css"

export function Hero() {
  const stats = useAnalysisStats()

  const animatedCount = useCountUp({ target: stats.count, durationMs: 1400 })
  const animatedManip = useCountUp({ target: stats.avgManipulation, durationMs: 1400 })
  const animatedConsensus = useCountUp({ target: stats.consensusRate, durationMs: 1400 })

  return (
    <section className="cl-hero">
      <div className="cl-hero__copy">
        <span className="cl-hero__eyebrow">
          <span className="cl-hero__eyebrow-dot" />
          Live on GenLayer Studio
        </span>
        <h1 className="cl-hero__headline">
          Read what documents <em>actually</em> say.
        </h1>
        <p className="cl-hero__sub">
          Independent AI validators reason about your document, reach consensus on its hidden intent,
          & surface the manipulation that lawyers, marketers, & whitepapers bury in plain sight.
        </p>
        <div className="cl-hero__stats">
          <div className="cl-stat">
            <span className="cl-stat__value mono">{animatedCount}</span>
            <span className="cl-stat__label">Documents analyzed</span>
          </div>
          <div className="cl-stat">
            <span className="cl-stat__value mono">
              {animatedManip}
              <span className="cl-stat__suffix">/100</span>
            </span>
            <span className="cl-stat__label">Avg manipulation</span>
          </div>
          <div className="cl-stat">
            <span className="cl-stat__value mono">
              {animatedConsensus}
              <span className="cl-stat__suffix">%</span>
            </span>
            <span className="cl-stat__label">Validator consensus</span>
          </div>
        </div>
      </div>
      <div className="cl-hero__visual">
        <ValidatorCluster />
      </div>
    </section>
  )
}
