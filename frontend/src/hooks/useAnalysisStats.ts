import { useEffect, useState } from "react"
import { getAnalysisCount, getAllAnalyses } from "../lib/genlayer"

export interface AnalysisStats {
  count: number
  avgManipulation: number
  consensusRate: number
  loaded: boolean
}

/**
 * Fetches aggregate analysis stats from the contract: total count,
 * average manipulation score, & consensus rate (100 minus avg validator
 * disagreement). Polls every 30s. Shared by the product hero & the
 * marketing home hero so the numbers stay consistent across surfaces.
 */
export function useAnalysisStats(pollMs = 30_000): AnalysisStats {
  const [count, setCount] = useState(0)
  const [avgManipulation, setAvgManipulation] = useState(0)
  const [consensusRate, setConsensusRate] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const c = await getAnalysisCount()
        if (cancelled) return
        setCount(c)
        if (c > 0) {
          const all = await getAllAnalyses()
          if (cancelled || !all || all.length === 0) {
            setLoaded(true)
            return
          }
          const manip =
            all.reduce((s, a) => s + (a.manipulation_score || 0), 0) / all.length
          const dis =
            all.reduce((s, a) => s + (a.validator_disagreement || 0), 0) / all.length
          setAvgManipulation(Math.round(manip))
          setConsensusRate(Math.max(0, Math.min(100, 100 - Math.round(dis))))
        }
        setLoaded(true)
      } catch {
        // silent — stats are non-critical decoration
        setLoaded(true)
      }
    }

    load()
    const interval = setInterval(load, pollMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pollMs])

  return { count, avgManipulation, consensusRate, loaded }
}
