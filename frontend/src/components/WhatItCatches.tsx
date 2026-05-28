import "./WhatItCatches.css"

const PATTERNS = [
  {
    name: "Perpetual data licenses",
    body: "Grants that let a company use, sell, or sublicense your content forever — even after you delete your account.",
  },
  {
    name: "Forced arbitration & class-action waivers",
    body: "Clauses that quietly strip your right to sue, or to join others who were harmed the same way.",
  },
  {
    name: "Retroactive term changes",
    body: "Language that lets terms change at any time, with your continued use counting as agreement to whatever they become.",
  },
  {
    name: "Vague tokenomics",
    body: "Allocation tables & vesting schedules written to obscure how much insiders keep, & when they can sell.",
  },
  {
    name: "Sweeping liability disclaimers",
    body: "Broad limitations that leave you with no recourse when something goes wrong.",
  },
  {
    name: "Discretionary eligibility",
    body: "Airdrop & reward rules where \u201Csole discretion\u201D means they can disqualify you for any reason, with no appeal.",
  },
]

export function WhatItCatches() {
  return (
    <section className="cl-catches" aria-label="What ClauseLens catches">
      <div className="cl-catches__intro">
        <span className="cl-catches__eyebrow">What it catches</span>
        <h2 className="cl-catches__heading">The tricks documents use, named & scored.</h2>
        <p className="cl-catches__lede">
          Manipulation hides in language most people skim past. These are the patterns ClauseLens is built to surface — the ones you have probably already agreed to without knowing.
        </p>
      </div>

      <div className="cl-catches__grid">
        {PATTERNS.map((p) => (
          <div key={p.name} className="cl-catches__item">
            <h3 className="cl-catches__item-name">{p.name}</h3>
            <p className="cl-catches__item-body">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
