import { useCallback, useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import mammoth from "mammoth"

// Worker served from public/pdf.worker.min.mjs as a static asset.
// Kept in sync with the pdfjs-dist version by the copy-pdf-worker npm
// script (see package.json scripts), which runs on predev & prebuild.
// This bypasses Vite's module pipeline entirely, which was returning
// stub responses for the worker in dev mode under all bundler-integrated
// approaches (?worker&url, ?url, new URL(import.meta.url)).
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

export type FileType = "pdf" | "docx"

export interface ExtractedDocument {
  text: string
  filename: string
  type: FileType
  charCount: number
  pageCount?: number
}

export type FileUploadError =
  | { kind: "unsupported-type"; message: string }
  | { kind: "file-too-large"; message: string }
  | { kind: "extraction-failed"; message: string }
  | { kind: "encrypted-pdf"; message: string }
  | { kind: "empty-document"; message: string }
  | { kind: "exceeds-char-limit"; message: string }

interface UseFileUploadOptions {
  /** Maximum extracted text length in chars. Files producing more are rejected. */
  maxCharLength: number
  /** Maximum raw file size in bytes. Prevents browser hangs on huge PDFs. */
  maxFileBytes?: number
}

const DEFAULT_MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB raw file size cap

const SUPPORTED_EXTENSIONS = [".pdf", ".docx"] as const

const MIME_TYPE_MAP: Record<string, FileType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

function detectFileType(file: File): FileType | null {
  // MIME type first
  const fromMime = MIME_TYPE_MAP[file.type]
  if (fromMime) return fromMime

  // Extension fallback — some browsers misreport MIME for .docx
  const name = file.name.toLowerCase()
  if (name.endsWith(".pdf")) return "pdf"
  if (name.endsWith(".docx")) return "docx"
  return null
}

async function extractPdfText(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    // Disable font rendering since we only want text. Reduces memory.
    disableFontFace: true,
    // Suppress console noise from pdfjs internals.
    verbosity: 0,
  })

  let pdf
  try {
    pdf = await loadingTask.promise
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (/password|encrypt/i.test(message)) {
      throw { kind: "encrypted-pdf", message: "This PDF is password-protected or encrypted. Please unlock it & try again." } satisfies FileUploadError
    }
    throw { kind: "extraction-failed", message: `Could not read this PDF: ${message}` } satisfies FileUploadError
  }

  const pageCount = pdf.numPages
  const pageTexts: string[] = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    // Each item.str is a text fragment. Join with spaces & collapse later.
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
    pageTexts.push(pageText)
    // Release page resources to keep memory bounded on large PDFs.
    page.cleanup()
  }

  // Join pages with double-newline so paragraph boundaries survive.
  // Collapse runs of whitespace within each page since pdfjs gives us
  // many small fragments separated by spaces.
  const cleaned = pageTexts
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0)
    .join("\n\n")

  return { text: cleaned, pageCount }
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  try {
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value.trim()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw { kind: "extraction-failed", message: `Could not read this DOCX: ${message}` } satisfies FileUploadError
  }
}

export function useFileUpload(options: UseFileUploadOptions) {
  const { maxCharLength, maxFileBytes = DEFAULT_MAX_FILE_BYTES } = options

  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<FileUploadError | null>(null)
  const [result, setResult] = useState<ExtractedDocument | null>(null)

  // Tracks the latest extract call so stale callbacks can be discarded
  // if the user drops a second file while the first is still parsing.
  const extractIdRef = useRef(0)
  // Tracks whether the component is still mounted so we never set state
  // after unmount — extraction can run for many seconds on large files.
  // The ref is reset to true on every mount (inside the effect body, NOT
  // just at useRef init) because React 18 StrictMode mounts, unmounts,
  // then mounts again in dev. Without this reset, the first cleanup
  // leaves mountedRef permanently false from the second mount onward,
  // causing every isStale() check to fire & every extractText to silently
  // return null — which is exactly the hang we just debugged.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setIsExtracting(false)
    setError(null)
    setResult(null)
  }, [])

  const extractText = useCallback(
    async (file: File): Promise<ExtractedDocument | null> => {
      const myId = ++extractIdRef.current
      const isStale = () => extractIdRef.current !== myId || !mountedRef.current

      setIsExtracting(true)
      setError(null)
      setResult(null)

      // Pre-flight: file size
      if (file.size > maxFileBytes) {
        const mb = (file.size / (1024 * 1024)).toFixed(1)
        const capMb = (maxFileBytes / (1024 * 1024)).toFixed(0)
        const err: FileUploadError = {
          kind: "file-too-large",
          message: `This file is ${mb} MB which exceeds the ${capMb} MB cap. Try a smaller document.`,
        }
        if (!isStale()) {
          setError(err)
          setIsExtracting(false)
        }
        return null
      }

      // Pre-flight: type
      const type = detectFileType(file)
      if (!type) {
        const err: FileUploadError = {
          kind: "unsupported-type",
          message: `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}.`,
        }
        if (!isStale()) {
          setError(err)
          setIsExtracting(false)
        }
        return null
      }

      // Extract
      let text = ""
      let pageCount: number | undefined
      try {
        if (type === "pdf") {
          const r = await extractPdfText(file)
          text = r.text
          pageCount = r.pageCount
        } else {
          text = await extractDocxText(file)
        }
      } catch (err: unknown) {
        if (!isStale()) {
          // err is either a FileUploadError thrown by extractor or unexpected
          const isOurError =
            typeof err === "object" && err !== null && "kind" in err && "message" in err
          if (isOurError) {
            setError(err as FileUploadError)
          } else {
            const message = err instanceof Error ? err.message : String(err)
            setError({ kind: "extraction-failed", message })
          }
          setIsExtracting(false)
        }
        return null
      }

      if (isStale()) return null

      // Post-extraction validation
      if (text.length === 0) {
        const err: FileUploadError = {
          kind: "empty-document",
          message:
            type === "pdf"
              ? "No text could be extracted. This PDF may be a scanned image. Paste the text manually instead."
              : "No text could be extracted from this document.",
        }
        setError(err)
        setIsExtracting(false)
        return null
      }

      if (text.length > maxCharLength) {
        const err: FileUploadError = {
          kind: "exceeds-char-limit",
          message: `Extracted text is ${text.length.toLocaleString()} chars, which exceeds the ${maxCharLength.toLocaleString()} char limit. Try a shorter document or paste a section.`,
        }
        setError(err)
        setIsExtracting(false)
        return null
      }

      const extracted: ExtractedDocument = {
        text,
        filename: file.name,
        type,
        charCount: text.length,
        pageCount,
      }
      setResult(extracted)
      setIsExtracting(false)
      return extracted
    },
    [maxCharLength, maxFileBytes]
  )

  return {
    extractText,
    reset,
    isExtracting,
    error,
    result,
  }
}

