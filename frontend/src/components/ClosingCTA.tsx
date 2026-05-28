import { Link } from "react-router-dom"
import "./ClosingCTA.css"

export function ClosingCTA() {
  return (
    <section className="cl-closing" aria-label="Get started">
      <div className="cl-closing__inner">
        <h2 className="cl-closing__heading">
          Stop skimming. Start <em>seeing.</em>
        </h2>
        <p className="cl-closing__sub">
          The next contract you sign, the next whitepaper you trust, the next policy you accept — run it through ClauseLens first.
        </p>
        <Link to="/analyze" className="cl-closing__cta">Analyze a document →</Link>
      </div>
    </section>
  )
}
