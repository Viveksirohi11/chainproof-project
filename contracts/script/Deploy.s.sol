// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {ProofRegistry} from "../src/ProofRegistry.sol";

contract DeployProofRegistry is Script {
    function run() external returns (ProofRegistry registry) {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");

        vm.startBroadcast();
        registry = new ProofRegistry(deployer);
        vm.stopBroadcast();
    }
}
