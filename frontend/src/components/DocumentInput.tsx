import { useState } from "react"
import { MAX_DOCUMENT_LENGTH, EXAMPLE_DOCS } from "../lib/constants"
import { useRotatingPlaceholder } from "../hooks/useRotatingPlaceholder"
import "./DocumentInput.css"

interface DocumentInputProps {
  onAnalyze: (text: string) => Promise<void>
  onClear?: () => void
  isAnalyzing: boolean
  loadingMessage: string
  walletReady: boolean
  walletStatusMessage: string
}

export function DocumentInput({
  onAnalyze,
  onClear,
  isAnalyzing,
  loadingMessage,
  walletReady,
  walletStatusMessage,
}: DocumentInputProps) {
  const [text, setText] = useState("")
  const [loadedExample, setLoadedExample] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  const showRotating = text.length === 0 && !focused && !isAnalyzing
  const rotatingPlaceholder = useRotatingPlaceholder(showRotating)

  const charCount = text.length
  const isOverLimit = charCount > MAX_DOCUMENT_LENGTH
  const canSubmit = !isAnalyzing && walletReady && text.trim().length > 0 && !isOverLimit
  const percentUsed = Math.min(100, (charCount / MAX_DOCUMENT_LENGTH) * 100)

  function handleExampleClick(label: string) {
    const example = EXAMPLE_DOCS.find((e) => e.label === label)
    if (!example) return
    setText(example.text)
    setLoadedExample(label)
  }

  function handleTextChange(value: string) {
    setText(value)
    if (loadedExample) {
      const example = EXAMPLE_DOCS.find((e) => e.label === loadedExample)
      if (example && value !== example.text) {
        setLoadedExample(null)
      }
    }
  }

  function handleClear() {
    setText("")
    setLoadedExample(null)
    onClear?.()
  }

  async function handleSubmit() {
    if (!canSubmit) return
    await onAnalyze(text.trim())
  }

  return (
    <section className="cl-input cl-glass" aria-label="Document analysis input">
      <div className="cl-input__header">
        <h2 className="cl-input__title">Submit a document for analysis</h2>
        <p className="cl-input__subtitle">
          Paste any text, or try one of the example documents below to see how it works.
        </p>
        <p className="cl-input__disclaimer">
          <span aria-hidden="true">ⓘ</span> Analyses are stored on-chain on GenLayer Studio Network & are publicly verifiable. Anyone can view all analyses through the contract or the Public Feed below.
        </p>
      </div>

      <div className="cl-input__textarea-wrap">
        <textarea
          className={`cl-input__textarea ${isOverLimit ? "cl-input__textarea--over" : ""}`}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showRotating ? rotatingPlaceholder : "Paste any document…"}
          disabled={isAnalyzing}
          spellCheck={false}
          rows={10}
        />

        {text.length > 0 && !isAnalyzing && (
          <button
            className="cl-input__clear"
            onClick={handleClear}
            type="button"
            aria-label="Clear document"
            title="Clear"
          >
            Clear
          </button>
        )}

        <div className="cl-input__counter-wrap">
          <div className="cl-input__counter-bar">
            <div
              className={`cl-input__counter-fill ${isOverLimit ? "cl-input__counter-fill--over" : ""}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <span className={`cl-input__counter mono ${isOverLimit ? "cl-input__counter--over" : ""}`}>
            {charCount.toLocaleString()} / {MAX_DOCUMENT_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="cl-input__presets-block">
        <span className="cl-input__presets-label">Try an example:</span>
        <div className="cl-input__presets" role="group" aria-label="Example documents">
          {EXAMPLE_DOCS.map((example) => (
            <button
              key={example.label}
              className={`cl-chip ${loadedExample === example.label ? "cl-chip--active" : ""}`}
              onClick={() => handleExampleClick(example.label)}
              disabled={isAnalyzing}
              type="button"
              title={`Load ${example.label} example`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cl-input__actions">
        <div className="cl-input__btn-wrap">
          {!isAnalyzing && walletReady && <span className="cl-input__pulse-ring" aria-hidden="true" />}
          {!isAnalyzing && walletReady && <span className="cl-input__pulse-ring cl-input__pulse-ring--2" aria-hidden="true" />}
          <button
            className="cl-btn cl-btn--analyze"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isAnalyzing ? (
              <>
                <span className="cl-spinner" aria-hidden="true" />
                <span>{loadingMessage}</span>
              </>
            ) : (
              <>Analyze with GenLayer Validators →</>
            )}
          </button>
        </div>

        {!walletReady && walletStatusMessage && !isAnalyzing && (
          <p className="cl-input__hint cl-input__hint--warn">{walletStatusMessage}</p>
        )}

        {walletReady && !isAnalyzing && (
          <p className="cl-input__hint">
            Analysis takes 1 to 6 minutes on Studio Network. Validators reach consensus independently before results are finalized.
          </p>
        )}
      </div>
    </section>
  )
}