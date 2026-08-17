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

export interface ContractVerificationResult {
  request_id: string
  claim: string
  evidence_url: string
  evidence_hash: string
  evidence_excerpt: string
  verdict: string
  model_confidence: number
  reasoning: string
  model_counter_argument: string
  model_uncertainty: number
}

export async function verifyClaim(
  claim: string,
  evidenceUrl: string,
  accountAddress: string
): Promise<unknown> {
  const walletClient = createWalletClient(accountAddress)
  return await (walletClient.writeContract as any)({
    address: CONTRACT_ADDRESS,
    functionName: "verify_claim",
    args: [claim, evidenceUrl],
    value: BigInt(0),
    gas: BigInt(12000000),
  })
}

async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data)
  const buf = await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}


// Recompute the exact content-addressed request_id the contract derives:
// sha256(claim \x00 url \x00 sha256(fetched evidence truncated to 6000 chars)).
// Lets the client bind to the exact receipt its own submission creates and
// fetch only that record, instead of scanning the public feed.
export async function computeRequestId(claim: string, evidenceUrl: string): Promise<string> {
  const c = claim.trim()
  const u = evidenceUrl.trim()
  const resp = await fetch(u)
  let text = await resp.text()
  if (text.length > 6000) text = text.slice(0, 6000)
  const evidenceHash = await sha256Hex(text)
  const material = c + "\u0000" + u + "\u0000" + evidenceHash
  return await sha256Hex(material)
}


// Read the request_id a verify_claim transaction returned, straight from its
// own receipt: consensus_data.leader_receipt[].result.payload.readable holds
// the method's return value as a JSON string. Binds the client to the exact
// receipt its submission created.
export async function getReturnedRequestId(txHash: unknown): Promise<string> {
  const anyClient = readClient as any
  const hash =
    txHash && typeof txHash === "object" && "hash" in (txHash as Record<string, unknown>)
      ? (txHash as Record<string, unknown>).hash
      : txHash
  const tx = (await anyClient.getTransaction({ hash })) as any
  const lr = tx?.consensus_data?.leader_receipt
  const entry = Array.isArray(lr) ? lr[0] : lr
  const readable = entry?.result?.payload?.readable
  if (typeof readable !== "string") return ""
  let value = ""
  try {
    const parsed = JSON.parse(readable)
    value = typeof parsed === "string" ? parsed : ""
  } catch {
    value = readable.replace(/^"+|"+$/g, "")
  }
  return /^[0-9a-f]{64}$/.test(value) ? value : ""
}


export async function getVerification(
  verificationId: string
): Promise<ContractVerificationResult | null> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_verification",
      args: [verificationId],
    })) as unknown as ContractVerificationResult
    return result
  } catch (err) {
    console.error("getVerification failed:", err)
    return null
  }
}

export async function getVerificationCount(): Promise<number> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_verification_count",
      args: [],
    })) as number | bigint
    return Number(result)
  } catch (err) {
    console.error("getVerificationCount failed:", err)
    return 0
  }
}

export async function getLastRequestId(): Promise<string> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_last_request_id",
      args: [],
    })) as unknown as string
    return typeof result === "string" ? result : ""
  } catch (err) {
    console.error("getLastRequestId failed:", err)
    return ""
  }
}

export async function getRequestIdAt(index: number): Promise<string> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_request_id_at",
      args: [index],
    })) as unknown as string
    return typeof result === "string" ? result : ""
  } catch (err) {
    console.error("getRequestIdAt failed:", err)
    return ""
  }
}

export async function getAllVerifications(): Promise<ContractVerificationResult[]> {
  try {
    const result = (await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_all_verifications",
      args: [],
    })) as unknown as ContractVerificationResult[]
    return Array.isArray(result) ? result : []
  } catch (err) {
    console.error("getAllVerifications failed:", err)
    return []
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
