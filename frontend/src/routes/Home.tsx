import { useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import { MarketingNav } from "../components/MarketingNav"
import { HeroResultCard } from "../components/HeroResultCard"
import { HowItWorksStrip } from "../components/HowItWorksStrip"
import { WhatItCatches } from "../components/WhatItCatches"
import { FAQ } from "../components/FAQ"
import { ClosingCTA } from "../components/ClosingCTA"
import { MarketingFooter } from "../components/MarketingFooter"
import { useAnalysisStats } from "../hooks/useAnalysisStats"
import { useCountUp } from "../hooks/useCountUp"
import "./Home.css"

export default function Home() {
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = "marketing"
  }, [])

  const stats = useAnalysisStats()
  const animatedCount = useCountUp({ target: stats.count, durationMs: 1400 })
  const animatedManip = useCountUp({ target: stats.avgManipulation, durationMs: 1400 })
  const animatedConsensus = useCountUp({ target: stats.consensusRate, durationMs: 1400 })

  return (
    <div className="cl-home">
      <MarketingNav />

      <main className="cl-home__main">
        <section className="cl-home-hero">
          <div className="cl-home-hero__copy">
            <span className="cl-home-hero__eyebrow">
              <span className="cl-home-hero__eyebrow-dot" />
              Live on GenLayer Studio
            </span>

            <h1 className="cl-home-hero__headline">
              Every document is hiding something. <em>Find out what.</em>
            </h1>

            <p className="cl-home-hero__sub">
              Paste any contract, whitepaper, or privacy policy & independent AI validators on GenLayer
              reason about what it actually does — surfacing the manipulation, the jargon, & the clauses
              you would have skimmed past.
            </p>

            <div className="cl-home-hero__ctas">
              <Link to="/analyze" className="cl-home-hero__cta-primary">
                Analyze a document →
              </Link>
              <Link to="/how-it-works" className="cl-home-hero__cta-secondary">
                How it works
              </Link>
            </div>

            <div className="cl-home-hero__stats">
              <div className="cl-home-stat">
                <span className="cl-home-stat__value mono">{animatedCount}</span>
                <span className="cl-home-stat__label">Documents analyzed</span>
              </div>
              <div className="cl-home-stat">
                <span className="cl-home-stat__value mono">
                  {animatedManip}
                  <span className="cl-home-stat__suffix">/100</span>
                </span>
                <span className="cl-home-stat__label">Avg manipulation</span>
              </div>
              <div className="cl-home-stat">
                <span className="cl-home-stat__value mono">
                  {animatedConsensus}
                  <span className="cl-home-stat__suffix">%</span>
                </span>
                <span className="cl-home-stat__label">Validator consensus</span>
              </div>
            </div>
          </div>

          <div className="cl-home-hero__visual">
            <HeroResultCard />
          </div>
        </section>

        <HowItWorksStrip />
        <WhatItCatches />
        <FAQ />
        <ClosingCTA />
      </main>

      <MarketingFooter />
    </div>
  )
}
