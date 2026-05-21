import { useCallback, useEffect, useRef, useState } from "react"
import { getAllAnalyses, type AnalysisResult } from "../lib/genlayer"
import { getMeta } from "../lib/localMeta"
import { ANALYSIS_POLL_INTERVAL_MS } from "../lib/constants"

interface UseAnalysesOptions {
  paused?: boolean
}

interface UseAnalysesState {
  analyses: AnalysisResult[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function enrichWithLocal(list: AnalysisResult[]): AnalysisResult[] {
  return list.map((a) => {
    const meta = getMeta(a.analysis_id)
    if (!meta) return a
    return {
      ...a,
      submitter: a.submitter ?? meta.submitter,
      client_timestamp: a.client_timestamp ?? meta.client_timestamp,
    }
  })
}

export function useAnalyses(options: UseAnalysesOptions = {}): UseAnalysesState {
  const { paused = false } = options
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const pausedRef = useRef(paused)

  // Keep ref in sync without retriggering the interval
  pausedRef.current = paused

  const fetchAll = useCallback(async () => {
    if (pausedRef.current) return
    setError(null)
    try {
      const list = await getAllAnalyses()
      if (!mountedRef.current) return
      setAnalyses(enrichWithLocal(list))
    } catch (err: unknown) {
      if (!mountedRef.current) return
      const message = err instanceof Error ? err.message : "Failed to load analyses."
      // Silently swallow rate-limit errors — they're expected during heavy polling
      if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("limitexceeded")) {
        return
      }
      setError(message)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchAll()
    if (mountedRef.current) setIsLoading(false)
  }, [fetchAll])

  useEffect(() => {
    mountedRef.current = true
    refresh()

    const interval = setInterval(() => {
      fetchAll()
    }, ANALYSIS_POLL_INTERVAL_MS)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { analyses, isLoading, error, refresh }
}