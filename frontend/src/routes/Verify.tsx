import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { AmbientBackground } from "../components/AmbientBackground"
import { Header } from "../components/Header"
import { Hero } from "../components/Hero"
import { useWallet } from "../hooks/useWallet"
import {
  verifyClaim,
  getLastRequestId,
  getAllVerifications,
  explorerAddressUrl,
  type ContractVerificationResult,
} from "../lib/genlayer"
import {
  CONTRACT_ADDRESS,
  ANALYSIS_TIMEOUT_MS,
  ANALYSIS_LONG_WAIT_MS,
  ANALYSIS_POLL_INITIAL_MS,
  ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS,
} from "../lib/constants"
import "./Analyze.css"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type Phase = "idle" | "submitting" | "waiting" | "waiting-long" | "fetching" | "done" | "error"

const VERDICT_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  SUPPORTED: { bg: "#12241a", fg: "#4ade80", label: "Supported" },
  CONTRADICTED: { bg: "#2a1416", fg: "#f87171", label: "Contradicted" },
  NOT_ADDRESSED: { bg: "#2a2410", fg: "#fbbf24", label: "Not addressed" },
  INSUFFICIENT: { bg: "#20232a", fg: "#9ca3af", label: "Insufficient evidence" },
}

const EXAMPLES: { label: string; claim: string; url: string }[] = [
  {
    label: "go-ethereum license",
    claim: "This project is licensed under the GNU General Public License.",
    url: "https://raw.githubusercontent.com/ethereum/go-ethereum/master/COPYING",
  },
  {
    label: "React license",
    claim: "The license in this file is the MIT License.",
    url: "https://raw.githubusercontent.com/facebook/react/main/LICENSE",
  },
  {
    label: "Catch a false claim",
    claim: "This project is licensed under the MIT License.",
    url: "https://raw.githubusercontent.com/ethereum/go-ethereum/master/COPYING",
  },
]

const chipStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "inherit",
  borderRadius: 999,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 13,
}

export default function Verify() {
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = "product"
  }, [])

  const wallet = useWallet()
  const [claim, setClaim] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ContractVerificationResult | null>(null)
  const [recent, setRecent] = useState<ContractVerificationResult[]>([])
  const [feedOpen, setFeedOpen] = useState(true)

  const isVerifying =
    phase === "submitting" || phase === "waiting" || phase === "waiting-long" || phase === "fetching"

  const walletReady = !!wallet.address && wallet.isCorrectChain
  const walletStatusMessage = !wallet.address
    ? "Connect your wallet to verify a claim."
    : !wallet.isCorrectChain
      ? "Switch to GenLayer Studio Network to continue."
      : ""

  const loadingMessage =
    phase === "submitting"
      ? "Submitting to GenLayer…"
      : phase === "waiting"
        ? "The contract is fetching the evidence and validators are reading it…"
        : phase === "waiting-long"
          ? "Still working… consensus is taking longer than usual"
          : phase === "fetching"
            ? "Consensus reached. Fetching the verdict…"
            : ""

  const loadRecent = useCallback(async () => {
    const all = await getAllVerifications()
    setRecent(all.slice(0, 6))
  }, [])

  useEffect(() => {
    loadRecent()
  }, [loadRecent])

  const handleVerify = useCallback(async () => {
    if (!wallet.address) return
    const c = claim.trim()
    const u = evidenceUrl.trim()
    if (c === "" || !u.toLowerCase().startsWith("http")) {
      setError("Enter a claim and a valid http(s) evidence URL.")
      return
    }
    setError(null)
    setResult(null)
    setPhase("submitting")
    try {
      const before = await getAllVerifications()
      const beforeIds = new Set(before.map((r) => r.request_id))
      const priorMatch = before.find((r) => r.claim === c && r.evidence_url === u) || null
      const startLastId = await getLastRequestId()
      await verifyClaim(c, u, wallet.address)

      setPhase("waiting")
      const deadline = Date.now() + ANALYSIS_TIMEOUT_MS
      const longWaitAt = Date.now() + ANALYSIS_LONG_WAIT_MS
      const idempotentGraceAt = Date.now() + 35000
      let found: ContractVerificationResult | null = null

      await sleep(ANALYSIS_POLL_INITIAL_MS)
      while (!found && Date.now() < deadline) {
        if (Date.now() >= longWaitAt) setPhase("waiting-long")
        try {
          const all = await getAllVerifications()
          found = all.find((r) => !beforeIds.has(r.request_id)) || null
          if (!found) {
            const lastId = await getLastRequestId()
            if (lastId && lastId !== startLastId) {
              found = all.find((r) => r.request_id === lastId) || null
            }
          }
          if (!found && priorMatch && Date.now() >= idempotentGraceAt) {
            found = priorMatch
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message.toLowerCase() : ""
          if (msg.includes("rate limit") || msg.includes("limitexceeded")) {
            await sleep(ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS * 2)
            continue
          }
        }
        if (!found) await sleep(ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS)
      }

      if (!found) {
        throw new Error(
          "Timed out waiting for consensus. The transaction may still complete. Check the recent list or refresh in a few minutes."
        )
      }

      setResult(found)
      setPhase("done")
      loadRecent()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.")
      setPhase("error")
    }
  }, [claim, evidenceUrl, wallet.address, loadRecent])

  const loadExample = useCallback((ex: { claim: string; url: string }) => {
    setClaim(ex.claim)
    setEvidenceUrl(ex.url)
    setError(null)
  }, [])

  const handleReset = useCallback(() => {
    setClaim("")
    setEvidenceUrl("")
    setResult(null)
    setError(null)
    setPhase("idle")
  }, [])

  const errorBanner = error || wallet.error
  const vStyle = result ? VERDICT_STYLES[result.verdict] || VERDICT_STYLES.INSUFFICIENT : null
  const hasContent = claim !== "" || evidenceUrl !== "" || result !== null

  return (
    <>
      <AmbientBackground />
      <div className="app-shell">
        <Header wallet={wallet} />

        <main className="app-main">
          <Hero />

          {errorBanner && (
            <div className="cl-banner cl-banner--error fade-in">
              <span className="cl-banner__icon" aria-hidden="true">⚠</span>
              <span>{errorBanner}</span>
            </div>
          )}

          <section style={{ maxWidth: 820, margin: "0 auto", width: "100%" }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 22, background: "rgba(255,255,255,0.03)" }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Verify a claim against live external evidence</h2>
              <p style={{ opacity: 0.7, fontSize: 14, marginTop: 8 }}>
                The contract fetches the evidence URL itself, then independent validators read whether the
                evidence supports the claim and reach consensus. The verdict is grounded in fetched text, not
                any model's training data.
              </p>

              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 16, marginBottom: 6 }}>Try an example</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EXAMPLES.map((ex) => (
                  <button key={ex.label} type="button" onClick={() => loadExample(ex)} disabled={isVerifying} style={chipStyle}>{ex.label}</button>
                ))}
              </div>

              <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginTop: 18, marginBottom: 6 }}>Claim</label>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                disabled={isVerifying}
                placeholder="e.g. This project is licensed under the GNU General Public License."
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.25)", color: "inherit", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "inherit", fontSize: 15, resize: "vertical" }}
              />

              <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginTop: 14, marginBottom: 6 }}>Evidence URL (a stable reference page)</label>
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                disabled={isVerifying}
                placeholder="https://…"
                style={{ width: "100%", boxSizing: "border-box", borderRadius: 10, padding: 12, background: "rgba(0,0,0,0.25)", color: "inherit", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "inherit", fontSize: 15 }}
              />

              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={handleVerify} disabled={isVerifying || !walletReady} style={{ borderRadius: 10, padding: "12px 22px", border: "none", cursor: isVerifying || !walletReady ? "not-allowed" : "pointer", background: "#c2410c", color: "#fff", fontSize: 15, fontWeight: 600, opacity: isVerifying || !walletReady ? 0.55 : 1 }}>
                  {isVerifying ? "Verifying…" : "Verify claim"}
                </button>
                <button type="button" onClick={handleReset} disabled={isVerifying || !hasContent} style={{ borderRadius: 10, padding: "12px 18px", border: "1px solid rgba(255,255,255,0.2)", cursor: isVerifying || !hasContent ? "not-allowed" : "pointer", background: "none", color: "inherit", fontSize: 14, opacity: isVerifying || !hasContent ? 0.4 : 0.85 }}>
                  Clear
                </button>
                {isVerifying && loadingMessage && (
                  <span style={{ opacity: 0.75, fontSize: 14 }}>{loadingMessage}</span>
                )}
                {!isVerifying && walletStatusMessage && (
                  <span style={{ opacity: 0.65, fontSize: 14 }}>{walletStatusMessage}</span>
                )}
              </div>

              <p style={{ fontSize: 12.5, opacity: 0.55, marginTop: 12, marginBottom: 0 }}>
                Verification runs a live fetch and validator consensus. It usually takes 1 to 2 minutes.
              </p>
            </div>

            {result && vStyle && (
              <div className="fade-in" style={{ marginTop: 22, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: vStyle.bg, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ color: vStyle.fg, fontSize: 22, fontWeight: 700, letterSpacing: 0.3 }}>{vStyle.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 13, opacity: 0.8 }}>
                    Model confidence {result.confidence}%
                  </span>
                </div>
                <div style={{ padding: 22, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Consensus reasoning</div>
                  <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.55 }}>{result.reasoning || "No reasoning returned."}</p>

                  <p style={{ fontSize: 12, opacity: 0.55, margin: "0 0 16px" }}>
                    How to read this: the verdict is the consensus outcome. The confidence and the counter-argument below are the model's own self-assessment, not measured from separate validators. Measuring real cross-validator disagreement is a planned upgrade.
                  </p>

                  {result.minority_note && result.minority_note.trim() !== "" && (
                    <div style={{ borderLeft: "3px solid #fbbf24", background: "rgba(251,191,36,0.08)", padding: "12px 14px", borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#fbbf24", marginBottom: 4 }}>Counter-argument (model-generated)</div>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, opacity: 0.92 }}>{result.minority_note}</p>
                    </div>
                  )}

                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Claim</div>
                  <p style={{ margin: "0 0 14px", fontSize: 14 }}>{result.claim}</p>

                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Evidence source</div>
                  <a href={result.evidence_url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 14, wordBreak: "break-all" }}>{result.evidence_url}</a>

                  {result.evidence_excerpt && (
                    <>
                      <div style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 4px" }}>What the validators read (excerpt)</div>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12.5, opacity: 0.8, background: "rgba(0,0,0,0.25)", padding: 12, borderRadius: 8, maxHeight: 180, overflow: "auto" }}>{result.evidence_excerpt}</pre>
                    </>
                  )}

                  <div style={{ fontSize: 13, opacity: 0.7, margin: "14px 0 4px" }}>Receipt (content-addressed)</div>
                  <div style={{ fontSize: 12.5, fontFamily: "monospace", opacity: 0.8, background: "rgba(0,0,0,0.25)", padding: 12, borderRadius: 8, wordBreak: "break-all", lineHeight: 1.6 }}>
                    <div>request_id: {result.request_id}</div>
                    <div>evidence sha256: {result.evidence_hash}</div>
                  </div>
                  <p style={{ fontSize: 12, opacity: 0.5, margin: "6px 0 0" }}>
                    The request ID is a sha256 of the claim, the URL, and the fetched evidence. The evidence hash fingerprints the exact source text the validators read, so this receipt binds to it and identical inputs return the same receipt.
                  </p>

                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={handleReset} style={{ borderRadius: 10, padding: "10px 18px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", background: "none", color: "inherit", fontSize: 14 }}>Verify another claim</button>
                    <span style={{ fontSize: 12, opacity: 0.55 }}>
                      Fetching evidence proves what the source says, not that the source is authoritative. Judge the source yourself. Contract{" "}
                      <a href={explorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer noopener">on the explorer</a>.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {recent.length > 0 && (
            <section style={{ maxWidth: 820, margin: "28px auto 0", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6 }}>Recent verifications (on-chain, public)</div>
                <button type="button" onClick={() => setFeedOpen((v) => !v)} style={{ marginLeft: "auto", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "inherit", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, opacity: 0.8 }}>{feedOpen ? "Collapse" : "Expand"}</button>
              </div>
              {feedOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recent.map((r) => {
                  const s = VERDICT_STYLES[r.verdict] || VERDICT_STYLES.INSUFFICIENT
                  return (
                    <div key={r.request_id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: s.fg, fontWeight: 600, fontSize: 13, minWidth: 92 }}>{s.label}</span>
                      <span style={{ flex: 1, fontSize: 13, opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.claim}</span>
                      <span style={{ fontSize: 12, opacity: 0.55 }}>{r.confidence}%</span>
                    </div>
                  )
                })}
              </div>
              )}
            </section>
          )}

          <footer className="cl-footer">
            <p>
              Built on{" "}
              <a href="https://genlayer.com" target="_blank" rel="noreferrer noopener">GenLayer</a>
              . Consensus over live evidence, not frozen training data.
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}