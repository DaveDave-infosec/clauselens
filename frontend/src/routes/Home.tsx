import { useLayoutEffect } from "react"
import { Link } from "react-router-dom"
import "./MarketingPlaceholder.css"

export default function Home() {
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = "marketing"
  }, [])

  return (
    <div className="cl-marketing-placeholder">
      <div className="cl-marketing-placeholder__inner">
        <p className="cl-marketing-placeholder__eyebrow">ClauseLens V2</p>
        <h1 className="cl-marketing-placeholder__title">
          The marketing surface is being rebuilt.
        </h1>
        <p className="cl-marketing-placeholder__body">
          Document forensics on GenLayer. New marketing experience arriving in Phase 3 of the V2 build.
        </p>
        <Link to="/analyze" className="cl-marketing-placeholder__link">
          Open the analyzer →
        </Link>
      </div>
    </div>
  )
}
