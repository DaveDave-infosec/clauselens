import { useEffect, useRef, useState } from "react"
import "./ValidatorCluster.css"

// Five validator nodes, asymmetric arrangement, deliberately uneven so they
// read as five distinct entities rather than a regular geometric shape.
// Coordinates are inside a 600 x 360 viewBox.
const NODES = [
  { id: "n1", cx: 130, cy: 110, r: 6.5, size: "lg", pulsePeriod: 3.2 },
  { id: "n2", cx: 280, cy: 70,  r: 7.5, size: "lg", pulsePeriod: 4.8 },
  { id: "n3", cx: 470, cy: 130, r: 6,   size: "md", pulsePeriod: 4.1 },
  { id: "n4", cx: 200, cy: 250, r: 7,   size: "lg", pulsePeriod: 5.5 },
  { id: "n5", cx: 410, cy: 280, r: 5.5, size: "md", pulsePeriod: 6.2 },
] as const

// Edges chosen to hint at a graph without spelling one out.
// Each edge is referenced by node-id pair, used both for static lines
// & as the route for traveling signals.
const EDGES: Array<[string, string]> = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n1", "n4"],
  ["n2", "n4"],
  ["n3", "n5"],
  ["n4", "n5"],
  ["n2", "n5"],
]

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]))

// Signal travel: one signal in flight at a time, fires every 4-6 seconds
// on a randomly-chosen edge. Travels for ~1.2 seconds.
const SIGNAL_INTERVAL_MIN = 4000
const SIGNAL_INTERVAL_MAX = 6000
const SIGNAL_DURATION = 1200

// Consensus moment: every 12-15 seconds, all nodes briefly brighten in
// a slight stagger so it ripples rather than snaps.
const CONSENSUS_INTERVAL_MIN = 12000
const CONSENSUS_INTERVAL_MAX = 15000

interface Signal {
  key: number
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export function ValidatorCluster() {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [consensusKey, setConsensusKey] = useState(0)
  const signalKeyRef = useRef(0)

  // Schedule signal-travel events on random intervals along random edges.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const delay =
        SIGNAL_INTERVAL_MIN +
        Math.random() * (SIGNAL_INTERVAL_MAX - SIGNAL_INTERVAL_MIN)
      timeoutId = setTimeout(() => {
        const edge = EDGES[Math.floor(Math.random() * EDGES.length)]
        const from = NODE_MAP[edge[0]]
        const to = NODE_MAP[edge[1]]
        if (from && to) {
          // Randomize direction so signals don't always flow the same way.
          const reverse = Math.random() < 0.5
          const a = reverse ? to : from
          const b = reverse ? from : to
          signalKeyRef.current += 1
          setSignal({
            key: signalKeyRef.current,
            fromX: a.cx,
            fromY: a.cy,
            toX: b.cx,
            toY: b.cy,
          })
          // Clear after the animation duration so the signal element is
          // removed from the DOM rather than lingering.
          setTimeout(() => setSignal(null), SIGNAL_DURATION + 50)
        }
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [])

  // Schedule consensus-moment ripples.
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const delay =
        CONSENSUS_INTERVAL_MIN +
        Math.random() * (CONSENSUS_INTERVAL_MAX - CONSENSUS_INTERVAL_MIN)
      timeoutId = setTimeout(() => {
        setConsensusKey((k) => k + 1)
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="cl-cluster" aria-hidden="true">
      <svg
        viewBox="0 0 600 360"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="cl-cluster__svg"
      >
        {/* Static edges, hairline & low opacity */}
        <g className="cl-cluster__edges">
          {EDGES.map(([a, b]) => {
            const fromNode = NODE_MAP[a]
            const toNode = NODE_MAP[b]
            if (!fromNode || !toNode) return null
            return (
              <line
                key={`${a}-${b}`}
                x1={fromNode.cx}
                y1={fromNode.cy}
                x2={toNode.cx}
                y2={toNode.cy}
                className="cl-cluster__edge"
              />
            )
          })}
        </g>

        {/* Signal in flight along one edge */}
        {signal && (
          <circle
            key={signal.key}
            r={2.5}
            className="cl-cluster__signal"
            style={
              {
                "--from-x": `${signal.fromX}px`,
                "--from-y": `${signal.fromY}px`,
                "--to-x": `${signal.toX}px`,
                "--to-y": `${signal.toY}px`,
                "--duration": `${SIGNAL_DURATION}ms`,
              } as React.CSSProperties
            }
          />
        )}

        {/* Five nodes — each has its own pulse period & a ring */}
        <g className={`cl-cluster__nodes cl-cluster__nodes--consensus-${consensusKey % 2}`}>
          {NODES.map((node, idx) => (
            <g
              key={node.id}
              className={`cl-cluster__node cl-cluster__node--${node.size}`}
              style={
                {
                  "--pulse-period": `${node.pulsePeriod}s`,
                  "--consensus-delay": `${idx * 100}ms`,
                } as React.CSSProperties
              }
            >
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 18}
                className="cl-cluster__ring"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                className="cl-cluster__core"
              />
            </g>
          ))}
        </g>
      </svg>

      <p className="cl-cluster__caption mono">
        validators reasoning independently
      </p>
    </div>
  )
}
