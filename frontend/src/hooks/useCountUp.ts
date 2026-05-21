import { useEffect, useRef, useState } from "react"

interface UseCountUpOptions {
  target: number
  durationMs?: number
  startOnMount?: boolean
}

export function useCountUp({
  target,
  durationMs = 1400,
  startOnMount = true,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(startOnMount ? 0 : target)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(0)
  const targetRef = useRef(target)

  useEffect(() => {
    fromRef.current = value
    targetRef.current = target
    startRef.current = null

    let raf = 0
    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / durationMs)
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = fromRef.current + (targetRef.current - fromRef.current) * eased
      setValue(targetRef.current >= 0 && targetRef.current < 1000 ? Math.round(next) : next)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}