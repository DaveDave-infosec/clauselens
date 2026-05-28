import { Link } from "react-router-dom"
import "./MarketingNav.css"

export function MarketingNav() {
  return (
    <nav className="cl-mktnav" aria-label="Primary">
      <Link to="/" className="cl-mktnav__brand">
        <span className="cl-mktnav__logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mktnav-logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C2410C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>
            </defs>
            <circle cx="13" cy="13" r="9" fill="none" stroke="url(#mktnav-logo-grad)" strokeWidth="2" />
            <circle cx="13" cy="13" r="3" fill="url(#mktnav-logo-grad)" />
            <line x1="19.5" y1="19.5" x2="28" y2="28" stroke="url(#mktnav-logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="cl-mktnav__name">ClauseLens</span>
      </Link>

      <div className="cl-mktnav__links">
        <Link to="/how-it-works" className="cl-mktnav__link">How it works</Link>
        <Link to="/analyze" className="cl-mktnav__cta">Launch app →</Link>
      </div>
    </nav>
  )
}
