import { useMemo } from "react"
import type { AnalysisResult as AnalysisResultData } from "../lib/genlayer"
import { parseDangerFlags, shortAddress, explorerAddressUrl } from "../lib/genlayer"
import { normalizeRisk, riskColor, formatTimestamp } from "../lib/utils"
import { APP_PUBLIC_URL } from "../lib/constants"
import { ScoreBar } from "./ScoreBar"
import { DangerFlags } from "./DangerFlags"
import { ValidatorDisagreement } from "./ValidatorDisagreement"
import "./AnalysisResult.css"

interface AnalysisResultProps {
  analysis: AnalysisResultData
  currentWallet?: string | null
}

export function AnalysisResult({ analysis, currentWallet }: AnalysisResultProps) {
  const dangerFlags = useMemo(
    () => parseDangerFlags(analysis.danger_flags),
    [analysis.danger_flags]
  )

  const risk = normalizeRisk(analysis.hidden_risk_level)
  const riskTone = riskColor(analysis.hidden_risk_level)
  const isCritical = risk === "Critical"

  function handleShare() {
    const risk = analysis.hidden_risk_level || "Unknown"
    const type = analysis.document_type || "document"
    const manip = analysis.manipulation_score
    const disagree = analysis.validator_disagreement

    const summary = analysis.human_explanation
      ? truncateForTweet(analysis.human_explanation, 140)
      : ""

    // Determine if the connected wallet is the same one that submitted
    // this analysis. If not, share text uses third-person framing so
    // attribution stays honest.
    const isOwnAnalysis =
      !!currentWallet &&
      !!analysis.submitter &&
      currentWallet.toLowerCase() === analysis.submitter.toLowerCase()

    const opening = isOwnAnalysis
      ? `Just ran a ${type} through ClauseLens.`
      : `Found this on ClauseLens — an AI forensic analysis of a ${type}.`

    const closing = isOwnAnalysis
      ? `On-chain consensus by GenLayer validators.`
      : `On-chain consensus by GenLayer validators. Verify it yourself or run your own analysis.`

    const shareText = [
      opening,
      "",
      `Risk: ${risk.toUpperCase()}`,
      `Manipulation: ${manip}/100`,
      `Validator disagreement: ${disagree}/100`,
      "",
      summary ? `"${summary}"` : "",
      "",
      closing,
      `${APP_PUBLIC_URL}`,
    ]
      .filter(Boolean)
      .join("\n")

    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(intentUrl, "_blank", "noopener,noreferrer")
  }

  function truncateForTweet(text: string, maxLen: number): string {
    if (!text) return ""
    const trimmed = text.trim()
    if (trimmed.length <= maxLen) return trimmed
    return trimmed.slice(0, maxLen - 1).trimEnd() + "…"
  }

  return (
    <article className="cl-result fade-in" aria-label="Document analysis result">
      <header className="cl-result__header">
        <div className="cl-result__header-left">
          <span className="cl-result__doc-type">{analysis.document_type}</span>
          <span
            className={`cl-result__risk-badge ${isCritical ? "cl-result__risk-badge--pulse" : ""}`}
            style={{
              color: riskTone,
              borderColor: riskTone,
              background: `${riskTone}1a`,
            }}
          >
            {risk} risk
          </span>
        </div>
        <div className="cl-result__header-right mono">
          <span className="cl-result__id" title={analysis.analysis_id}>
            {analysis.analysis_id}
          </span>
          {analysis.client_timestamp && (
            <span className="cl-result__time">
              {formatTimestamp(analysis.client_timestamp)}
            </span>
          )}
        </div>
      </header>

      <section className="cl-result__explanation">
        <span className="cl-result__explanation-label">What this actually means</span>
        <p className="cl-result__explanation-text">{analysis.human_explanation}</p>
      </section>

      <section className="cl-result__scores">
        <ScoreBar
          label="Manipulation"
          value={analysis.manipulation_score}
          direction="high-is-bad"
        />
        <ScoreBar
          label="Clarity"
          value={analysis.clarity_score}
          direction="high-is-good"
        />
        <ScoreBar
          label="Jargon Inflation"
          value={analysis.jargon_score}
          direction="high-is-bad"
        />
      </section>

      <section className="cl-result__flags">
        <DangerFlags
          flags={dangerFlags}
          manipulationScore={analysis.manipulation_score}
        />
      </section>

      <section className="cl-result__disagree">
        <ValidatorDisagreement score={analysis.validator_disagreement} />
      </section>

      <footer className="cl-result__footer">
        {analysis.submitter && (
          <a
            href={explorerAddressUrl(analysis.submitter)}
            target="_blank"
            rel="noreferrer noopener"
            className="cl-result__submitter mono"
            title={analysis.submitter}
          >
            Submitted by {shortAddress(analysis.submitter)} ↗
          </a>
        )}
        <button
          className="cl-result__share"
          onClick={handleShare}
          type="button"
          title="Share this analysis on X"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M11.5 1.5h2.5L9.1 7.5l5.4 7H10l-3.4-4.6L2.7 14.5H.2L5.5 8.5.3 1.5h4.5L8 5.7l3.5-4.2zM10.6 13.2h1.4L4.3 2.7H2.8l7.8 10.5z"/>
          </svg>
          <span>Share on X</span>
        </button>
      </footer>
    </article>
  )
}