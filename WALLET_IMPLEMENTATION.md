Wallet & Multi-Chain Services

Implementation Overview
- Multi-chain support: Ethereum, Bitcoin, Solana
- Hot wallet address generation per chain
- Live balance fetching from public RPC nodes
- Deposit & withdrawal tracking
- Internal p2p transfers between users
- Fund reservation system (balance split into available/reserved)

Backend Services

Wallet Service (lib/wallet.ts)
- generateWalletAddress(chain) — create random keypairs and addresses
- getBalance(chain, address) — query live blockchain balance
- validateAddress(chain, address) — validate address format per chain
- getTransaction(chain, txHash) — fetch transaction details

API Routes
- POST /api/wallets/create — create new wallet for user
- GET /api/wallets/list?userId=... — list all wallets for user
- GET /api/wallets/balance?walletId=... — fetch live balance
- POST /api/wallets/withdraw — initiate withdrawal (reserves funds)
- POST /api/wallets/transfer — internal transfer between users on same chain

Frontend Pages
- /wallets — list user wallets with balances
- /wallets/create — create new wallet (select chain, optional label)
- /wallets/withdraw — withdraw to external address (requires validation)
- /wallets/transfer — internal p2p transfer between users

Data Flow: Deposit
1. User gets deposit address from wallet detail page
2. User sends funds from external wallet to exchange address
3. Backend monitor/watchtower detects incoming tx
4. Backend confirms after N blocks, credits user balance

Data Flow: Withdrawal
1. User submits withdrawal form (recipient address, amount, chain)
2. Backend validates address format
3. Backend reserves funds (moves from available → reserved)
4. Backend signs tx with HSM/KMS (placeholder for now)
5. Backend broadcasts to chain
6. Monitor detects confirmation, marks withdrawal COMPLETED

Data Flow: Internal Transfer
1. User submits transfer form (recipient user ID, amount)
2. Backend finds recipient wallet on same chain
3. Backend atomically updates both balances (ACID)
4. Backend logs transaction for audit trail

Key Features
- Fund reservation: prevents double-spending
- Multi-chain: seamless Ethereum/Bitcoin/Solana support
- Atomic transfers: database transactions ensure consistency
- Live balance: queries blockchain for current state
- Address validation: prevents invalid recipient addresses

Next Steps for Production
- Add webhook watchers for deposit confirmations
- Implement HSM signing for withdrawals
- Add rate limiting to withdrawal endpoints
- Implement withdrawal whitelist
- Add email/SMS confirmations for large withdrawals
- Store withdrawal nonces to prevent replay attacks
- Add transaction history and export
- Implement batch processing for pending withdrawals
