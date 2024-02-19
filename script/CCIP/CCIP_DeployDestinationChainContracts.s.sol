// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {CCIP_Counter} from "@benchmarking-bridge-aggregators/CCIP/Counter.sol";
import {HelperScript} from "../Helper/Helper.s.sol";

contract DeployCounterScript is Script {
    CCIP_Counter counter;

    address ROUTER_ADDRESS;

    uint256 deployerPrivateKey;
    bool isTest;
    HelperScript helper;

    function setUp() public {
        deployerPrivateKey = vm.envUint("KEY_PRIVATE");
        isTest = vm.envBool("TEST");
        helper = new HelperScript("CCIP", isTest);

        ROUTER_ADDRESS = vm.envAddress("CCIP_ROUTER_ADDRESS");
    }

    function run() public {
        vm.startBroadcast(deployerPrivateKey);
        counter = new CCIP_Counter(ROUTER_ADDRESS);
        vm.stopBroadcast();

        helper.write_deployed_address("Counter", address(counter));
    }
}
