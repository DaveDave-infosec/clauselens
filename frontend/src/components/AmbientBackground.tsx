import { useMousePosition } from "../hooks/useMousePosition"
import "./AmbientBackground.css"

export function AmbientBackground() {
  const mouse = useMousePosition()
  const tx = mouse.nx * 18
  const ty = mouse.ny * 18

  return (
    <div className="cl-ambient" aria-hidden="true">
      {/* Layer 1: drifting mesh */}
      <div
        className="cl-ambient__mesh"
        style={{ transform: `translate3d(${tx * 0.5}px, ${ty * 0.5}px, 0)` }}
      />

      {/* Layer 2: orbs */}
      <div
        className="cl-ambient__orb cl-ambient__orb--violet"
        style={{ transform: `translate3d(${tx}px, ${ty}px, 0)` }}
      />
      <div
        className="cl-ambient__orb cl-ambient__orb--cyan"
        style={{ transform: `translate3d(${-tx * 0.8}px, ${-ty * 0.8}px, 0)` }}
      />
      <div
        className="cl-ambient__orb cl-ambient__orb--magenta"
        style={{ transform: `translate3d(${tx * 0.4}px, ${-ty * 0.4}px, 0)` }}
      />

      {/* Layer 3: neural network SVG (static decorative lines) */}
      <svg className="cl-ambient__network" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cl-line-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00e5d1" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="cl-node-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Lines */}
        <g stroke="url(#cl-line-grad)" strokeWidth="0.6" fill="none">
          <line x1="120" y1="80" x2="380" y2="200" />
          <line x1="380" y1="200" x2="640" y2="120" />
          <line x1="640" y1="120" x2="880" y2="260" />
          <line x1="880" y1="260" x2="1180" y2="180" />
          <line x1="1180" y1="180" x2="1480" y2="80" />

          <line x1="80" y1="500" x2="320" y2="640" />
          <line x1="320" y1="640" x2="560" y2="540" />
          <line x1="560" y1="540" x2="820" y2="700" />
          <line x1="820" y1="700" x2="1080" y2="600" />
          <line x1="1080" y1="600" x2="1340" y2="760" />
          <line x1="1340" y1="760" x2="1540" y2="640" />

          <line x1="380" y1="200" x2="320" y2="640" />
          <line x1="640" y1="120" x2="560" y2="540" />
          <line x1="880" y1="260" x2="820" y2="700" />
          <line x1="1180" y1="180" x2="1080" y2="600" />
        </g>

        {/* Nodes */}
        <g fill="url(#cl-node-grad)">
          <circle cx="120" cy="80" r="14" />
          <circle cx="380" cy="200" r="14" />
          <circle cx="640" cy="120" r="14" />
          <circle cx="880" cy="260" r="14" />
          <circle cx="1180" cy="180" r="14" />
          <circle cx="1480" cy="80" r="14" />
          <circle cx="80" cy="500" r="14" />
          <circle cx="320" cy="640" r="14" />
          <circle cx="560" cy="540" r="14" />
          <circle cx="820" cy="700" r="14" />
          <circle cx="1080" cy="600" r="14" />
          <circle cx="1340" cy="760" r="14" />
          <circle cx="1540" cy="640" r="14" />
        </g>
      </svg>

      {/* Layer 4: noise overlay */}
      <div className="cl-ambient__noise" />
    </div>
  )
}