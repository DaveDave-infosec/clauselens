import { useCallback, useEffect, useRef, useState } from "react"
import { AmbientBackground } from "./components/AmbientBackground"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { DocumentInput } from "./components/DocumentInput"
import { AnalysisResult } from "./components/AnalysisResult"
import { RecentAnalyses } from "./components/RecentAnalyses"
import { useWallet } from "./hooks/useWallet"
import { useAnalyze } from "./hooks/useAnalyze"
import { useAnalyses } from "./hooks/useAnalyses"
import type { AnalysisResult as AnalysisResultData } from "./lib/genlayer"
import "./styles/global.css"
import "./App.css"

export default function App() {
  const wallet = useWallet()
  const [selected, setSelected] = useState<AnalysisResultData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const resultRef = useRef<HTMLDivElement | null>(null)

  // Pause the recent-feed background polling while an analyze is in flight
  // to reduce RPC pressure (rate-limit avoidance).
  const feed = useAnalyses({ paused: isAnalyzing })

  const handleResult = useCallback(
    (result: AnalysisResultData) => {
      setSelected(result)
      setIsAnalyzing(false)
      setTimeout(() => {
        feed.refresh()
      }, 1500)
      // Smooth-scroll the result card into view after a short delay
      // to let the fade-in animation settle before scrolling.
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }, 300)
    },
    [feed]
  )

  const handleStart = useCallback(() => {
    setIsAnalyzing(true)
  }, [])

  const analyze = useAnalyze({ onResult: handleResult, onStart: handleStart })

  // Mirror analyze.isAnalyzing into our local flag so the feed pause stays
  // in sync even on error/timeout paths.
  useEffect(() => {
    if (!analyze.isAnalyzing && isAnalyzing) {
      setIsAnalyzing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyze.isAnalyzing])

  const walletReady = !!wallet.address && wallet.isCorrectChain
  const walletStatusMessage = !wallet.address
    ? "Connect your wallet to submit a document."
    : !wallet.isCorrectChain
      ? "Switch to GenLayer Bradbury Testnet to continue."
      : ""

  const handleAnalyze = useCallback(
    async (text: string) => {
      if (!wallet.address) return
      setSelected(null)
      await analyze.analyze(text, wallet.address)
    },
    [analyze, wallet.address]
  )

  const handleClearInput = useCallback(() => {
    setSelected(null)
    analyze.reset()
  }, [analyze])

  const handleSelectFromFeed = useCallback((a: AnalysisResultData) => {
    setSelected(a)
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }, 100)
  }, [])

  const errorBanner = analyze.error || wallet.error

  useEffect(() => {
    if (!errorBanner) return
    const t = setTimeout(() => {
      analyze.reset()
    }, 12000)
    return () => clearTimeout(t)
  }, [errorBanner, analyze])

  return (
    <>
      <AmbientBackground />
      <div className="app-shell">
        <Header wallet={wallet} />

        <main className="app-main">
          <Hero />

          {errorBanner && (
            <div className="cl-banner cl-banner--error fade-in">
              <span className="cl-banner__icon" aria-hidden="true">⚠</span>
              <span>{errorBanner}</span>
            </div>
          )}

          <DocumentInput
            onAnalyze={handleAnalyze}
            onClear={handleClearInput}
            isAnalyzing={analyze.isAnalyzing}
            loadingMessage={analyze.loadingMessage}
            walletReady={walletReady}
            walletStatusMessage={walletStatusMessage}
          />

          {selected && (
            <div ref={resultRef}>
              <AnalysisResult analysis={selected} currentWallet={wallet.address} />
            </div>
          )}

          <RecentAnalyses
            analyses={feed.analyses}
            isLoading={feed.isLoading}
            error={feed.error}
            onSelect={handleSelectFromFeed}
            selectedId={selected?.analysis_id}
            currentWallet={wallet.address}
          />

          <footer className="cl-footer">
            <p>
              Built on <a href="https://genlayer.com" target="_blank" rel="noreferrer noopener">GenLayer</a>
              {" "}— where AI consensus meets document truth.
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}