import { useEffect, useRef } from "react"
import { useMousePosition } from "../hooks/useMousePosition"
import "./ValidatorCluster.css"

interface Validator {
  id: number
  x: number // 0-100 percent
  y: number // 0-100 percent
  baseRadius: number
  phase: number
}

const VALIDATORS: Validator[] = [
  { id: 0, x: 16, y: 30, baseRadius: 4.5, phase: 0 },
  { id: 1, x: 32, y: 70, baseRadius: 3.5, phase: 0.6 },
  { id: 2, x: 48, y: 24, baseRadius: 5, phase: 1.1 },
  { id: 3, x: 56, y: 64, baseRadius: 4, phase: 1.6 },
  { id: 4, x: 70, y: 36, baseRadius: 3.8, phase: 2.1 },
  { id: 5, x: 78, y: 72, baseRadius: 4.6, phase: 2.7 },
  { id: 6, x: 88, y: 28, baseRadius: 3.6, phase: 3.2 },
  { id: 7, x: 24, y: 84, baseRadius: 3.2, phase: 3.7 },
]

// Connections: pairs of validator IDs
const LINKS: Array<[number, number]> = [
  [0, 2],
  [0, 1],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [4, 6],
  [5, 6],
  [1, 7],
  [3, 7],
]

export function ValidatorCluster() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mouse = useMousePosition()

  // Mouse parallax — translate the whole svg slightly based on mouse
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const tx = mouse.nx * 6
    const ty = mouse.ny * 6
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
  }, [mouse.nx, mouse.ny])

  return (
    <div className="cl-cluster" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="cl-cluster__svg"
      >
        <defs>
          <radialGradient id="cl-cluster-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a89dff" stopOpacity="1" />
            <stop offset="60%" stopColor="#7c5cff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cl-cluster-link" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00e5d1" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Links */}
        <g stroke="url(#cl-cluster-link)" strokeWidth="0.25" fill="none">
          {LINKS.map(([a, b], i) => {
            const va = VALIDATORS[a]
            const vb = VALIDATORS[b]
            return (
              <line
                key={i}
                x1={va.x}
                y1={va.y}
                x2={vb.x}
                y2={vb.y}
                className="cl-cluster__link"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            )
          })}
        </g>

        {/* Pulses traveling along links */}
        <g>
          {LINKS.map(([a, b], i) => {
            const va = VALIDATORS[a]
            const vb = VALIDATORS[b]
            return (
              <circle
                key={`pulse-${i}`}
                r="0.5"
                fill="#ffffff"
                className="cl-cluster__pulse"
                style={{
                  animationDelay: `${i * 0.55}s`,
                  offsetPath: `path("M${va.x},${va.y} L${vb.x},${vb.y}")`,
                }}
              />
            )
          })}
        </g>

        {/* Nodes */}
        <g>
          {VALIDATORS.map((v) => (
            <g key={v.id} transform={`translate(${v.x} ${v.y})`}>
              <circle
                r={v.baseRadius * 1.8}
                fill="url(#cl-cluster-node)"
                opacity="0.4"
                className="cl-cluster__halo"
                style={{ animationDelay: `${v.phase * 0.3}s` }}
              />
              <circle
                r={v.baseRadius}
                fill="#7c5cff"
                className="cl-cluster__node"
                style={{ animationDelay: `${v.phase * 0.3}s` }}
              />
              <circle r={v.baseRadius * 0.4} fill="#ffffff" opacity="0.9" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}