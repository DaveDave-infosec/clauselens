import type { ReactNode } from "react"

// Minimal SVG glyphs — 20x20 viewBox, stroke 1.5, currentColor.
// Match against detected document_type substrings.

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const DOC = (
  <Icon>
    <path d="M5 2.5h7l3 3v12H5z" />
    <path d="M12 2.5v3h3" />
    <path d="M7 9h6M7 12h6M7 15h4" />
  </Icon>
)

const TOS = (
  <Icon>
    <path d="M4 3h12v14H4z" />
    <path d="M7 7h6M7 10h6M7 13h4" />
    <circle cx="14" cy="14" r="2.2" />
    <path d="M13 14l.7.7L15 13.5" />
  </Icon>
)

const WHITEPAPER = (
  <Icon>
    <path d="M5 3h10v14H5z" />
    <path d="M8 6h4M8 9h4M8 12h4" />
    <circle cx="10" cy="15" r="0.8" />
  </Icon>
)

const GOV = (
  <Icon>
    <path d="M3 8l7-4 7 4" />
    <path d="M4 8v8M16 8v8M3 17h14" />
    <path d="M7 11v3M10 11v3M13 11v3" />
  </Icon>
)

const AIRDROP = (
  <Icon>
    <path d="M10 3l3 5h-6z" />
    <circle cx="10" cy="13" r="3" />
    <path d="M10 16v2" />
  </Icon>
)

const LEGAL = (
  <Icon>
    <path d="M10 3v14" />
    <path d="M5 6h10" />
    <path d="M5 6l-2 5h4z" />
    <path d="M15 6l-2 5h4z" />
    <path d="M6 17h8" />
  </Icon>
)

const PITCH = (
  <Icon>
    <path d="M3 4h14v10H3z" />
    <path d="M7 18h6M10 14v4" />
    <path d="M6 11l2-3 2 2 4-4" />
  </Icon>
)

const PRIVACY = (
  <Icon>
    <path d="M10 3l5 2v5c0 4-5 7-5 7s-5-3-5-7V5z" />
    <circle cx="10" cy="9" r="1.5" />
    <path d="M10 10.5v2" />
  </Icon>
)

const CONTRACT = (
  <Icon>
    <path d="M4 3h12v14H4z" />
    <path d="M7 7h6M7 10h6" />
    <path d="M7 13l1.5 1.5L11 12" />
  </Icon>
)

export function iconForDocType(type: string): ReactNode {
  const t = (type || "").toLowerCase()
  if (t.includes("term") || t.includes("user agreement") || t.includes("eula")) return TOS
  if (t.includes("whitepaper") || t.includes("white paper")) return WHITEPAPER
  if (t.includes("govern")) return GOV
  if (t.includes("airdrop")) return AIRDROP
  if (t.includes("legal") || t.includes("disclaim")) return LEGAL
  if (t.includes("pitch") || t.includes("deck") || t.includes("investor")) return PITCH
  if (t.includes("privacy")) return PRIVACY
  if (t.includes("contract") && !t.includes("smart")) return LEGAL
  if (t.includes("smart contract") || t.includes("solidity")) return CONTRACT
  return DOC
}