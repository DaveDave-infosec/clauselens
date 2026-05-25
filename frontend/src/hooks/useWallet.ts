import { useCallback, useEffect, useState } from "react"
import {
  connectWallet,
  getCurrentChainId,
  hasMetaMask,
  switchToStudio,
} from "../lib/genlayer"
import { STUDIO_CHAIN_ID_HEX } from "../lib/constants"

export interface WalletState {
  address: string | null
  chainId: string | null
  isCorrectChain: boolean
  isConnecting: boolean
  error: string | null
}

const CONNECTED_FLAG_KEY = "clauselens.wallet.connected"

function readConnectedFlag(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(CONNECTED_FLAG_KEY) === "true"
  } catch {
    return false
  }
}

function writeConnectedFlag(value: boolean): void {
  if (typeof window === "undefined") return
  try {
    if (value) {
      window.localStorage.setItem(CONNECTED_FLAG_KEY, "true")
    } else {
      window.localStorage.removeItem(CONNECTED_FLAG_KEY)
    }
  } catch {
    // ignore
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isCorrectChain: false,
    isConnecting: false,
    error: null,
  })

  const refreshChain = useCallback(async () => {
    if (!hasMetaMask()) return
    try {
      const chainId = await getCurrentChainId()
      setState((s) => ({
        ...s,
        chainId,
        isCorrectChain: chainId.toLowerCase() === STUDIO_CHAIN_ID_HEX.toLowerCase(),
      }))
    } catch {
      // ignore
    }
  }, [])

  const connect = useCallback(async () => {
    if (!hasMetaMask()) {
      setState((s) => ({ ...s, error: "MetaMask not detected. Please install MetaMask." }))
      return
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }))
    try {
      const address = await connectWallet()
      const chainId = await getCurrentChainId()
      const isCorrectChain = chainId.toLowerCase() === STUDIO_CHAIN_ID_HEX.toLowerCase()
      writeConnectedFlag(true)
      setState({
        address,
        chainId,
        isCorrectChain,
        isConnecting: false,
        error: null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet."
      setState((s) => ({ ...s, isConnecting: false, error: message }))
    }
  }, [])

  const disconnect = useCallback(() => {
    writeConnectedFlag(false)
    setState({
      address: null,
      chainId: null,
      isCorrectChain: false,
      isConnecting: false,
      error: null,
    })
  }, [])

  const switchChain = useCallback(async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      await switchToStudio()
      await refreshChain()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to switch network."
      setState((s) => ({ ...s, error: message }))
    }
  }, [refreshChain])

  // Listen for wallet/chain changes from MetaMask itself
  useEffect(() => {
    if (!hasMetaMask() || !window.ethereum?.on) return

    const handleAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined
      const next = accounts && accounts.length > 0 ? accounts[0] : null
      // If user switched accounts in MetaMask, update silently.
      // If they disconnected at the wallet level, clear our flag too.
      if (!next) {
        writeConnectedFlag(false)
      }
      setState((s) => ({ ...s, address: next }))
    }
    const handleChain = (...args: unknown[]) => {
      const chainId = args[0] as string
      setState((s) => ({
        ...s,
        chainId,
        isCorrectChain: chainId.toLowerCase() === STUDIO_CHAIN_ID_HEX.toLowerCase(),
      }))
    }

    window.ethereum.on("accountsChanged", handleAccounts)
    window.ethereum.on("chainChanged", handleChain)

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccounts)
        window.ethereum.removeListener("chainChanged", handleChain)
      }
    }
  }, [])

  // Restore connection on mount ONLY if user explicitly connected before.
  // Never auto-connect just because MetaMask happens to be permissioned.
  useEffect(() => {
    if (!hasMetaMask()) return
    if (!readConnectedFlag()) return

    const checkExisting = async () => {
      try {
        const accounts = (await window.ethereum!.request({
          method: "eth_accounts",
        })) as string[]
        if (accounts && accounts.length > 0) {
          const chainId = await getCurrentChainId()
          setState({
            address: accounts[0],
            chainId,
            isCorrectChain: chainId.toLowerCase() === STUDIO_CHAIN_ID_HEX.toLowerCase(),
            isConnecting: false,
            error: null,
          })
        } else {
          // Flag said connected but wallet has no accounts — clear the flag
          writeConnectedFlag(false)
        }
      } catch {
        writeConnectedFlag(false)
      }
    }
    checkExisting()
  }, [])

  return {
    ...state,
    connect,
    disconnect,
    switchChain,
    hasMetaMask: hasMetaMask(),
  }
}