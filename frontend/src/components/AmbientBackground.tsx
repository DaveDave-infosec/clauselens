import "./AmbientBackground.css"

/**
 * AmbientBackground (V2)
 *
 * In V1 this was a four-layer system: drifting conic mesh, three colored
 * orbs, a fake neural-network SVG, & a noise overlay — heavy & sci-fi.
 * V2 is editorial-investigative; the page draws its energy from the
 * ValidatorCluster & the content, not from the background. Reduced to
 * a single quiet warm-rust glow at low opacity, no animation, no mouse
 * parallax. The component is kept (instead of removed) so existing
 * imports continue to work without route-level edits.
 */
export function AmbientBackground() {
  return (
    <div className="cl-ambient" aria-hidden="true">
      <div className="cl-ambient__glow cl-ambient__glow--a" />
      <div className="cl-ambient__glow cl-ambient__glow--b" />
    </div>
  )
}
