import { useMemo, useState } from "react"
import type { AnalysisResult } from "../lib/genlayer"
import { normalizeRisk, riskColor, formatTimestamp, truncate } from "../lib/utils"
import { iconForDocType } from "../lib/docTypeIcons"
import { shortAddress } from "../lib/genlayer"
import "./RecentAnalyses.css"

interface RecentAnalysesProps {
  analyses: AnalysisResult[]
  isLoading: boolean
  error: string | null
  onSelect: (analysis: AnalysisResult) => void
  selectedId?: string
  currentWallet?: string | null
}

type FilterMode = "mine" | "public"

export function RecentAnalyses({
  analyses,
  isLoading,
  error,
  onSelect,
  selectedId,
  currentWallet,
}: RecentAnalysesProps) {
  const [expanded, setExpanded] = useState(true)
  const [filterMode, setFilterMode] = useState<FilterMode>("mine")

  // "Mine" filter — show only analyses where the locally-known submitter
  // matches the currently connected wallet address (case-insensitive).
  const filteredAnalyses = useMemo(() => {
    if (filterMode === "public") return analyses
    if (!currentWallet) return []
    const target = currentWallet.toLowerCase()
    return analyses.filter(
      (a) => a.submitter && a.submitter.toLowerCase() === target
    )
  }, [analyses, filterMode, currentWallet])

  return (
    <section className="cl-feed" aria-label="Recent analyses">
      <div className="cl-feed__header">
        <div className="cl-feed__title-block">
          <h2 className="cl-feed__title">
            {filterMode === "mine" ? "My Analyses" : "Public Feed"}
          </h2>
          <span className="cl-feed__count mono">{filteredAnalyses.length}</span>
        </div>
        <div className="cl-feed__header-actions">
          <div className="cl-feed__toggle-group" role="tablist" aria-label="Filter analyses">
            <button
              className={`cl-feed__toggle-btn ${filterMode === "mine" ? "cl-feed__toggle-btn--active" : ""}`}
              onClick={() => setFilterMode("mine")}
              type="button"
              role="tab"
              aria-selected={filterMode === "mine"}
              disabled={!currentWallet}
              title={!currentWallet ? "Connect wallet to view your analyses" : undefined}
            >
              My View
            </button>
            <button
              className={`cl-feed__toggle-btn ${filterMode === "public" ? "cl-feed__toggle-btn--active" : ""}`}
              onClick={() => setFilterMode("public")}
              type="button"
              role="tab"
              aria-selected={filterMode === "public"}
            >
              Public Feed
            </button>
          </div>
          <button
            className="cl-feed__expand"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            type="button"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {error && <p className="cl-feed__error">{error}</p>}

          {isLoading && filteredAnalyses.length === 0 && (
            <p className="cl-feed__loading">Loading from chain…</p>
          )}

          {!isLoading && filteredAnalyses.length === 0 && !error && (
            <div className="cl-feed__empty">
              {filterMode === "mine" ? (
                <>
                  <p>No analyses submitted from this browser yet.</p>
                  <p className="cl-feed__empty-sub">
                    {currentWallet
                      ? "Submit a document above to see it here. Or switch to Public Feed to see what others have analyzed."
                      : "Connect your wallet & submit a document to see it here."}
                  </p>
                </>
              ) : (
                <>
                  <p>No documents analyzed yet on this contract.</p>
                  <p className="cl-feed__empty-sub">Be the first to test something suspicious.</p>
                </>
              )}
            </div>
          )}

          {filteredAnalyses.length > 0 && (
            <ul className="cl-feed__list">
              {filteredAnalyses.map((a) => {
                const risk = normalizeRisk(a.hidden_risk_level)
                const tone = riskColor(a.hidden_risk_level)
                const isSelected = a.analysis_id === selectedId
                const manipPct = Math.max(0, Math.min(100, a.manipulation_score))
                const isYours =
                  currentWallet &&
                  a.submitter &&
                  a.submitter.toLowerCase() === currentWallet.toLowerCase()

                return (
                  <li key={a.analysis_id}>
                    <button
                      className={`cl-feed-card cl-glass-soft ${isSelected ? "cl-feed-card--selected" : ""}`}
                      onClick={() => onSelect(a)}
                      type="button"
                    >
                      <div className="cl-feed-card__top">
                        <span className="cl-feed-card__icon" style={{ color: tone }}>
                          {iconForDocType(a.document_type)}
                        </span>
                        <span className="cl-feed-card__doc-type">{a.document_type}</span>
                        <span
                          className="cl-feed-card__risk"
                          style={{ color: tone, borderColor: tone, background: `${tone}1a` }}
                        >
                          {risk}
                        </span>
                      </div>

                      <p className="cl-feed-card__explanation">
                        {truncate(a.human_explanation, 160)}
                      </p>

                      <div className="cl-feed-card__meter-wrap">
                        <div className="cl-feed-card__meter">
                          <div
                            className="cl-feed-card__meter-fill"
                            style={{
                              width: `${manipPct}%`,
                              background: `linear-gradient(90deg, ${tone}66, ${tone})`,
                              boxShadow: `0 0 8px ${tone}44`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="cl-feed-card__bottom">
                        <span className="cl-feed-card__metric">
                          <span className="cl-feed-card__metric-label">Manipulation</span>
                          <span
                            className="cl-feed-card__metric-value mono"
                            style={{ color: tone }}
                          >
                            {a.manipulation_score}
                          </span>
                        </span>
                        <span className="cl-feed-card__metric">
                          <span className="cl-feed-card__metric-label">Disagreement</span>
                          <span className="cl-feed-card__metric-value mono">
                            {a.validator_disagreement}
                          </span>
                        </span>
                        <span className="cl-feed-card__id mono">
                          {filterMode === "public" && a.submitter ? (
                            <>
                              {isYours && <span className="cl-feed-card__yours">YOU</span>}
                              {!isYours && (
                                <span className="cl-feed-card__submitter">
                                  by {shortAddress(a.submitter)}
                                </span>
                              )}
                              {" · "}
                            </>
                          ) : null}
                          {a.analysis_id}
                          {a.client_timestamp && (
                            <span className="cl-feed-card__time">
                              {" · "}
                              {formatTimestamp(a.client_timestamp)}
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}