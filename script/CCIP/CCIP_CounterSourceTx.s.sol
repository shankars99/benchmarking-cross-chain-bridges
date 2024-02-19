// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {CCIP_Sender} from "@benchmarking-bridge-aggregators/CCIP/SourceContract.sol";
import {HelperScript} from "../Helper/Helper.s.sol";

contract CounterSourceTxPayLINKScript is Script {
    CCIP_Sender source_contract;
    LinkTokenInterface linkToken;

    uint64 DESTINATION_DOMAIN;
    address DEPLOYED_SOURCE_CONTRACT_ADDRESS;
    address DEPLOYED_DESTINATION_CONTRACT_ADDRESS;
    address LINK_ADDRESS;

    uint256 number;

    uint256 deployerPrivateKey;
    bool isTest;
    HelperScript helper;

    function setUp() public {
        deployerPrivateKey = vm.envUint("KEY_PRIVATE");
        isTest = vm.envBool("TEST");
        helper = new HelperScript("CCIP", isTest);

        DEPLOYED_SOURCE_CONTRACT_ADDRESS = helper.get_deployed_address(
            "Sender"
        );

        DEPLOYED_DESTINATION_CONTRACT_ADDRESS = helper.get_deployed_address(
            "Counter"
        );

        DESTINATION_DOMAIN = uint64(vm.envUint("CCIP_DESTINATION_DOMAIN"));

        LINK_ADDRESS = vm.envAddress("CCIP_LINK_ADDRESS");

        number = vm.envUint("CCIP_NUMBER");

        source_contract = CCIP_Sender(
            payable(DEPLOYED_SOURCE_CONTRACT_ADDRESS)
        );
        linkToken = LinkTokenInterface(LINK_ADDRESS);
    }

    function run() public {
        vm.startBroadcast(deployerPrivateKey);

        linkToken.transfer(DEPLOYED_SOURCE_CONTRACT_ADDRESS, 1e17);

        source_contract.sendMessagePayLINK(
            DESTINATION_DOMAIN,
            DEPLOYED_DESTINATION_CONTRACT_ADDRESS,
            number
        );

        vm.stopBroadcast();
    }
}

contract CounterSourceTxPayNativeScript is Script {
    CCIP_Sender source_contract;

    uint64 DESTINATION_DOMAIN;
    address DEPLOYED_SOURCE_CONTRACT_ADDRESS;
    address DEPLOYED_DESTINATION_CONTRACT_ADDRESS;

    uint256 number;

    uint256 deployerPrivateKey;
    bool isTest;
    HelperScript helper;

    function setUp() public {
        deployerPrivateKey = vm.envUint("KEY_PRIVATE");
        isTest = vm.envBool("TEST");
        helper = new HelperScript("CCIP", isTest);

        DEPLOYED_SOURCE_CONTRACT_ADDRESS = helper.get_deployed_address(
            "Sender"
        );

        DEPLOYED_DESTINATION_CONTRACT_ADDRESS = helper.get_deployed_address(
            "Counter"
        );

        DESTINATION_DOMAIN = uint64(vm.envUint("CCIP_DESTINATION_DOMAIN"));

        number = vm.envUint("CCIP_NUMBER");

        source_contract = CCIP_Sender(
            payable(DEPLOYED_SOURCE_CONTRACT_ADDRESS)
        );
    }

    function run() public {
        vm.startBroadcast(deployerPrivateKey);

        payable(DEPLOYED_SOURCE_CONTRACT_ADDRESS).transfer(1e16);

        source_contract.sendMessagePayNative(
            DESTINATION_DOMAIN,
            DEPLOYED_DESTINATION_CONTRACT_ADDRESS,
            number
        );

        vm.stopBroadcast();
    }
}
