import { useEffect, useState } from "react"

const EXAMPLES = [
  "Paste a Terms of Service — see what they really keep when you click Accept…",
  "Drop a whitepaper — find out if the tech actually exists or just the buzzwords do…",
  "Try a governance proposal — what's it actually voting to change?",
  "Test an airdrop rules page — who gets paid & who gets played?",
  "Throw in a privacy policy — what they collect vs. what they admit to…",
  "Paste a pitch deck — promises vs. proof, separated.",
]

const HOLD_MS = 4000
const TYPE_MS = 22

export function useRotatingPlaceholder(active: boolean): string {
  const [idx, setIdx] = useState(0)
  const [displayed, setDisplayed] = useState(EXAMPLES[0])

  useEffect(() => {
    if (!active) return
    const target = EXAMPLES[idx]
    let pos = 0
    setDisplayed("")
    const typeTimer = setInterval(() => {
      pos += 1
      setDisplayed(target.slice(0, pos))
      if (pos >= target.length) {
        clearInterval(typeTimer)
      }
    }, TYPE_MS)

    const advance = setTimeout(() => {
      setIdx((i) => (i + 1) % EXAMPLES.length)
    }, HOLD_MS + target.length * TYPE_MS)

    return () => {
      clearInterval(typeTimer)
      clearTimeout(advance)
    }
  }, [idx, active])

  return displayed
}