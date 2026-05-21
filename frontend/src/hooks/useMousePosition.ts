import { useEffect, useState } from "react"

interface MousePosition {
  x: number
  y: number
  // Normalized -1 to 1, with 0 at center of viewport
  nx: number
  ny: number
}

const initial: MousePosition = { x: 0, y: 0, nx: 0, ny: 0 }

export function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>(initial)

  useEffect(() => {
    let raf = 0
    let pending = { x: 0, y: 0 }
    let active = false

    const handler = (e: MouseEvent) => {
      pending = { x: e.clientX, y: e.clientY }
      if (!active) {
        active = true
        raf = requestAnimationFrame(() => {
          const w = window.innerWidth || 1
          const h = window.innerHeight || 1
          const nx = (pending.x / w) * 2 - 1
          const ny = (pending.y / h) * 2 - 1
          setPos({ x: pending.x, y: pending.y, nx, ny })
          active = false
        })
      }
    }

    window.addEventListener("mousemove", handler, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handler)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return pos
}