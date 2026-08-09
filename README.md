# Paradox - End-to-End Smart Escrow Platform

Paradox is a production-quality, end-to-end escrow platform that connects clients and freelancers securely with smart contracts and AI dispute resolution.

## Architecture

The platform is split into three main layers:

1. **Contracts (`/contracts`)**: Hardhat-based smart contracts containing `YieldEscrow.sol` for milestone-based payments and dispute handling, and `ReputationSBT.sol` for soulbound reputation tracking.
2. **Backend (`/backend`)**: Python FastAPI server for AI dispute resolution and an ethers.py based oracle listener for on-chain events.
3. **Frontend (`/frontend`)**: Next.js (React) application for the client and freelancer dashboard, featuring a modern, premium UX, integrated with Privy for wallet authentication.

## Prerequisites

- Node.js & npm
- Python 3.8+
- [Privy](https://privy.io) API key (for frontend auth)
- OpenAI API key (for backend AI dispute resolution)

## Getting Started

Follow these steps to run the full stack locally.

### 1. Start the Blockchain Network

In a new terminal:
```bash
npm run dev:node
```

### 2. Deploy the Contracts

In another terminal, deploy the smart contracts to the local network:
```bash
npm run deploy:local
```
This will create `frontend/src/config/contracts.ts` with the deployed addresses and ABIs.

### 3. Setup and Run the Backend

Create a `.env` file in the `backend` directory based on `backend/.env.example`.

In a new terminal, install python dependencies and start the backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

In another terminal, start the oracle listener (optional, but needed for automatic event processing):
```bash
npm run dev:oracle
```

### 4. Setup and Run the Frontend

Create a `.env` file in the `frontend` directory based on `frontend/.env.example`. Make sure to add your `NEXT_PUBLIC_PRIVY_APP_ID`.

In a new terminal:
```bash
npm run dev:frontend
```

## Features

- **Demo vs Live Mode**: The frontend gracefully falls back to simulated responses if the smart contracts are not deployed locally, providing a seamless "demo mode" for showcasing UI without wallet overhead.
- **Milestone-based Escrow**: Funds are locked into a vault and can be released tranche-by-tranche.
- **Soulbound Reputation**: Tiers (Bronze, Silver, Gold, Platinum, Diamond) are updated strictly via smart contracts.
- **AI Dispute Resolution**: Conflicts are resolved by AI based on deliverables, requirements, and chat logs.
