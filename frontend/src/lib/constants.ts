const ENV_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined

export const CONTRACT_ADDRESS: `0x${string}` =
  (ENV_ADDRESS && ENV_ADDRESS.startsWith("0x") && ENV_ADDRESS.length === 42
    ? ENV_ADDRESS
    : "0x5e7f754A8541bB9ece96c35Cd8864Bd66FC40179") as `0x${string}`

export const STUDIO_CHAIN_ID = 61999
export const STUDIO_CHAIN_ID_HEX = "0xF22F"
export const STUDIO_CHAIN_NAME = "GenLayer Studio"
export const STUDIO_RPC_URL = "https://studio.genlayer.com/api"
export const STUDIO_EXPLORER_URL = "https://explorer-studio.genlayer.com"
export const STUDIO_CURRENCY_SYMBOL = "GEN"

// Base URL used when constructing share links. Falls back to current
// window.location.origin at runtime so deploys to Vercel just work.
export const APP_PUBLIC_URL =
  (import.meta.env.VITE_APP_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "https://clauselens.app")

export const MAX_DOCUMENT_LENGTH = 50000
export const ANALYSIS_POLL_INTERVAL_MS = 30000
export const ANALYSIS_TIMEOUT_MS = 1200000 // 20 min hard cap on UI wait
export const ANALYSIS_LONG_WAIT_MS = 300000 // 5 min — show "taking longer than usual"
export const ANALYSIS_POLL_INITIAL_MS = 8000 // first poll delay
export const ANALYSIS_POLL_INTERVAL_PROGRESSIVE_MS = 15000 // subsequent polls

// Example documents — clicking a chip loads one of these into the textarea
// so users can try the tool without finding their own document.
export interface ExampleDoc {
  label: string
  text: string
}

export const EXAMPLE_DOCS: ExampleDoc[] = [
  {
    label: "Terms of Service",
    text: `By using YourApp, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, modify, distribute, publicly display, and sublicense any content you upload, including for commercial purposes, even after you delete your account or terminate your use of the service.

We may collect and share your location data, browsing history, device identifiers, contact list, and any other information we deem useful with our marketing partners, affiliated third parties, and any successor entities, without further notice.

We reserve the right to change these terms at any time without notice to you. Your continued use of the service constitutes acceptance of any changes, even those that materially alter your rights, obligations, or the scope of data we collect.

We disclaim all warranties of any kind. To the maximum extent permitted by law, in no event shall we be liable for any damages whatsoever, including but not limited to direct, indirect, incidental, consequential, or punitive damages, even if we have been advised of the possibility of such damages.

You agree to indemnify and hold us harmless from any claims arising out of your use of the service, including claims brought by third parties.

Any dispute shall be resolved exclusively through binding individual arbitration. You waive your right to participate in class actions or to a jury trial.`,
  },
  {
    label: "Whitepaper",
    text: `INTRODUCTION

NebulaChain represents a paradigm shift in decentralized finance, leveraging cutting-edge cryptographic primitives and a novel consensus mechanism we call Adaptive Stake-Weighted Quorum Resonance (ASWQR) to deliver unprecedented throughput, security, and capital efficiency to the next generation of Web3 builders and users.

OUR VISION

We envision a future where finance is permissionless, transparent, and accessible to everyone, everywhere. NebulaChain is uniquely positioned to capture the multi-trillion dollar opportunity at the intersection of DeFi, AI, and zero-knowledge proofs. Our team of former engineers from leading institutions has deep experience building scalable systems and is uniquely qualified to execute on this vision.

THE TECHNOLOGY

NebulaChain combines the best aspects of existing blockchains while solving the limitations that have held them back. Through innovative use of homomorphic encryption, recursive SNARKs, and quantum-resistant lattice cryptography, our protocol achieves theoretical throughput exceeding 1,000,000 TPS while maintaining decentralization and security guarantees that exceed those of legacy networks.

TOKENOMICS

The NEBULA token captures value through a deflationary burn mechanism, staking rewards calculated via our proprietary Yield Optimization Algorithm, and governance utility. 40% is allocated to the team and advisors with a vesting schedule. 25% is allocated to the foundation treasury at the discretion of the founders. 15% is reserved for the seed and private round investors. The remaining 20% will be distributed to the community through various programs to be announced.

ROADMAP

Q3 2026: Testnet launch. Q4 2026: Mainnet launch. 2027: Ecosystem expansion. 2028: Global adoption.`,
  },
  {
    label: "Governance Proposal",
    text: `PROPOSAL ID: GIP-47
TITLE: Treasury Reallocation and Strategic Reserve Establishment

ABSTRACT

This proposal seeks community approval to reallocate 35% of the protocol treasury, currently valued at approximately $180M USD, into a newly-established Strategic Reserve managed by a 3-of-5 multisig comprising members of the Foundation core team. The Strategic Reserve will be deployed at the multisig's discretion for ecosystem development, strategic partnerships, and other initiatives that advance the long-term success of the protocol.

MOTIVATION

The protocol has matured significantly since its launch. Current treasury management is constrained by on-chain governance processes that require lengthy voting periods for routine operational decisions. By establishing a Strategic Reserve under a trusted multisig, we can move with greater agility in response to market opportunities while still preserving the majority of treasury assets under direct DAO control.

SPECIFICATION

The 5 multisig signers will be appointed by the Foundation in consultation with major delegates. Signers will serve indefinite terms and may be removed only by a supermajority on-chain vote requiring 75% of staked tokens, a threshold that has never been reached in the protocol's history. The multisig is not subject to public disclosure of expenditures, though it will provide quarterly summary reports.

VOTING

Voting opens immediately and closes in 48 hours. Approval requires only simple majority of cast votes (not of total supply). Voters are reminded that abstention counts as a No vote for quorum purposes but does not affect the simple-majority calculation.`,
  },
  {
    label: "Airdrop Rules",
    text: `AIRDROP ELIGIBILITY AND PARTICIPATION TERMS

By claiming the SPARK airdrop, you acknowledge and agree to the following:

1. ELIGIBILITY: Eligibility is determined at our sole discretion based on internal snapshot data which will not be made public. We reserve the right to disqualify any wallet at any time, before or after claim, for any reason including but not limited to suspected sybil activity, bot usage, or other behavior we deem inconsistent with the spirit of the airdrop. Disqualified wallets forfeit their entire allocation with no appeal process.

2. CLAIMING: Claims must be initiated within 14 days of the official claim period opening. Unclaimed tokens revert to the project treasury. Gas costs for claiming are the sole responsibility of the claimant and may be substantial during periods of network congestion.

3. VESTING: 20% of the allocation unlocks at claim. The remaining 80% vests linearly over 36 months. Selling, transferring, or pledging unvested tokens results in immediate forfeiture of all remaining unvested amounts.

4. KYC: Claimants from certain jurisdictions, to be determined post-snapshot, may be required to complete KYC including providing government identification and proof of address. Refusal to complete KYC results in forfeiture.

5. TAX: Claimants are solely responsible for any tax consequences. We make no representation that the airdrop is tax-free in any jurisdiction.

6. MODIFICATIONS: We reserve the right to modify these terms at any time, including retroactively, without notice.`,
  },
  {
    label: "Privacy Policy",
    text: `INFORMATION WE COLLECT

We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third parties.

Information you provide includes account information, payment information, and any content you upload, post, or otherwise submit.

Information collected automatically includes IP address, device identifiers, browser type, operating system, mobile network information, pages visited, time spent on pages, links clicked, search terms, referring URLs, geolocation (with permission), and behavioral data inferred from your interactions with our service.

Information from third parties includes data from advertising partners, analytics providers, identity verification services, fraud prevention services, social media platforms when you connect them, and other commercial data brokers from whom we may purchase information about you.

HOW WE USE INFORMATION

We use information for any purpose disclosed at collection or otherwise compatible with the context of collection, including improving our services, personalization, advertising, security, legal compliance, and any other lawful business purpose.

SHARING

We may share information with service providers, business partners, affiliates, advertising networks, analytics providers, in connection with mergers or acquisitions, in response to legal requests, to protect rights and safety, and with your consent or at your direction.

YOUR CHOICES

You may have certain rights depending on your jurisdiction. To exercise these rights, contact us at the address below. Note that some choices may limit the functionality of our service.

We retain information for as long as necessary for the purposes described in this policy or as required by law.`,
  },
  {
    label: "Pitch Deck",
    text: `SLIDE 1 — MISSION
We're building the future of decentralized social.

SLIDE 2 — THE PROBLEM
Web2 social platforms are broken. Users don't own their data. Creators don't own their audiences. Advertisers don't trust the metrics. The TAM is $500B and growing.

SLIDE 3 — THE SOLUTION
A decentralized social graph protocol with native monetization, on-chain identity, and AI-powered moderation. We have not yet built this product.

SLIDE 4 — MARKET OPPORTUNITY
Our SAM is $50B. Our SOM in year 3 is $5B. We project 100M users by year 5.

SLIDE 5 — TRACTION
We have 12,000 Twitter followers, 5,000 Discord members, and a waitlist of 50,000. Our testnet was used by 2,300 unique wallets last month.

SLIDE 6 — TEAM
Our founders previously worked at top tech companies and have decades of combined experience. Our advisors include luminaries from the crypto industry.

SLIDE 7 — COMPETITION
There is no real competition. Existing players are either Web2 incumbents who cannot pivot, or Web3 projects with technical limitations our protocol does not have.

SLIDE 8 — BUSINESS MODEL
We capture value through a 2% protocol fee on all transactions, token appreciation, and premium B2B services. Unit economics will be detailed in a follow-up.

SLIDE 9 — THE ASK
We are raising a $25M seed round at a $250M valuation. Funds will be used for engineering, marketing, and ecosystem grants.

SLIDE 10 — WHY NOW
The convergence of AI, blockchain, and shifting user preferences makes this the perfect moment. The window is closing fast.`,
  },
]

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const
export type RiskLevel = (typeof RISK_LEVELS)[number] | "Unknown"
