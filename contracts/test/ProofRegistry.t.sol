// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProofRegistry} from "../src/ProofRegistry.sol";

contract ProofRegistryTest is Test {
    ProofRegistry registry;

    address owner = address(1);
    address developer = address(2);
    address attacker = address(3);

    function setUp() public {
        vm.prank(owner);
        registry = new ProofRegistry(owner);
    }

    function testAddAchievement() public {
        bytes32 proof = keccak256("erc20-challenge");

        vm.prank(owner);
        registry.addAchievement(
            developer,
            "ERC20 Developer",
            proof
        );

        ProofRegistry.Achievement[] memory result =
            registry.getAchievements(developer);

        assertEq(result.length, 1);
        assertEq(result[0].achievementType, "ERC20 Developer");
        assertEq(result[0].proofHash, proof);
        assertEq(result[0].issuer, owner);
    }

    function testOnlyOwnerCanAddAchievement() public {
        vm.prank(attacker);
        vm.expectRevert();
        registry.addAchievement(
            developer,
            "Fake Achievement",
            keccak256("fake")
        );
    }

    function testMultipleAchievements() public {
        vm.startPrank(owner);

        registry.addAchievement(
            developer,
            "ERC20 Developer",
            keccak256("erc20")
        );

        registry.addAchievement(
            developer,
            "NFT Developer",
            keccak256("nft")
        );

        vm.stopPrank();

        assertEq(registry.achievementCount(developer), 2);
    }

    function testCannotUseZeroDeveloper() public {
        vm.prank(owner);
        vm.expectRevert("Invalid developer");
        registry.addAchievement(
            address(0),
            "ERC20 Developer",
            keccak256("erc20")
        );
    }
}
