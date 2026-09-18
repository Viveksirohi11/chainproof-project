import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "ChainProof API",
    status: "running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/github/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ChainProof"
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const userResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      { headers }
    );

    if (!userResponse.ok) {
      const status = userResponse.status;
      if (status === 404) {
        return res.status(404).json({ error: "GitHub user not found." });
      }
      return res.status(status).json({ error: "GitHub API request failed." });
    }

    const user = await userResponse.json();

    const reposResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      { headers }
    );

    const repos = reposResponse.ok ? await reposResponse.json() : [];

    const solidityRepositories = repos.filter((repo) => {
      const language = (repo.language || "").toLowerCase();
      const name = (repo.name || "").toLowerCase();
      const description = (repo.description || "").toLowerCase();

      return (
        language === "solidity" ||
        name.includes("solidity") ||
        description.includes("solidity")
      );
    });

    const web3Keywords = [
      "web3",
      "blockchain",
      "ethereum",
      "smart contract",
      "defi",
      "nft",
      "dao",
      "dapp",
      "wagmi",
      "viem",
      "ethers",
      "hardhat",
      "foundry"
    ];

    const web3Repositories = repos.filter((repo) => {
      const text = [
        repo.name,
        repo.description,
        repo.language
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return web3Keywords.some((keyword) => text.includes(keyword));
    });

    res.json({
      login: user.login,
      name: user.name,
      bio: user.bio,
      html_url: user.html_url,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      avatar_url: user.avatar_url,
      solidityRepositories: solidityRepositories.length,
      web3Repositories: web3Repositories.length,
      repositories: repos.map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        description: repo.description
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while analyzing GitHub." });
  }
});

app.listen(PORT, () => {
  console.log(`ChainProof API running at http://localhost:${PORT}`);
});
