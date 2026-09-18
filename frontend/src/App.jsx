import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ABI = [
  "function getAchievements(address developer) view returns ((string achievementType, bytes32 proofHash, uint256 timestamp, address issuer)[])"
];

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [balance, setBalance] = useState("-");
  const [txCount, setTxCount] = useState("-");
  const [achievements, setAchievements] = useState([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [github, setGithub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
        loadWalletData(accounts[0]);
      } else {
        setAccount("");
      }
    };

    const handleChain = (id) => setChainId(parseInt(id, 16).toString());

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    };
  }, []);

  async function connectWallet() {
    try {
      setMessage("");
      if (!window.ethereum) {
        setMessage("Please install MetaMask first.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(network.chainId.toString());
      await loadWalletData(accounts[0]);
    } catch (error) {
      setMessage(error.shortMessage || error.message || "Wallet connection failed.");
    }
  }

  async function loadWalletData(address = account) {
    if (!window.ethereum || !address) return;

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);

      const [rawBalance, count] = await Promise.all([
        provider.getBalance(address),
        provider.getTransactionCount(address)
      ]);

      setBalance(Number(ethers.formatEther(rawBalance)).toFixed(4));
      setTxCount(count);

      if (CONTRACT_ADDRESS) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const data = await contract.getAchievements(address);
        setAchievements(
          data.map((item) => ({
            achievementType: item.achievementType,
            proofHash: item.proofHash,
            timestamp: Number(item.timestamp),
            issuer: item.issuer
          }))
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Wallet connected, but some blockchain data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeGithub(event) {
    event.preventDefault();
    if (!githubUsername.trim()) return;

    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(
        `${API_URL}/api/github/${encodeURIComponent(githubUsername.trim())}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "GitHub request failed.");
      }

      setGithub(data);
    } catch (error) {
      setMessage(error.message);
      setGithub(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="logo">C</span>
          <span>ChainProof</span>
        </div>

        <button className="connect-btn" onClick={connectWallet}>
          {account ? shortAddress(account) : "Connect Wallet"}
        </button>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">ON-CHAIN DEVELOPER REPUTATION</span>
            <h1>Prove your Web3 skills with evidence.</h1>
            <p>
              ChainProof combines wallet activity, verifiable achievements,
              and public GitHub evidence into one developer profile.
            </p>
            <button className="primary" onClick={connectWallet}>
              {account ? "Refresh Wallet" : "Connect Wallet"}
            </button>
          </div>

          <div className="hero-card">
            <div className="mini-label">Developer profile</div>
            <div className="wallet-large">
              {account ? shortAddress(account) : "0x..."}
            </div>
            <div className="status">
              <span className={account ? "dot live" : "dot"}></span>
              {account ? "Wallet connected" : "Connect a wallet"}
            </div>
          </div>
        </section>

        {message && <div className="notice">{message}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Wallet balance</span>
            <strong>{balance} ETH</strong>
          </div>
          <div className="stat-card">
            <span>Transactions</span>
            <strong>{txCount}</strong>
          </div>
          <div className="stat-card">
            <span>Achievements</span>
            <strong>{achievements.length}</strong>
          </div>
          <div className="stat-card">
            <span>Network</span>
            <strong>{chainId || "-"}</strong>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ON-CHAIN PROOF</span>
              <h2>Verified achievements</h2>
            </div>
          </div>

          {achievements.length === 0 ? (
            <div className="empty">
              {CONTRACT_ADDRESS
                ? "No achievements found for this wallet."
                : "Deploy ProofRegistry and add its address to VITE_CONTRACT_ADDRESS to load achievements."}
            </div>
          ) : (
            <div className="achievement-grid">
              {achievements.map((achievement, index) => (
                <div className="achievement" key={`${achievement.proofHash}-${index}`}>
                  <div className="badge">✓</div>
                  <div>
                    <h3>{achievement.achievementType}</h3>
                    <p>Proof: {shortAddress(achievement.proofHash)}</p>
                    <small>
                      {new Date(achievement.timestamp * 1000).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section github-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PUBLIC EVIDENCE</span>
              <h2>GitHub analysis</h2>
            </div>
          </div>

          <form className="github-form" onSubmit={analyzeGithub}>
            <input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter GitHub username"
            />
            <button className="primary" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>

          {github && (
            <div className="github-card">
              <div>
                <h3>{github.name || github.login}</h3>
                <p>@{github.login}</p>
                <p>{github.bio || "No public bio."}</p>
              </div>

              <div className="github-stats">
                <div>
                  <strong>{github.public_repos}</strong>
                  <span>Repositories</span>
                </div>
                <div>
                  <strong>{github.followers}</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>{github.solidityRepositories}</strong>
                  <span>Solidity repos</span>
                </div>
                <div>
                  <strong>{github.web3Repositories}</strong>
                  <span>Web3 repos</span>
                </div>
              </div>

              <a href={github.html_url} target="_blank" rel="noreferrer">
                View GitHub profile →
              </a>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ROADMAP</span>
              <h2>What comes next</h2>
            </div>
          </div>

          <div className="roadmap">
            <div><b>01</b><span>Wallet verification</span></div>
            <div><b>02</b><span>On-chain achievements</span></div>
            <div><b>03</b><span>GitHub evidence</span></div>
            <div><b>04</b><span>Security challenges</span></div>
            <div><b>05</b><span>Recruiter verification</span></div>
          </div>
        </section>
      </main>

      <footer>
        ChainProof · Web3 developer reputation MVP
      </footer>
    </div>
  );
}

export default App;
