import "./FAQ.css"

const ITEMS = [
  {
    q: "What do I need to use it?",
    a: "A crypto wallet, like MetaMask. ClauseLens currently runs on GenLayer Studio Network, where the built-in faucet covers gas — so right now, analyzing a document costs you nothing beyond connecting a wallet. No account, no subscription, no signup.",
  },
  {
    q: "Does my document stay private?",
    a: "Your file is parsed entirely in your browser & never uploaded to a server. When you submit for analysis, the text is sent to GenLayer validators & the result is stored on-chain, publicly — so do not paste anything you would not want public. For sensitive documents, analyze a representative excerpt instead of the whole thing.",
  },
  {
    q: "How accurate is it?",
    a: "ClauseLens does not give legal advice — it surfaces patterns. Multiple independent AI validators read each document & reach consensus, which is more robust than any single model, but it is a reading aid, not a lawyer. Use it to know what to look closer at.",
  },
  {
    q: "What is GenLayer & why does it matter?",
    a: "GenLayer is a blockchain where validators are AI models that can reason about natural language & reach consensus on subjective questions — something traditional chains cannot do. That is what lets ClauseLens treat \u201Cis this document manipulative\u201D as a question a decentralized network can actually answer.",
  },
  {
    q: "What does validator disagreement mean?",
    a: "When validators agree, the document's intent is clear. When they disagree, that disagreement is itself signal — it usually means the language is genuinely ambiguous or deliberately slippery. ClauseLens shows you the disagreement instead of hiding it behind a single confident-sounding score.",
  },
  {
    q: "What kinds of documents can I analyze?",
    a: "Anything text-based: terms of service, privacy policies, whitepapers, tokenomics pages, governance proposals, airdrop rules, pitch decks. Paste text directly, or upload a PDF or DOCX.",
  },
]

export function FAQ() {
  return (
    <section className="cl-faq" aria-label="Frequently asked questions">
      <div className="cl-faq__intro">
        <span className="cl-faq__eyebrow">Questions</span>
        <h2 className="cl-faq__heading">What people ask before their first analysis.</h2>
      </div>

      <div className="cl-faq__list">
        {ITEMS.map((item) => (
          <div key={item.q} className="cl-faq__item">
            <h3 className="cl-faq__q">{item.q}</h3>
            <p className="cl-faq__a">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
