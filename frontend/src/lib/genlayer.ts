import { createClient } from "genlayer-js"
import { studionet } from "genlayer-js/chains"

import {
  CONTRACT_ADDRESS,
  STUDIO_EXPLORER_URL,
} from "./constants"

// READ-ONLY client — used for view methods (get_analysis, etc.)
// Created once, never needs wallet binding.
export const readClient = createClient({
  chain: studionet,
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

export async function switchToStudio(): Promise<void> {
  if (!hasMetaMask()) throw new Error("MetaMask not detected.")
  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xF22F" }],
    })
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code
    if (code === 4902) {
      await window.ethereum!.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xF22F",
            chainName: "GenLayer Studio",
            nativeCurrency: {
              name: "GEN",
              symbol: "GEN",
              decimals: 18,
            },
            rpcUrls: ["https://studio.genlayer.com/api"],
            blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
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
  return createClient({
    chain: studionet,
    account: accountAddress as `0x${string}`,
  })
}

export async function analyzeDocument(
  documentText: string,
  accountAddress: string
): Promise<unknown> {
  const BASE_GAS = BigInt(8000000)
  const PER_CHAR_GAS = BigInt(200)
  const docLengthBigInt = BigInt(documentText.length)
  const gasLimit = BASE_GAS + (docLengthBigInt * PER_CHAR_GAS)

  console.log("[ClauseLens] analyzeDocument called", {
    addressType: typeof accountAddress,
    addressLength: accountAddress?.length,
    addressPrefix: accountAddress?.slice(0, 6),
    hasEthereum: !!window.ethereum,
    documentLength: documentText.length,
    gasLimit: gasLimit.toString(),
  })

  const walletClient = createWalletClient(accountAddress)

  return await (walletClient.writeContract as any)({
    address: CONTRACT_ADDRESS,
    functionName: "analyze_document",
    args: [documentText],
    value: BigInt(0),
    gas: gasLimit,
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
  return `${STUDIO_EXPLORER_URL}/tx/${txHash}`
}

export function explorerAddressUrl(address: string): string {
  return `${STUDIO_EXPLORER_URL}/address/${address}`
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export const client = readClient
