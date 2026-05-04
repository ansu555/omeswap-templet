# 🌊 0G DEX

A fully functional decentralized exchange (DEX) built on the 0G network with multi-hop routing capabilities.

![0G DEX](https://img.shields.io/badge/0G-DEX-red) ![License](https://img.shields.io/badge/license-MIT-green) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

- 🔄 **Uniswap V2 AMM** - Constant product market maker
- 🛣️ **Multi-Hop Routing** - Route through multiple pools in a single transaction
- 💧 **Liquidity Provision** - Add/remove liquidity and earn 0.3% fees
- 🪙 **Test Token Minting** - Mint test tokens for experimentation
- 💰 **Low Gas Fees** - Built on 0G for efficient transactions
- 🎨 **Modern UI** - Beautiful, responsive interface with shadcn/ui
- 🔐 **Wallet Integration** - Connect with MetaMask, WalletConnect, and more

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com/

### 3. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

### 4. Connect & Trade

1. **Connect Wallet** (top right corner)
2. **Switch to 0G Mainnet** (or testnet if `NEXT_PUBLIC_0G_NETWORK=testnet`)
3. **Get 0G** for gas fees
4. **Mint test tokens** (Mint Tokens tab)
5. **Add liquidity** or **start swapping**!

## 📋 Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- 0G (for gas fees)

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Web3:** wagmi v2 + viem v2
- **Wallet:** RainbowKit

### Smart Contracts
- **Language:** Solidity 0.8.20
- **Framework:** Hardhat
- **Network:** 0G Mainnet (default; Galileo testnet supported)
- **Testing:** Chai + Ethers.js

## 📝 Smart Contracts

### On 0G

Canonical token addresses, DEX routers, and OmeSwap contract addresses are maintained in the chain registry:

- [`lib/chain-registry/chains/zerog.ts`](./lib/chain-registry/chains/zerog.ts)
- [`contracts/config.ts`](./contracts/config.ts) (re-exports for the app)

[View on 0G Chain Scan →](https://chainscan.0g.ai)

## 🎯 Use Cases

### For Traders
- Swap tokens with minimal slippage
- Multi-hop routing finds best paths
- Low gas costs on 0G

### For Liquidity Providers
- Earn 0.3% on all swaps
- Receive LP tokens
- Remove liquidity anytime

### For Developers
- Learn AMM mechanics
- Study DeFi integration
- Fork and customize

## 📚 Documentation

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete technical overview and implementation details

## 🧪 Testing

### Frontend Testing
```bash
npm run dev
```

### Smart Contract Testing
```bash
npm run hardhat:test
```

### Backend Scripts
```bash
# Mint test tokens
npm run hardhat:mint

# Add liquidity
npm run hardhat:liquidity

# Execute swap
npm run hardhat:swap

# Multi-hop swap
npm run hardhat:multihop

# Complete setup
npm run hardhat:quickstart
```

## 🔒 Security

⚠️ **Mainnet**: Deployments target 0G networks. Treat on-chain funds and contracts according to your own risk and audit posture.

For production use:
- Professional security audit required
- Implement additional safety checks
- Add protocol fee mechanism
- Enable emergency pause functionality

## 🛠️ Development

### Project Structure

```
omeswap/
├── app/                  # Next.js pages
├── components/           # React components
│   ├── trade/           # DEX trading components
│   ├── portfolio/       # Portfolio management
│   └── features/        # Wallet integration
├── contracts/           # Contract ABIs & config
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
└── scripts/             # Hardhat interaction scripts
```

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter
npm run hardhat:*       # Hardhat operations
npm run axl:agent       # Host ATS agents as an MCP service for an AXL peer
npm run axl:demo        # End-to-end AXL ATS swarm demo (BTC by default)
```

## AXL — Peer-to-Peer ATS Swarm

OmeSwap's ATS pipeline can run its Regime, Signal, Graph, and Risk agents on
separate Gensyn AXL peer nodes instead of in-process. The orchestrator picks a
transport per run (`local` | `axl` | `auto`) and the rest of the product is
unchanged. See [`doc/axl.md`](./doc/axl.md) for the two-node demo walkthrough,
required env vars, and judge-facing verification commands.

```bash
# After setting AXL_PEER_ID and starting the agent service on Node B:
ATS_AGENT_TRANSPORT=axl bun run axl:demo BTC solo
```

## 🌐 Network Configuration

### 0G Mainnet

- **Chain ID:** 16661
- **RPC URL:** https://evmrpc.0g.ai
- **Explorer:** https://chainscan.0g.ai
- **Native token:** 0G

Use `NEXT_PUBLIC_0G_NETWORK=testnet` for Galileo testnet (chain ID 16602); see [`lib/chain-registry/chains/zerog.ts`](./lib/chain-registry/chains/zerog.ts) for RPC and explorer URLs.

Add to MetaMask:
1. Networks → Add Network → Add Manually
2. Enter the details above
3. Save

## 🎨 Features Walkthrough

### 1. Token Swapping
- Select input/output tokens
- Enter amount
- Review estimated output
- Approve & swap
- Track transaction on explorer

### 2. Liquidity Management
- Choose token pair
- Enter amounts (auto-calculated ratio)
- Approve both tokens
- Add liquidity
- Receive LP tokens

### 3. Multi-Hop Routing
- Swap tokens without direct pools
- Example: DAI → USDC → WETH → WBTC
- Atomic transaction (all-or-nothing)
- Automatic path finding

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- Uniswap V2 for the AMM design
- 0G for the underlying network
- shadcn/ui for beautiful components
- wagmi & viem for Web3 integration

## 📞 Support

- **Issues:** GitHub Issues
- **Docs** [Integration Guide](./DEX_INTEGRATION_GUIDE.md)
- **Explorer:** https://chainscan.0g.ai

## 🎉 Getting Started

Ready to try it out?

```bash
npm install
npm run dev
```

---

**Built with ❤️ on 0G**

⭐ Star this repo if you found it helpful!
