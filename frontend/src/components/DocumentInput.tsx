import { useCallback, useRef, useState } from "react"
import { MAX_DOCUMENT_LENGTH, EXAMPLE_DOCS } from "../lib/constants"
import { useRotatingPlaceholder } from "../hooks/useRotatingPlaceholder"
import { useFileUpload } from "../hooks/useFileUpload"
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
  const [loadedFile, setLoadedFile] = useState<{
    filename: string
    type: "pdf" | "docx"
    charCount: number
    pageCount?: number
  } | null>(null)
  const [focused, setFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const upload = useFileUpload({ maxCharLength: MAX_DOCUMENT_LENGTH })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const showRotating = text.length === 0 && !focused && !isAnalyzing
  const rotatingPlaceholder = useRotatingPlaceholder(showRotating)

  const charCount = text.length
  const isOverLimit = charCount > MAX_DOCUMENT_LENGTH
  const canSubmit = !isAnalyzing && walletReady && text.trim().length > 0 && !isOverLimit
  const percentUsed = Math.min(100, (charCount / MAX_DOCUMENT_LENGTH) * 100)

  const inputsDisabled = isAnalyzing || upload.isExtracting

  function handleExampleClick(label: string) {
    const example = EXAMPLE_DOCS.find((e) => e.label === label)
    if (!example) return
    setText(example.text)
    setLoadedExample(label)
    setLoadedFile(null)
    upload.reset()
  }

  function handleTextChange(value: string) {
    setText(value)
    if (loadedExample) {
      const example = EXAMPLE_DOCS.find((e) => e.label === loadedExample)
      if (example && value !== example.text) {
        setLoadedExample(null)
      }
    }
    if (loadedFile) {
      // Any manual edit after a file load dismisses the file pill.
      setLoadedFile(null)
    }
  }

  function handleClear() {
    setText("")
    setLoadedExample(null)
    setLoadedFile(null)
    upload.reset()
    onClear?.()
  }

  async function handleSubmit() {
    if (!canSubmit) return
    await onAnalyze(text.trim())
  }

  const handleFile = useCallback(
    async (file: File) => {
      const extracted = await upload.extractText(file)
      if (extracted) {
        setText(extracted.text)
        setLoadedExample(null)
        setLoadedFile({
          filename: extracted.filename,
          type: extracted.type,
          charCount: extracted.charCount,
          pageCount: extracted.pageCount,
        })
      }
    },
    [upload]
  )

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      void handleFile(file)
    }
    // Reset the input so the same filename can be re-selected later.
    e.target.value = ""
  }

  function handleDropZoneClick() {
    if (inputsDisabled) return
    fileInputRef.current?.click()
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    if (inputsDisabled) return
    setIsDragging(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (inputsDisabled) return
    e.dataTransfer.dropEffect = "copy"
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    // Only clear dragging when leaving the drop zone itself, not children.
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (inputsDisabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFile(file)
    }
  }

  function dismissLoadedFile() {
    setLoadedFile(null)
    upload.reset()
    // Note: we deliberately do NOT clear the text. The user may want to keep
    // the extracted text & edit it; only the "loaded from file" pill goes away.
  }

  function dismissUploadError() {
    upload.reset()
  }

  const dropZoneClasses = [
    "cl-input__dropzone",
    isDragging ? "cl-input__dropzone--dragging" : "",
    upload.isExtracting ? "cl-input__dropzone--extracting" : "",
    upload.error ? "cl-input__dropzone--error" : "",
    inputsDisabled ? "cl-input__dropzone--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <section className="cl-input cl-glass" aria-label="Document analysis input">
      <div className="cl-input__header">
        <h2 className="cl-input__title">Submit a document for analysis</h2>
        <p className="cl-input__subtitle">
          Drop a PDF or DOCX, paste any text, or try one of the example documents below.
        </p>
        <p className="cl-input__disclaimer">
          <span aria-hidden="true">ⓘ</span> Analyses are stored on-chain on GenLayer Studio Network & are publicly verifiable. Anyone can view all analyses through the contract or the Public Feed below.
        </p>
      </div>

      <div
        className={dropZoneClasses}
        onClick={handleDropZoneClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={inputsDisabled ? -1 : 0}
        aria-label="Upload a PDF or DOCX file"
        onKeyDown={(e) => {
          if (inputsDisabled) return
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInputChange}
          className="cl-input__file-hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        {upload.isExtracting ? (
          <div className="cl-input__dropzone-state">
            <span className="cl-spinner" aria-hidden="true" />
            <span>Extracting text…</span>
          </div>
        ) : upload.error ? (
          <div className="cl-input__dropzone-state cl-input__dropzone-state--error">
            <span aria-hidden="true">⚠</span>
            <span className="cl-input__dropzone-error-text">{upload.error.message}</span>
            <button
              className="cl-input__dropzone-dismiss"
              onClick={(e) => {
                e.stopPropagation()
                dismissUploadError()
              }}
              type="button"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        ) : loadedFile ? (
          <div className="cl-input__dropzone-state cl-input__dropzone-state--success">
            <span className="cl-input__dropzone-filetag mono">
              {loadedFile.type.toUpperCase()}
            </span>
            <span className="cl-input__dropzone-filename">{loadedFile.filename}</span>
            <span className="cl-input__dropzone-meta mono">
              {loadedFile.pageCount ? `${loadedFile.pageCount} pages · ` : ""}
              {loadedFile.charCount.toLocaleString()} chars
            </span>
            <button
              className="cl-input__dropzone-dismiss"
              onClick={(e) => {
                e.stopPropagation()
                dismissLoadedFile()
              }}
              type="button"
              aria-label="Dismiss loaded file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="cl-input__dropzone-state cl-input__dropzone-state--idle">
            <span className="cl-input__dropzone-icon" aria-hidden="true">⤓</span>
            <span className="cl-input__dropzone-prompt">
              Drop a PDF or DOCX here, or <span className="cl-input__dropzone-link">click to upload</span>
            </span>
            <span className="cl-input__dropzone-hint mono">max 25 MB · text-based files only</span>
          </div>
        )}
      </div>

      <div className="cl-input__textarea-wrap">
        <textarea
          className={`cl-input__textarea ${isOverLimit ? "cl-input__textarea--over" : ""}`}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showRotating ? rotatingPlaceholder : "Or paste any document here…"}
          disabled={inputsDisabled}
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
              disabled={inputsDisabled}
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
