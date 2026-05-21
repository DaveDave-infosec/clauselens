import "./DangerFlags.css"

interface DangerFlagsProps {
  flags: string[]
  manipulationScore: number
}

export function DangerFlags({ flags, manipulationScore }: DangerFlagsProps) {
  const hasFlags = flags && flags.length > 0
  const intensity = Math.max(0, Math.min(1, manipulationScore / 100))

  return (
    <div className="cl-flags">
      <div className="cl-flags__header">
        <span className="cl-flags__icon" aria-hidden="true">
          {hasFlags ? "⚠" : "✓"}
        </span>
        <h3 className="cl-flags__title">
          {hasFlags ? "Specific risks detected" : "No specific danger clauses detected"}
        </h3>
        {hasFlags && (
          <span className="cl-flags__count mono">
            {flags.length} {flags.length === 1 ? "flag" : "flags"}
          </span>
        )}
      </div>

      {hasFlags && (
        <ul className="cl-flags__list">
          {flags.map((flag, idx) => (
            <li
              key={idx}
              className="cl-flags__item"
              style={
                {
                  "--flag-intensity": intensity,
                } as React.CSSProperties
              }
            >
              <span className="cl-flags__bullet" aria-hidden="true" />
              <span className="cl-flags__text">{flag}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}