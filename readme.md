# ZyncSwap — Smart Contract Assessment


## Assessment Solution

This repository contains my implementation of the ZyncSwap Blockchain Developer Assessment.

### Completed Tasks

#### Task 1 — Order Submission Bug Fix

Fixed the trading flow so that both market and limit orders are submitted from the frontend to:

`POST /api/v1/orders`

The request now flows through the frontend, Next.js API route, and the existing matching engine.

Tested with both:

- Market orders
- Limit orders

#### Task 2 — OHLCV Candles API

Added the following endpoint:

`GET /api/v1/markets/:id/candles?timeframe=5m&limit=100`

Supported timeframes:

- `1m`
- `5m`
- `15m`
- `1h`

The endpoint:

- Returns OHLCV candle data for the requested market.
- Supports a maximum limit of 500 candles.
- Returns `400 Bad Request` with clear error messages for invalid timeframe or limit values.
- Returns `404 Not Found` for an unknown market.

#### Task 3 — Portfolio Panel

Added a Portfolio panel to the `/markets` page.

The panel displays open paper-trade positions stored through the existing `PaperTradeContext` and browser `localStorage`.

For each position, it shows:

- Trading pair
- Position side (`long` or `short`)
- Entry price
- Current mark price
- Unrealised PnL

The current mark price is taken from the existing WebSocket market feed. As new market ticks arrive, the mark price and unrealised PnL update automatically without requiring a page refresh.

PnL is calculated as:

For long positions:

`(markPrice - entryPrice) × sizeBase`

For short positions:

`(entryPrice - markPrice) × sizeBase`

#### Task 4 — Smart Contract Burn Functionality

Extended `ZyncToken.sol` with:

- `burn(uint256 amount)` — allows token holders to burn their own tokens.
- `burnFrom(address account, uint256 amount)` — allows approved spenders to burn tokens using the ERC-20 allowance mechanism.
- `Burned(address indexed from, uint256 amount)` event.

Added contract tests covering:

- Successful burn.
- Burn exceeding the holder's balance.
- `burnFrom` with sufficient allowance.
- `burnFrom` without allowance.

All 5 smart contract tests, including the existing minting test, are passing.

---

## How to Run the Solution

### Requirements

Make sure the following are installed:

- Node.js 18 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/technicalkuldeep/smartcontract-assignment.git
cd smartcontract-assignment
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

### 4. Start the local Hardhat blockchain

Open a terminal and run:

```bash
npm run chain
```

Keep this terminal running.

### 5. Deploy the ZYNC token

Open another terminal and run:

```bash
npm run deploy
```

Copy the deployed `ZyncToken` contract address printed in the terminal and set it in `.env`:

```env
ZYNC_TOKEN_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 6. Start the application

Open another terminal and run:

```bash
npm run dev
```

The application will be available at:

`http://localhost:3000`

### 7. Run smart contract tests

```bash
npm run test:contracts
```

Expected result:

`5 passing`

### 8. Create a production build

```bash
npm run client:build
```

---

## Tradeoffs and Decisions

### Reused the Existing Architecture

I reused the project's existing `PaperTradeContext`, `MarketsStreamContext`, matching engine, and market engine instead of introducing duplicate state-management or WebSocket logic.

This keeps the implementation consistent with the existing architecture and reduces unnecessary complexity.

### Portfolio PnL Calculation

Unrealised PnL is calculated client-side using the position's entry price, size, side, and the latest mark price received from the existing WebSocket market feed.

This allows the Portfolio panel to update in real time without creating an additional WebSocket connection.

### Candle Timeframes

The existing market engine primarily provides 5-minute candle data. The implementation uses this existing candle data as the source for additional supported timeframes.

The `15m` and `1h` candles are aggregated from the available lower-timeframe candles.

The `1m` candles are derived from the existing 5-minute candle data. This was chosen to satisfy the requested API interface while staying within the existing architecture and assessment time constraints.

For a production system, I would prefer to store or consume genuine 1-minute OHLCV data rather than derive synthetic 1-minute candles.

---

## What I Would Improve With More Time

Given more time, I would focus on the following improvements:

1. **Native 1-minute market data**

   Use genuine 1-minute OHLCV data as the base candle timeframe, then aggregate it into `5m`, `15m`, and `1h` candles. This would provide more accurate market data than deriving 1-minute candles from existing 5-minute data.

2. **More comprehensive API tests**

   Add automated tests for the candles endpoint covering:

   * All supported timeframes.
   * Invalid timeframe values.
   * Invalid limits.
   * Unknown markets.
   * Boundary values such as `limit=1` and `limit=500`.

3. **More precise smart contract revert tests**

   Assert the exact OpenZeppelin custom errors for insufficient balances and allowances instead of only checking that the transaction reverted.

4. **Portfolio improvements**

   Add features such as:

   * Total unrealised PnL.
   * Position size.
   * Margin information.
   * Close-position actions.
   * Filtering and sorting.

5. **Additional end-to-end testing**

   Add automated tests covering the complete order flow from frontend submission through the API route and matching engine.

---

## Verification

The implementation was manually tested for:

* Market order submission.
* Limit order submission.
* All four candle timeframes.
* Invalid candle timeframe handling.
* Invalid candle limit handling.
* Portfolio position rendering.
* Real-time mark price updates.
* Real-time unrealised PnL updates.
* Smart contract burn functionality.
* Smart contract allowance-based `burnFrom` functionality.

Smart contract test result:

`5 passing`

---

Welcome to the ZyncSwap Blockchain Developer Assessment!

ZyncSwap is a decentralised exchange platform built around the **ZYNC** utility token. It includes a Next.js frontend, server-side API routes, a WebSocket market feed, an on-chain ERC-20 token, and an off-chain order matching engine.

Your job is to extend and improve the existing codebase across the full stack — smart contracts, backend API, and frontend UI.

Focus on quality over completeness. Submit what you have when time is up.

---

## Time Consideration

This assessment is scoped for **4–6 hours**. If you hit your limit, submit what you have and use your README to describe what you would finish next.

---

## Getting Started

You need **Node.js 18+** and **npm**.

```bash
# 1. Fork this repo and clone your fork
git clone https://github.com/YOUR_USERNAME/smart-contract-assessment.git
cd smart-contract-assessment
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Start a local Hardhat blockchain (keep this terminal open)
npm run chain

# 4. Deploy the ZyncToken contract (new terminal)
npm run deploy
# Copy the printed address into .env as ZYNC_TOKEN_ADDRESS

# 5. Start the app
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
zync-erc20/
├── client/
│   ├── app/                  # Next.js App Router
│   │   ├── (dex)/            # Page routes: /, /swap, /markets, /trade/[id], …
│   │   └── api/              # API routes (no separate Express server)
│   │       ├── v1/config/
│   │       ├── v1/markets/
│   │       ├── v1/orders/
│   │       ├── v1/swap/quote/
│   │       └── v1/wallets/[address]/zync-balance/
│   ├── lib/                  # Server-side engine logic
│   │   ├── marketEngine.js   # Simulated markets + Binance WebSocket feed
│   │   ├── matchingEngine.js # In-memory order book + matching
│   │   ├── swapQuote.js      # Uniswap V2-style swap quote + calldata
│   │   ├── zyncBalance.js    # On-chain ZYNC balance via eth_call
│   │   └── config.js         # Environment variable helpers
│   ├── server.js             # Custom Next.js server (adds /ws/markets WebSocket)
│   └── src/                  # React components, pages, contexts, wallet logic
├── contracts/
│   ├── contracts/
│   │   └── ZyncToken.sol     # ERC-20 ZYNC token
│   ├── scripts/deploy.cjs
│   ├── test/
│   └── hardhat.config.cjs
├── .env.example
└── package.json
```

---

## Tasks

### Task 1 — Bug Fix

Open the app and navigate to `/trade/btc-usdt`. The order book shows simulated data but the **Place Order** button does not submit correctly to `POST /api/v1/orders`.

- Identify why the request fails
- Fix the issue end-to-end (frontend → API route → matching engine)
- The fix should work for both `limit` and `market` order types

---

### Task 2 — New API Endpoint

Add a new endpoint:

```
GET /api/v1/markets/:id/candles?timeframe=5m&limit=100
```

- Return OHLCV candle data for the requested market
- Support `timeframe` values: `1m`, `5m`, `15m`, `1h`
- Support `limit` up to `500`
- Return a `400` with a clear error message for invalid params
- Follow the existing pattern in `client/app/api/v1/markets/`

---

### Task 3 — Frontend Feature

On the `/markets` page, add a **Portfolio** panel that shows:

- A list of the user's open paper-trade positions (already stored in `localStorage` via `PaperTradeContext`)
- For each position: pair, side (long/short), entry price, current mark price, and unrealised PnL
- PnL should update in real time as market prices change via the WebSocket feed
- Use the existing Tailwind styling to match the rest of the UI

---

### Task 4 — Smart Contract Extension

Extend `ZyncToken.sol` or add a new contract:

- Add a `burn(uint256 amount)` function that lets any token holder burn their own tokens
- Add a `burnFrom(address account, uint256 amount)` function using the allowance mechanism
- Emit a `Burned` event with `(address indexed from, uint256 amount)`
- Write tests in `contracts/test/` covering: successful burn, burn exceeding balance, burnFrom with and without allowance

---

## API Reference

All routes are served by the Next.js app at `http://localhost:3000`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/config` | App and chain config |
| `GET` | `/api/v1/markets` | All markets overview |
| `GET` | `/api/v1/markets/:id` | Market detail — book, trades, candles |
| `WS` | `/ws/markets` | Live market ticks (snapshot + tick) |
| `POST` | `/api/v1/orders` | Place an order |
| `GET` | `/api/v1/orders` | List orders |
| `DELETE` | `/api/v1/orders/:id` | Cancel an order |
| `GET` | `/api/v1/wallets/:address/zync-balance` | ZYNC token balance |
| `GET` | `/api/v1/swap/quote` | Swap quote and calldata |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run chain` | Start local Hardhat node (keep running) |
| `npm run deploy` | Deploy ZyncToken to localhost |
| `npm run compile` | Compile Solidity contracts |
| `npm run test:contracts` | Run contract tests |
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run client:build` | Production build |
| `npm run start` | Start production server |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHAIN_ID` | `31337` | Hardhat local chain ID |
| `RPC_URL` | `http://127.0.0.1:8545` | JSON-RPC endpoint |
| `ZYNC_TOKEN_ADDRESS` | Hardhat default | Deployed token address |
| `PORT` | `3000` | App server port |
| `SWAP_ROUTER_ADDRESS` | — | Uniswap V2 Router address (optional) |
| `WETH_ADDRESS` | — | WETH address for swap routing (optional) |

---

## Evaluation Criteria

| Area | Weight |
|------|--------|
| Task 1 — Bug Fix | 20% |
| Task 2 — API Endpoint | 25% |
| Task 3 — Frontend Feature | 30% |
| Task 4 — Smart Contract | 25% |

You are also evaluated on:

- Code quality and consistency with the existing codebase
- TypeScript / JavaScript correctness
- Error handling and edge cases
- UI polish and accessibility
- Clear commit history and README

---

## Submission

- Do **not** open a PR to this repo — share your **fork URL**
- In your fork, update this `README.md` to explain:
  - How to run your solution
  - What you would improve or finish given more time
  - Any tradeoffs or decisions worth noting
- Make sure `npm install` → `npm run chain` (separate terminal) → `npm run deploy` → `npm run dev` works end-to-end


