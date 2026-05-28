import { Link } from "react-router-dom"
import "./HeroResultCard.css"

/**
 * A static, stylized preview of a ClauseLens analysis result, embedded in
 * the marketing hero. Shows a predatory ToS being caught: high manipulation,
 * low clarity, strong validator consensus. Intentionally rendered in the
 * dark product aesthetic (on the light marketing page) as a literal window
 * into what the tool produces. Not wired to live data — it is a fixed,
 * representative example.
 */
export function HeroResultCard() {
  return (
    <div className="cl-herocard" aria-label="Example analysis result">
      <div className="cl-herocard__topbar">
        <span className="cl-herocard__dot" aria-hidden="true" />
        <span className="cl-herocard__topbar-label mono">analysis · terms of service · 3 validators</span>
      </div>

      <div className="cl-herocard__snippet">
        <p className="cl-herocard__snippet-text">
          We may modify these terms{" "}
          <mark className="cl-herocard__flag">at any time without notice</mark>, & your continued use
          constitutes{" "}
          <mark className="cl-herocard__flag">binding acceptance</mark>{" "}
          of all changes.
        </p>
      </div>

      <div className="cl-herocard__scores">
        <div className="cl-herocard__score">
          <span className="cl-herocard__score-label">Manipulation</span>
          <div className="cl-herocard__bar">
            <div className="cl-herocard__bar-fill cl-herocard__bar-fill--danger" style={{ width: "85%" }} />
          </div>
          <span className="cl-herocard__score-value mono">85</span>
        </div>
        <div className="cl-herocard__score">
          <span className="cl-herocard__score-label">Clarity</span>
          <div className="cl-herocard__bar">
            <div className="cl-herocard__bar-fill cl-herocard__bar-fill--low" style={{ width: "22%" }} />
          </div>
          <span className="cl-herocard__score-value mono">22</span>
        </div>
        <div className="cl-herocard__score">
          <span className="cl-herocard__score-label">Jargon</span>
          <div className="cl-herocard__bar">
            <div className="cl-herocard__bar-fill cl-herocard__bar-fill--warn" style={{ width: "54%" }} />
          </div>
          <span className="cl-herocard__score-value mono">54</span>
        </div>
      </div>

      <div className="cl-herocard__footer">
        <div className="cl-herocard__consensus">
          <span className="cl-herocard__consensus-label mono">validator disagreement</span>
          <span className="cl-herocard__consensus-value mono">8 · strong consensus</span>
        </div>
        <Link to="/analyze" className="cl-herocard__link">View full analysis →</Link>
      </div>
    </div>
  )
}
