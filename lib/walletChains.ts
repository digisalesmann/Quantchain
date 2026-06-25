// Plain chain-list data, safe to import from client components — no heavy crypto libs here.
export type Chain = 'ethereum' | 'bitcoin' | 'solana' | 'litecoin' | 'dogecoin' | 'bnb' | 'polygon' | 'avalanche'

export const WALLET_CHAINS: { value: Chain; label: string }[] = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)' },
  { value: 'ethereum', label: 'Ethereum (ETH)' },
  { value: 'solana', label: 'Solana (SOL)' },
  { value: 'litecoin', label: 'Litecoin (LTC)' },
  { value: 'dogecoin', label: 'Dogecoin (DOGE)' },
  { value: 'bnb', label: 'BNB Smart Chain (BNB)' },
  { value: 'polygon', label: 'Polygon (POL)' },
  { value: 'avalanche', label: 'Avalanche C-Chain (AVAX)' }
]
