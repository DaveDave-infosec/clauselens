import { useEffect, useRef, useState } from "react"
import { shortAddress, explorerAddressUrl } from "../lib/genlayer"
import { CONTRACT_ADDRESS } from "../lib/constants"
import type { WalletState } from "../hooks/useWallet"
import "./Header.css"

interface HeaderProps {
  wallet: WalletState & {
    connect: () => Promise<void>
    disconnect: () => void
    switchChain: () => Promise<void>
    hasMetaMask: boolean
  }
}

export function Header({ wallet }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [menuOpen])

  async function handleCopy() {
    if (!wallet.address) return
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // silent
    }
  }

  function handleDisconnect() {
    setMenuOpen(false)
    wallet.disconnect()
  }

  return (
    <header className="cl-header">
      <div className="cl-header__brand">
        <div className="cl-header__logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="header-logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c5cff" />
                <stop offset="100%" stopColor="#00e5d1" />
              </linearGradient>
            </defs>
            <circle cx="13" cy="13" r="9" fill="none" stroke="url(#header-logo-grad)" strokeWidth="2" />
            <circle cx="13" cy="13" r="3" fill="url(#header-logo-grad)" />
            <line x1="19.5" y1="19.5" x2="28" y2="28" stroke="url(#header-logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="cl-header__title-block">
          <h1 className="cl-header__title">ClauseLens</h1>
          <p className="cl-header__tagline">Document forensics on GenLayer</p>
        </div>
      </div>

      <div className="cl-header__actions">
        <a
          className="cl-header__contract-link mono"
          href={explorerAddressUrl(CONTRACT_ADDRESS)}
          target="_blank"
          rel="noreferrer noopener"
          title="View contract on Bradbury explorer"
        >
          {shortAddress(CONTRACT_ADDRESS)} ↗
        </a>

        {wallet.address ? (
          <div className="cl-header__wallet" ref={menuRef}>
            {!wallet.isCorrectChain && (
              <button className="cl-btn cl-btn--warning" onClick={wallet.switchChain}>
                Switch to Bradbury
              </button>
            )}
            <button
              className={`cl-header__address ${menuOpen ? "cl-header__address--open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="cl-header__dot" />
              <span className="mono">{shortAddress(wallet.address)}</span>
              <svg
                className="cl-header__caret"
                viewBox="0 0 10 6"
                width="10"
                height="6"
                fill="none"
                aria-hidden="true"
              >
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div className="cl-wallet-menu" role="menu">
                <div className="cl-wallet-menu__address mono" title={wallet.address}>
                  {wallet.address}
                </div>
                <button className="cl-wallet-menu__item" onClick={handleCopy} role="menuitem">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="5" width="8" height="8" rx="1.5" />
                    <path d="M3 11V4a1 1 0 011-1h7" />
                  </svg>
                  <span>{copied ? "Copied!" : "Copy address"}</span>
                </button>
                <a
                  className="cl-wallet-menu__item"
                  href={explorerAddressUrl(wallet.address)}
                  target="_blank"
                  rel="noreferrer noopener"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 3h4v4" />
                    <path d="M13 3l-7 7" />
                    <path d="M11 9v3a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h3" />
                  </svg>
                  <span>View on explorer</span>
                </a>
                <div className="cl-wallet-menu__divider" />
                <button className="cl-wallet-menu__item cl-wallet-menu__item--danger" onClick={handleDisconnect} role="menuitem">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 13H3a1 1 0 01-1-1V4a1 1 0 011-1h3" />
                    <path d="M10 11l3-3-3-3" />
                    <path d="M13 8H6" />
                  </svg>
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="cl-btn cl-btn--primary"
            onClick={wallet.connect}
            disabled={wallet.isConnecting || !wallet.hasMetaMask}
          >
            {wallet.isConnecting
              ? "Connecting…"
              : wallet.hasMetaMask
                ? "Connect Wallet"
                : "Install MetaMask"}
          </button>
        )}
      </div>
    </header>
  )
}