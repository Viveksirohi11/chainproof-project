# ChainProof

ChainProof is a Web3 developer reputation MVP. It connects a wallet, reads basic on-chain information, displays verifiable achievements from a Solidity contract, and analyzes public GitHub profile data.

## Stack

- Frontend: React + Vite + ethers.js
- Backend: Node.js + Express
- Smart contract: Solidity
- Contract testing/deployment: Foundry
- GitHub: public REST API

## Project structure

```text
chainproof/
├── frontend/
├── backend/
└── contracts/
```

## 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=
VITE_CHAIN_ID=11155111
```

Leave `VITE_CONTRACT_ADDRESS` empty until you deploy the contract.

## 2. Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:5000`.

## 3. Smart contract

Install Foundry, then:

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge build
forge test
```

The contract can be deployed to a testnet such as Sepolia after configuring your RPC URL and deployer wallet securely.

## Important security notes

- Never commit `.env` files or private keys.
- `node_modules` should not be committed.
- This MVP is for learning and portfolio development, not production security auditing.
- Do not put real funds into experimental contracts.

## Git workflow

```bash
git add .
git commit -m "Build ChainProof MVP"
git push
```
