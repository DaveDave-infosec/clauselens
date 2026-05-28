import { useLayoutEffect } from "react"
import { MarketingNav } from "../components/MarketingNav"
import { MarketingFooter } from "../components/MarketingFooter"
import "./HowItWorks.css"

export default function HowItWorks() {
  useLayoutEffect(() => {
    document.documentElement.dataset.surface = "marketing"
  }, [])

  return (
    <div className="cl-hiwpage">
      <MarketingNav />

      <main className="cl-hiwpage__main">
        <header className="cl-hiwpage__hero">
          <span className="cl-hiwpage__eyebrow">How it works</span>
          <h1 className="cl-hiwpage__title">How ClauseLens reads a document.</h1>
          <p className="cl-hiwpage__standfirst">
            Most analysis tools ask one model for one answer. ClauseLens asks several independent
            validators to reason about the same document — then treats the shape of their agreement
            as the result.
          </p>
        </header>

        <section className="cl-hiwpage__section">
          <div className="cl-hiwpage__section-head">
            <span className="cl-hiwpage__section-num mono">01</span>
            <h2 className="cl-hiwpage__section-title">Many readers, one verdict.</h2>
          </div>
          <div className="cl-hiwpage__section-body">
            <p>
              When you submit a document, it does not go to a single model. It goes to multiple
              validators on GenLayer, & each one independently reasons about the document's intent,
              its clarity, & the manipulation hiding in its language.
            </p>
            <p>
              GenLayer then reconciles those independent readings using a primitive called the
              equivalence principle — <code>eq_principle</code>. Instead of requiring validators to
              return byte-for-byte identical answers, which is impossible for natural-language
              reasoning, it checks whether their conclusions are equivalent within a defined
              tolerance. If they agree closely enough, consensus is reached & the result is
              finalized on-chain.
            </p>
            <p>
              That is the part traditional chains cannot do. A normal smart contract can agree on a
              number or a token balance, but it cannot agree on a question like "is this document
              manipulative." GenLayer can — & that is what ClauseLens is built on.
            </p>
          </div>
        </section>

        <section className="cl-hiwpage__section">
          <div className="cl-hiwpage__section-head">
            <span className="cl-hiwpage__section-num mono">02</span>
            <h2 className="cl-hiwpage__section-title">Three numbers, three different questions.</h2>
          </div>
          <div className="cl-hiwpage__section-body">
            <div className="cl-hiwpage__scores">
              <div className="cl-hiwpage__score">
                <div className="cl-hiwpage__score-head">
                  <span className="cl-hiwpage__score-name">Manipulation</span>
                  <span className="cl-hiwpage__score-dir mono">0–100 · high is bad</span>
                </div>
                <p className="cl-hiwpage__score-desc">
                  How hard the document is working to get you to agree to something against your
                  interest — buried permissions, coercive defaults, asymmetric obligations.
                </p>
              </div>
              <div className="cl-hiwpage__score">
                <div className="cl-hiwpage__score-head">
                  <span className="cl-hiwpage__score-name">Clarity</span>
                  <span className="cl-hiwpage__score-dir mono">0–100 · high is good</span>
                </div>
                <p className="cl-hiwpage__score-desc">
                  How honestly the document communicates. A high score means it says what it means;
                  a low score means meaning is obscured, whether by accident or by design.
                </p>
              </div>
              <div className="cl-hiwpage__score">
                <div className="cl-hiwpage__score-head">
                  <span className="cl-hiwpage__score-name">Jargon</span>
                  <span className="cl-hiwpage__score-dir mono">0–100 · high is bad</span>
                </div>
                <p className="cl-hiwpage__score-desc">
                  How much specialized or inflated language stands between you & understanding —
                  technical fog that hides simple realities.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cl-hiwpage__section">
          <div className="cl-hiwpage__section-head">
            <span className="cl-hiwpage__section-num mono">03</span>
            <h2 className="cl-hiwpage__section-title">When validators disagree, that is the finding.</h2>
          </div>
          <div className="cl-hiwpage__section-body">
            <p>
              Most tools hide uncertainty behind one confident-sounding score. ClauseLens does the
              opposite — it surfaces it. When independent validators converge, the document's intent
              is legible. When they diverge, it usually means the language is genuinely ambiguous, or
              deliberately engineered to resist a single reading.
            </p>
            <p>
              That divergence is itself diagnostic. A document that makes independent reasoners
              disagree about what it actually does is telling you something. The disagreement score
              is not noise around the "real" answer — on a slippery document, it <em>is</em> the
              answer.
            </p>
          </div>
        </section>

        <section className="cl-hiwpage__section">
          <div className="cl-hiwpage__section-head">
            <span className="cl-hiwpage__section-num mono">04</span>
            <h2 className="cl-hiwpage__section-title">Every analysis is on the record.</h2>
          </div>
          <div className="cl-hiwpage__section-body">
            <p>
              Each analysis is stored on-chain on GenLayer & is publicly verifiable. Anyone can audit
              any result through the contract — the document type, the three scores, the validator
              disagreement, & the submitting address. Nothing is hidden in a private database you have
              to take on trust.
            </p>
            <p>
              This is also why submissions are public. The same transparency that lets anyone verify
              a result is what makes every submission visible on-chain. ClauseLens is verifiable by
              design, not by promise.
            </p>
          </div>
        </section>

        <section className="cl-hiwpage__cta">
          <h2 className="cl-hiwpage__cta-heading">Ready to see one for yourself?</h2>
          <p className="cl-hiwpage__cta-sub">
            Paste a document, connect a wallet, & watch independent validators reach a verdict.
          </p>
          <a href="/analyze" className="cl-hiwpage__cta-btn">Launch the app →</a>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
