// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ProofRegistry is Ownable {
    struct Achievement {
        string achievementType;
        bytes32 proofHash;
        uint256 timestamp;
        address issuer;
    }

    mapping(address => Achievement[]) private achievements;

    event AchievementAdded(
        address indexed developer,
        string achievementType,
        bytes32 indexed proofHash,
        uint256 timestamp,
        address indexed issuer
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function addAchievement(
        address developer,
        string calldata achievementType,
        bytes32 proofHash
    ) external onlyOwner {
        require(developer != address(0), "Invalid developer");
        require(bytes(achievementType).length > 0, "Empty achievement");

        achievements[developer].push(
            Achievement({
                achievementType: achievementType,
                proofHash: proofHash,
                timestamp: block.timestamp,
                issuer: msg.sender
            })
        );

        emit AchievementAdded(
            developer,
            achievementType,
            proofHash,
            block.timestamp,
            msg.sender
        );
    }

    function getAchievements(
        address developer
    ) external view returns (Achievement[] memory) {
        return achievements[developer];
    }

    function achievementCount(
        address developer
    ) external view returns (uint256) {
        return achievements[developer].length;
    }
}
