import "./HowItWorksStrip.css"

const STEPS = [
  {
    n: "01",
    title: "Paste anything",
    body: "Drop a contract, whitepaper, privacy policy, or tokenomics page. No account, no signup. Your document never leaves your browser until you choose to analyze it.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 4h9l5 5v19a1 1 0 01-1 1H9a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M18 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 16h8M12 20h8M12 24h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Validators reason independently",
    body: "Multiple AI validators on GenLayer each read the document & reach their own conclusions about its intent, clarity, & hidden manipulation. No single model, no single point of failure.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="23" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 11L14 20M21.5 11L18 20M11 9h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Consensus becomes signal",
    body: "When validators agree, you get a confident read. When they disagree, that disagreement is itself a signal — the document's intent is genuinely ambiguous, or deliberately slippery.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 16l6-9M11 16l6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export function HowItWorksStrip() {
  return (
    <section className="cl-hiw" aria-label="How ClauseLens works">
      <div className="cl-hiw__intro">
        <span className="cl-hiw__eyebrow">How it works</span>
        <h2 className="cl-hiw__heading">Three steps from raw text to honest signal.</h2>
      </div>

      <div className="cl-hiw__steps">
        {STEPS.map((step) => (
          <div key={step.n} className="cl-hiw__step">
            <div className="cl-hiw__step-top">
              <span className="cl-hiw__step-icon">{step.icon}</span>
              <span className="cl-hiw__step-num mono">{step.n}</span>
            </div>
            <h3 className="cl-hiw__step-title">{step.title}</h3>
            <p className="cl-hiw__step-body">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
