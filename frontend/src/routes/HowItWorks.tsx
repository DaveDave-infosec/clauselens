import { useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import "./MarketingPlaceholder.css"

export default function HowItWorks() {
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = "marketing"
  }, [])

  return (
    <div className="cl-marketing-placeholder">
      <div className="cl-marketing-placeholder__inner">
        <p className="cl-marketing-placeholder__eyebrow">How it works</p>
        <h1 className="cl-marketing-placeholder__title">
          Coming in Phase 3.
        </h1>
        <p className="cl-marketing-placeholder__body">
          This page will explain the validator consensus process, the eq_principle primitive, & how disagreement becomes a forensic signal.
        </p>
        <Link to="/" className="cl-marketing-placeholder__link">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
