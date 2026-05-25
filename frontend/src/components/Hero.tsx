import { useEffect, useState } from "react"
import { ValidatorCluster } from "./ValidatorCluster"
import { useCountUp } from "../hooks/useCountUp"
import { getAnalysisCount, getAllAnalyses } from "../lib/genlayer"
import "./Hero.css"

export function Hero() {
  const [count, setCount] = useState(0)
  const [avgManipulation, setAvgManipulation] = useState(0)
  const [consensusRate, setConsensusRate] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const c = await getAnalysisCount()
        if (cancelled) return
        setCount(c)
        if (c > 0) {
          const all = await getAllAnalyses()
          if (cancelled || !all || all.length === 0) return
          const manip = all.reduce((s, a) => s + (a.manipulation_score || 0), 0) / all.length
          const dis = all.reduce((s, a) => s + (a.validator_disagreement || 0), 0) / all.length
          setAvgManipulation(Math.round(manip))
          setConsensusRate(Math.max(0, Math.min(100, 100 - Math.round(dis))))
        }
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const animatedCount = useCountUp({ target: count, durationMs: 1400 })
  const animatedManip = useCountUp({ target: avgManipulation, durationMs: 1400 })
  const animatedConsensus = useCountUp({ target: consensusRate, durationMs: 1400 })

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
        <p className="cl-hero__visual-label">Multiple validators reasoning independently</p>
      </div>
    </section>
  )
}