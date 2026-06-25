// Generic crypto terms linked out to neutral, well-known reference pages from
// the per-coin "About" copy — mirrors Coinbase's inline glossary links.
export const GLOSSARY_LINKS: Record<string, string> = {
  'Satoshi Nakamoto': 'https://en.wikipedia.org/wiki/Satoshi_Nakamoto',
  'Charles Hoskinson': 'https://en.wikipedia.org/wiki/Charles_Hoskinson',
  blockchain: 'https://en.wikipedia.org/wiki/Blockchain',
  cryptocurrencies: 'https://en.wikipedia.org/wiki/Cryptocurrency',
  cryptocurrency: 'https://en.wikipedia.org/wiki/Cryptocurrency',
  'smart contracts': 'https://en.wikipedia.org/wiki/Smart_contract',
  'decentralized finance (DeFi)': 'https://en.wikipedia.org/wiki/Decentralized_finance',
  'decentralized applications': 'https://en.wikipedia.org/wiki/Decentralized_application',
  'proof-of-stake': 'https://en.wikipedia.org/wiki/Proof_of_stake',
  'proof-of-work': 'https://en.wikipedia.org/wiki/Proof_of_work',
  'consensus protocol': 'https://en.wikipedia.org/wiki/Consensus_(computer_science)',
  NFTs: 'https://en.wikipedia.org/wiki/Non-fungible_token',
  NFT: 'https://en.wikipedia.org/wiki/Non-fungible_token',
  Litecoin: 'https://en.wikipedia.org/wiki/Litecoin',
  mining: 'https://en.wikipedia.org/wiki/Cryptocurrency_mining'
}

const PATTERN = new RegExp(
  `(${Object.keys(GLOSSARY_LINKS)
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})`,
  'g'
)

export type AboutSegment = { text: string; href?: string }

export function splitAboutWithGlossary(text: string): AboutSegment[] {
  const parts = text.split(PATTERN)
  return parts.filter(Boolean).map((part) => ({ text: part, href: GLOSSARY_LINKS[part] }))
}
