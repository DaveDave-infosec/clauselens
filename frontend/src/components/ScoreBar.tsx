import "./ScoreBar.css"

type Direction = "high-is-bad" | "high-is-good"

interface ScoreBarProps {
  label: string
  value: number // 0-100
  direction: Direction
  description?: string
}

function colorForValue(value: number, direction: Direction): string {
  // Map 0-100 to a color band depending on direction
  // high-is-bad: 0-30 green, 31-60 amber, 61-100 red
  // high-is-good: inverted
  const v = Math.max(0, Math.min(100, value))
  if (direction === "high-is-bad") {
    if (v <= 30) return "var(--v2-signal-ok)"
    if (v <= 60) return "var(--v2-signal-warn)"
    return "var(--v2-signal-danger)"
  } else {
    if (v <= 30) return "var(--v2-signal-danger)"
    if (v <= 60) return "var(--v2-signal-warn)"
    return "var(--v2-signal-ok)"
  }
}

export function ScoreBar({ label, value, direction, description }: ScoreBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  const color = colorForValue(v, direction)

  return (
    <div className="cl-score">
      <div className="cl-score__header">
        <span className="cl-score__label">{label}</span>
        <span className="cl-score__value mono" style={{ color }}>
          {v}
          <span className="cl-score__value-suffix">/100</span>
        </span>
      </div>

      <div className="cl-score__track">
        {/* Threshold tick marks at 30 & 60 */}
        <div className="cl-score__tick" style={{ left: "30%" }} aria-hidden="true" />
        <div className="cl-score__tick" style={{ left: "60%" }} aria-hidden="true" />

        <div
          className="cl-score__fill"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>

      {description && <p className="cl-score__description">{description}</p>}
    </div>
  )
}