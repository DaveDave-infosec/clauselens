import type { RiskLevel } from "./constants"

export function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function riskColor(level: string): string {
  const normalized = (level || "").toLowerCase()
  switch (normalized) {
    case "low":
      return "var(--v2-signal-ok)"
    case "medium":
      return "var(--v2-signal-warn)"
    case "high":
      return "var(--v2-accent)"
    case "critical":
      return "var(--v2-signal-danger)"
    default:
      return "var(--v2-ink-secondary)"
  }
}

export function normalizeRisk(level: string): RiskLevel {
  const normalized = (level || "").toLowerCase()
  if (normalized === "low") return "Low"
  if (normalized === "medium") return "Medium"
  if (normalized === "high") return "High"
  if (normalized === "critical") return "Critical"
  return "Unknown"
}

export function formatTimestamp(ms: number): string {
  if (!ms || !Number.isFinite(ms)) return ""
  const d = new Date(ms)
  const now = Date.now()
  const diff = now - ms

  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  // Truncate at the last word boundary before maxLength
  const slice = text.slice(0, maxLength)
  const lastSpace = slice.lastIndexOf(" ")
  if (lastSpace > maxLength * 0.7) {
    return slice.slice(0, lastSpace).trimEnd() + "…"
  }
  return slice.trimEnd() + "…"
}