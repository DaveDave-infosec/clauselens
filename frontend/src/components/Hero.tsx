import { ValidatorCluster } from "./ValidatorCluster"
import { useCountUp } from "../hooks/useCountUp"
import { useHeroStats } from "../hooks/useHeroStats"
import "./Hero.css"


interface HeroProps {
  variant?: "analyze" | "verify"
}


export function Hero({ variant = "analyze" }: HeroProps) {
  const stats = useHeroStats(variant)


  const animatedCount = useCountUp({ target: stats.count, durationMs: 1400 })
  const animatedMid = useCountUp({ target: stats.mid, durationMs: 1400 })
  const animatedRight = useCountUp({ target: stats.right, durationMs: 1400 })


  const isVerify = variant === "verify"


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
            <span className="cl-stat__label">{isVerify ? "Claims verified" : "Documents analyzed"}</span>
          </div>
          <div className="cl-stat">
            <span className="cl-stat__value mono">
              {animatedMid}
              {!isVerify && <span className="cl-stat__suffix">/100</span>}
            </span>
            <span className="cl-stat__label">{isVerify ? "Supported" : "Avg manipulation"}</span>
          </div>
          <div className="cl-stat">
            <span className="cl-stat__value mono">
              {animatedRight}
              <span className="cl-stat__suffix">%</span>
            </span>
            <span className="cl-stat__label">Model confidence</span>
          </div>
        </div>
      </div>
      <div className="cl-hero__visual">
        <ValidatorCluster />
      </div>
    </section>
  )
}