// Multi-chain wallet service for Ethereum, Bitcoin, and Solana

import { ethers } from 'ethers'
import * as bitcoin from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { WALLET_CHAINS, type Chain } from './walletChains'

export { WALLET_CHAINS, type Chain }

const ECPair = ECPairFactory(ecc)

const EVM_CHAINS = new Set<Chain>(['ethereum', 'bnb', 'polygon', 'avalanche'])

// Real, publicly documented bitcoinjs-lib network params (not the implicit bitcoin-mainnet default)
const LITECOIN_NETWORK: bitcoin.Network = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: { public: 0x019da462, private: 0x019d9cfe },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0
}

const DOGECOIN_NETWORK: bitcoin.Network = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'doge',
  bip32: { public: 0x02facafd, private: 0x02fac398 },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e
}

// RPC endpoints (use environment variables in production) — only chains with a live getBalance/getTransaction implementation
const RPC_ENDPOINTS: Record<'ethereum' | 'bitcoin' | 'solana', string> = {
  ethereum: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  bitcoin: process.env.BTC_RPC_URL || 'https://blockstream.info/api',
  solana: process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com'
}

export async function generateWalletAddress(chain: Chain): Promise<{ address: string; publicKey?: string }> {
  if (EVM_CHAINS.has(chain)) {
    // BNB Smart Chain, Polygon, and Avalanche C-Chain are EVM-compatible and share Ethereum's
    // secp256k1 address format, so the same key generation produces a genuinely valid address.
    const wallet = ethers.Wallet.createRandom()
    return { address: wallet.address, publicKey: wallet.publicKey }
  }

  if (chain === 'bitcoin') {
    const keyPair = ECPair.makeRandom()
    const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey) })
    return { address: address || '', publicKey: Buffer.from(keyPair.publicKey).toString('hex') }
  }

  if (chain === 'litecoin') {
    const keyPair = ECPair.makeRandom({ network: LITECOIN_NETWORK })
    const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey), network: LITECOIN_NETWORK })
    return { address: address || '', publicKey: Buffer.from(keyPair.publicKey).toString('hex') }
  }

  if (chain === 'dogecoin') {
    const keyPair = ECPair.makeRandom({ network: DOGECOIN_NETWORK })
    const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(keyPair.publicKey), network: DOGECOIN_NETWORK })
    return { address: address || '', publicKey: Buffer.from(keyPair.publicKey).toString('hex') }
  }

  if (chain === 'solana') {
    const keypair = Keypair.generate()
    return { address: keypair.publicKey.toBase58(), publicKey: keypair.publicKey.toBase58() }
  }

  throw new Error(`Unsupported chain: ${chain}`)
}

export async function getBalance(chain: Chain, address: string): Promise<string> {
  // Live RPC balance lookups are only wired up for the original 3 chains today (no current
  // caller exercises the other 5 — see app/api/wallets/balance/route.ts, which is unused by the UI).
  if (chain === 'ethereum') {
    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.ethereum)
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  if (chain === 'bitcoin') {
    // Use Blockstream API for balance lookup
    try {
      const res = await fetch(`${RPC_ENDPOINTS.bitcoin}/address/${address}`)
      const data = await res.json() as any
      return (data.chain_stats?.funded_txo_sum || 0).toString()
    } catch {
      return '0'
    }
  }

  if (chain === 'solana') {
    const connection = new Connection(RPC_ENDPOINTS.solana)
    const pubKey = new PublicKey(address)
    const balance = await connection.getBalance(pubKey)
    return (balance / 1e9).toString() // Convert lamports to SOL
  }

  throw new Error(`Unsupported chain: ${chain}`)
}

export async function validateAddress(chain: Chain, address: string): Promise<boolean> {
  try {
    if (EVM_CHAINS.has(chain)) {
      return ethers.isAddress(address)
    }

    if (chain === 'bitcoin') {
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
    }

    if (chain === 'litecoin') {
      return /^[LM3][a-km-zA-HJ-NP-Z1-9]{25,34}$|^ltc1[a-z0-9]{39,59}$/.test(address)
    }

    if (chain === 'dogecoin') {
      return /^D[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)
    }

    if (chain === 'solana') {
      try {
        new PublicKey(address)
        return true
      } catch {
        return false
      }
    }

    return false
  } catch {
    return false
  }
}

export async function getTransaction(chain: Chain, txHash: string): Promise<any> {
  if (chain === 'ethereum') {
    const provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS.ethereum)
    return provider.getTransaction(txHash)
  }

  if (chain === 'bitcoin') {
    try {
      const res = await fetch(`${RPC_ENDPOINTS.bitcoin}/tx/${txHash}`)
      return res.json()
    } catch {
      return null
    }
  }

  if (chain === 'solana') {
    const connection = new Connection(RPC_ENDPOINTS.solana)
    return connection.getTransaction(txHash)
  }

  return null
}
