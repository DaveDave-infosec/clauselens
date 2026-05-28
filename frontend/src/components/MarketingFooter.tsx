import { Link } from "react-router-dom"
import { CONTRACT_ADDRESS, STUDIO_EXPLORER_URL } from "../lib/constants"
import { shortAddress } from "../lib/genlayer"
import "./MarketingFooter.css"

export function MarketingFooter() {
  return (
    <footer className="cl-mktfooter">
      <div className="cl-mktfooter__inner">
        <div className="cl-mktfooter__brand-block">
          <span className="cl-mktfooter__name">ClauseLens</span>
          <p className="cl-mktfooter__tagline">
            Document forensics on GenLayer. Independent AI validators reason about what documents actually do.
          </p>
        </div>

        <div className="cl-mktfooter__links">
          <Link to="/analyze" className="cl-mktfooter__link">Launch app</Link>
          <Link to="/how-it-works" className="cl-mktfooter__link">How it works</Link>
          <a href={`${STUDIO_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer noopener" className="cl-mktfooter__link">
            Contract {shortAddress(CONTRACT_ADDRESS)} ↗
          </a>
          <a href="https://genlayer.com" target="_blank" rel="noreferrer noopener" className="cl-mktfooter__link">
            Built on GenLayer ↗
          </a>
        </div>
      </div>
    </footer>
  )
}