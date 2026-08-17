import { useEffect, useState } from "react"
import {
  getAnalysisCount,
  getAllAnalyses,
  getVerificationCount,
  getAllVerifications,
} from "../lib/genlayer"


export interface HeroStats {
  count: number
  mid: number
  right: number
  loaded: boolean
}


// Hero stats for either surface. analyze: count = documents, mid = avg
// manipulation, right = model confidence (100 - avg intent uncertainty).
// verify: count = claims verified, mid = supported verdicts, right = avg
// model confidence. One hook, branches internally so only the relevant
// reads run per page.
export function useHeroStats(variant: "analyze" | "verify", pollMs = 30_000): HeroStats {
  const [count, setCount] = useState(0)
  const [mid, setMid] = useState(0)
  const [right, setRight] = useState(0)
  const [loaded, setLoaded] = useState(false)


  useEffect(() => {
    let cancelled = false


    async function load() {
      try {
        if (variant === "verify") {
          const c = await getVerificationCount()
          if (cancelled) return
          setCount(c)
          if (c > 0) {
            const all = await getAllVerifications()
            if (cancelled || !all || all.length === 0) {
              setLoaded(true)
              return
            }
            const supported = all.filter((v) => v.verdict === "SUPPORTED").length
            const conf = all.reduce((s, v) => s + (v.model_confidence || 0), 0) / all.length
            setMid(supported)
            setRight(Math.max(0, Math.min(100, Math.round(conf))))
          }
        } else {
          const c = await getAnalysisCount()
          if (cancelled) return
          setCount(c)
          if (c > 0) {
            const all = await getAllAnalyses()
            if (cancelled || !all || all.length === 0) {
              setLoaded(true)
              return
            }
            const manip = all.reduce((s, a) => s + (a.manipulation_score || 0), 0) / all.length
            const dis = all.reduce((s, a) => s + (a.validator_disagreement || 0), 0) / all.length
            setMid(Math.round(manip))
            setRight(Math.max(0, Math.min(100, 100 - Math.round(dis))))
          }
        }
        setLoaded(true)
      } catch {
        setLoaded(true)
      }
    }


    load()
    const interval = setInterval(load, pollMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [variant, pollMs])


  return { count, mid, right, loaded }
}