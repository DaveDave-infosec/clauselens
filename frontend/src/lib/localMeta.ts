// Client-side metadata persistence.
//
// The contract intentionally doesn't store submitter or timestamp
// (Bradbury bug — see contracts/clauselens.py header comment).
// We persist them in localStorage keyed by analysis_id so the UI
// can display them alongside the on-chain analysis fields.

const STORAGE_KEY = "clauselens.localMeta.v1"

export interface LocalAnalysisMeta {
  submitter: string
  client_timestamp: number
}

type MetaMap = Record<string, LocalAnalysisMeta>

function readAll(): MetaMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as MetaMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeAll(map: MetaMap): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // quota or private mode — silently ignore
  }
}

export function saveMeta(analysisId: string, meta: LocalAnalysisMeta): void {
  const map = readAll()
  map[analysisId] = meta
  writeAll(map)
}

export function getMeta(analysisId: string): LocalAnalysisMeta | null {
  const map = readAll()
  return map[analysisId] || null
}

export function getAllMeta(): MetaMap {
  return readAll()
}