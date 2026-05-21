import { createClient } from "genlayer-js"
import { testnetBradbury } from "genlayer-js/chains"
import {
  CONTRACT_ADDRESS,
  BRADBURY_CHAIN_ID_HEX,
  BRADBURY_CHAIN_NAME,
  BRADBURY_RPC_URL,
  BRADBURY_EXPLORER_URL,
  BRADBURY_CURRENCY_SYMBOL,
} from "./constants"

// READ-ONLY client — used for view methods (get_analysis, etc.)
// Created once, never needs wallet binding.
export const readClient = createClient({
  chain: testnetBradbury,
})

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export function hasMetaMask(): boolean {
  return typeof window !== "undefined" && !!window.ethereum
}

export async function connectWallet(): Promise<string> {
  if (!hasMetaMask()) {
    throw new Error("MetaMask not detected. Install MetaMask to continue.")
  }
  const accounts = (await window.ethereum!.request({
    method: "eth_requestAccounts",
  })) as string[]
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from MetaMask.")
  }
  return accounts[0]
}

export async function getCurrentChainId(): Promise<string> {
  if (!hasMetaMask()) throw new Error("MetaMask not detected.")
  const chainId = (await window.ethereum!.request({
    method: "eth_chainId",
  })) as string
  return chainId
}

export async function switchToBradbury(): Promise<void> {
  if (!hasMetaMask()) throw new Error("MetaMask not detected.")
  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BRADBURY_CHAIN_ID_HEX }],
    })
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BRADBURY_CHAIN_ID_HEX,
            chainName: BRADBURY_CHAIN_NAME,
            nativeCurrency: {
              name: BRADBURY_CURRENCY_SYMBOL,
              symbol: BRADBURY_CURRENCY_SYMBOL,
              decimals: 18,
            },
            rpcUrls: [BRADBURY_RPC_URL],
            blockExplorerUrls: [BRADBURY_EXPLORER_URL],
          },
        ],
      })
    } else {
      throw err
    }
  }
}

// ============================================
// WRITE CALLS — create a fresh client with wallet transport bound
// ============================================

function createWalletClient(accountAddress: string) {
  if (!hasMetaMask()) {
    throw new Error("MetaMask is not available.")
  }
  if (!accountAddress || !accountAddress.startsWith("0x") || accountAddress.length !== 42) {
    throw new Error("Wallet not connected. Please connect your wallet & try again.")
  }
  // genlayer-js v1.x lets us pass account at client construction so
  // signing requests are routed through window.ethereum.
  return createClient({
    chain: testnetBradbury,
    account: accountAddress as `0x${string}`,
  })
}

export async function analyzeDocument(
  documentText: string,
  accountAddress: string
): Promise<unknown> {
  console.log("[ClauseLens] analyzeDocument called", {
    addressType: typeof accountAddress,
    addressLength: accountAddress?.length,
    addressPrefix: accountAddress?.slice(0, 6),
    hasEthereum: !!window.ethereum,
  })

  const walletClient = createWalletClient(accountAddress)

  return await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: "analyze_document",
    args: [documentText],
    value: BigInt(0),
  })
}

export interface ContractAnalysisResult {
  analysis_id: string
  document_preview: string
  document_type: string
  manipulation_score: number
  clarity_score: number
  jargon_score: number
  hidden_risk_level: string
  human_explanation: string
  danger_flags: string
  validator_disagreement: number
}

export interface AnalysisResult extends ContractAnalysisResult {
  submitter?: string
  client_timestamp?: number
}

export async function getAnalysis(
  analysisId: string
): Promise<AnalysisResult | null> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_analysis",
      args: [analysisId],
    })) as unknown as ContractAnalysisResult
    return result as AnalysisResult
  } catch (err) {
    console.error("getAnalysis failed:", err)
    return null
  }
}

export async function getAllAnalyses(): Promise<AnalysisResult[]> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_all_analyses",
      args: [],
    })) as unknown as ContractAnalysisResult[]
    return Array.isArray(result) ? (result as AnalysisResult[]) : []
  } catch (err) {
    console.error("getAllAnalyses failed:", err)
    return []
  }
}

export async function getAnalysisCount(): Promise<number> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_analysis_count",
      args: [],
    })) as number | bigint
    return Number(result)
  } catch (err) {
    console.error("getAnalysisCount failed:", err)
    return 0
  }
}

export function parseDangerFlags(dangerFlagsJson: string): string[] {
  try {
    const parsed = JSON.parse(dangerFlagsJson || "[]")
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : []
  } catch {
    return []
  }
}

export function explorerTxUrl(txHash: string): string {
  return `${BRADBURY_EXPLORER_URL}/tx/${txHash}`
}

export function explorerAddressUrl(address: string): string {
  return `${BRADBURY_EXPLORER_URL}/address/${address}`
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// Kept for backward-compat with any imports of `client`
export const client = readClient