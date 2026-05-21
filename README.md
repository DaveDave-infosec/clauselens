# ClauseLens

**AI document forensics on GenLayer Bradbury.**

ClauseLens lets you paste any document — a Terms of Service, a whitepaper, a governance proposal, an airdrop announcement — & have it analyzed by independent LLM validators on GenLayer. The validators reach consensus on the document's hidden manipulation, surface specific dangerous clauses, & expose buried risks that lawyers, marketers, & whitepaper authors hide in plain sight.

Where traditional blockchains can only verify deterministic computation, GenLayer validators can reason about intent. ClauseLens turns that capability into a forensic tool.

🔗 **Live:** Deployed at `clauselens.vercel.app` (URL coming soon)
📜 **Contract:** `0x2F032bf686F346a9E86DAE9B5762Bf2B17b7cFF8` on GenLayer Bradbury Testnet
🔍 **Explorer:** [View contract on Bradbury](https://explorer-bradbury.genlayer.com/address/0x2F032bf686F346a9E86DAE9B5762Bf2B17b7cFF8)

---

## What it does

Each analysis produces:

- **Document type** — auto-detected (ToS, Whitepaper, Governance Proposal, Airdrop Rules, Privacy Policy, Pitch Deck, etc.)
- **Manipulation score** (0-100) — how predatory or coercive the language is
- **Clarity score** (0-100) — how transparently the document explains itself
- **Jargon Inflation score** (0-100) — how much technical or marketing jargon obscures meaning
- **Hidden risk level** — Low / Medium / High / Critical
- **Human-readable explanation** — what the document actually means, in plain English
- **Danger flags** — specific quotes from the document paired with why they're concerning
- **Validator disagreement** (0-100) — a GenLayer-native signal. When validators diverge on intent, that divergence is itself information

The killer feature is validator disagreement. A predatory ToS produces strong consensus (manipulation is obvious). An ambiguous whitepaper produces measurable disagreement (interpretation is subjective). The disagreement value is a signal traditional chains cannot surface.

---

## Architecture

### Smart Contract
Single Python contract at `contracts/clauselens.py`. Uses `gl.eq_principle.prompt_comparative` to delegate document analysis to GenLayer's validator quorum. Validators each generate a structured JSON analysis & reach consensus before the result is persisted to chain storage.

Key methods:
- `analyze_document(text)` — write method, takes a document, returns nothing (analysis ID is derived from the auto-incrementing counter)
- `get_analysis(id)` — view, returns the full analysis JSON for a specific ID
- `get_all_analyses()` — view, returns all analyses
- `get_analysis_count()` — view, returns total analyses

### Frontend
Vite + React + TypeScript + `genlayer-js` v1.x + viem v2 + MetaMask. Single-page dApp at `frontend/`. Connects to MetaMask, switches to Bradbury (chainId 4221), submits documents to the contract, polls for consensus results, & renders them in a forensic-intelligence-themed UI.

---

## A note on GenLayer Bradbury storage bug (May 2026)

During contract development we hit a non-obvious bug worth documenting for future GenLayer builders.

**Symptom:** A write method that called `gl.eq_principle.prompt_comparative(...)` would have its transaction reported as `ACCEPTED` by the consensus layer, but no storage writes would commit. `get_analysis_count()` would return 0 even after dozens of successful `analyze_document` transactions.

**Root cause:** Reading `gl.message.sender_address` or `gl.block.timestamp` *inside* a write method that also called the equivalence principle caused a silent storage rollback after consensus completed. The TX itself succeeded; the writes never persisted.

**Workaround:**
1. Don't read `gl.message.*` or `gl.block.*` inside any write method that uses an equivalence principle. Capture submitter & timestamp on the client side instead (we use localStorage).
2. Don't use `@allow_storage @dataclass` containers wrapping `TreeMap`. Use parallel flat `TreeMap[str, str]` & `TreeMap[str, u64]` structures keyed by analysis ID instead.

This was diagnosed by building progressively-simpler smoke-test contracts (`smoketest`, `smoketest2`, etc.) until the failure pattern isolated. If you're seeing TXs accepted with no storage commits, this is probably why.

---

## Running locally

### Prerequisites
- Node.js 18+ & npm
- MetaMask browser extension
- A wallet funded with GEN tokens on Bradbury Testnet (get test tokens from the GenLayer faucet)

### Setup

```bash
git clone https://github.com/DaveDave-infosec/clauselens.git
cd clauselens/frontend
npm install
npm run dev
```

Open http://localhost:5173. Connect MetaMask, switch to Bradbury Testnet, paste a document, click Analyze.

### Environment variables (optional)

```bash
# frontend/.env
VITE_CONTRACT_ADDRESS=0x2F032bf686F346a9E86DAE9B5762Bf2B17b7cFF8
```

The contract address defaults to the deployed one if not set.

---

## Tech stack

- **Smart contract:** GenLayer Python SDK (`py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`)
- **Frontend:** Vite 5, React 18, TypeScript, viem 2.x, genlayer-js 1.x
- **Wallet:** MetaMask via `window.ethereum`
- **Hosting:** Vercel
- **Chain:** GenLayer Bradbury Testnet (chainId 4221)

---

## License

MIT — see `LICENSE`.

---

## A note on privacy

ClauseLens stores all analyses on a public blockchain. Anyone can call `get_all_analyses()` on the contract & see every document analyzed through this contract, along with the submitting wallet address. The "My View" filter in the UI hides others' analyses from your view as a convenience, but the data itself is public. If you need genuinely private document analysis, this is not the right tool.

---

Built by [@ybndave](https://x.com/ybndave) on [GenLayer](https://genlayer.com).
