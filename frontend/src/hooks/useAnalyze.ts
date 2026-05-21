import { useCallback, useState } from "react"
import {
  analyzeDocument,
  getAnalysisCount,
  getAnalysis,
  type AnalysisResult,
} from "../lib/genlayer"
import { saveMeta } from "../lib/localMeta"
import {
  ANALYSIS_TIMEOUT_MS,
  ANALYSIS_LONG_WAIT_MS,
  ANALYSIS_POLL_INITIAL_MS,
  ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS,
} from "../lib/constants"

type Phase =
  | "idle"
  | "submitting"
  | "waiting-consensus"
  | "waiting-consensus-long"
  | "fetching-result"
  | "done"
  | "error"

const PHASE_MESSAGES: Record<Phase, string> = {
  idle: "",
  submitting: "Submitting to Bradbury…",
  "waiting-consensus": "Validators are reading the document…",
  "waiting-consensus-long": "Still working… consensus is taking longer than usual",
  "fetching-result": "Consensus reached. Fetching results…",
  done: "",
  error: "",
}

interface UseAnalyzeOptions {
  onResult: (result: AnalysisResult) => void
  onStart?: () => void
}

export function useAnalyze({ onResult, onStart }: UseAnalyzeOptions) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null)

  const isAnalyzing =
    phase === "submitting" ||
    phase === "waiting-consensus" ||
    phase === "waiting-consensus-long" ||
    phase === "fetching-result"

  const loadingMessage = PHASE_MESSAGES[phase] || "Analyzing…"

  const reset = useCallback(() => {
    setPhase("idle")
    setError(null)
  }, [])

  const analyze = useCallback(
    async (documentText: string, accountAddress: string) => {
      setError(null)
      setLastResult(null)
      onStart?.()

      try {
        const startCount = await getAnalysisCount()

        setPhase("submitting")
        await analyzeDocument(documentText, accountAddress)

        setPhase("waiting-consensus")
        const targetCount = startCount + 1
        const deadline = Date.now() + ANALYSIS_TIMEOUT_MS
        const longWaitAt = Date.now() + ANALYSIS_LONG_WAIT_MS
        let foundCount = startCount

        // Initial delay before first poll
        await sleep(ANALYSIS_POLL_INITIAL_MS)

        while (foundCount < targetCount && Date.now() < deadline) {
          // Bump to long-wait message after 5 min
          if (Date.now() >= longWaitAt && phase === "waiting-consensus") {
            setPhase("waiting-consensus-long")
          }

          try {
            foundCount = await getAnalysisCount()
          } catch (err: unknown) {
            // Rate limit or transient — silently keep polling
            const msg = err instanceof Error ? err.message.toLowerCase() : ""
            if (msg.includes("rate limit") || msg.includes("limitexceeded")) {
              // Wait a bit longer on rate limit
              await sleep(ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS * 2)
              continue
            }
          }

          if (foundCount < targetCount) {
            await sleep(ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS)
          }
        }

        if (foundCount < targetCount) {
          throw new Error(
            "Timed out waiting for validators to reach consensus. The transaction may still complete — check the explorer or refresh the page in a few minutes."
          )
        }

        setPhase("fetching-result")
        const analysisId = `analysis_${targetCount}`
        const analysis = await getAnalysis(analysisId)

        if (!analysis) {
          throw new Error(`Analysis ${analysisId} not found after consensus.`)
        }

        const enriched: AnalysisResult = {
          ...analysis,
          submitter: accountAddress,
          client_timestamp: Date.now(),
        }
        saveMeta(analysisId, {
          submitter: accountAddress,
          client_timestamp: enriched.client_timestamp!,
        })

        setLastResult(enriched)
        setPhase("done")
        onResult(enriched)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Analysis failed."
        setError(message)
        setPhase("error")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onResult, onStart]
  )

  return {
    analyze,
    reset,
    phase,
    isAnalyzing,
    loadingMessage,
    error,
    lastResult,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}