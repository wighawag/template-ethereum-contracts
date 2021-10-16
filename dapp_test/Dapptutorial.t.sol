// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.9;

import "./test.sol";
import "../src/GreetingsRegistry/GreetingsRegistry.sol";

contract GreetingsRegistryTest is DSTest {
    GreetingsRegistry internal registry;

    function setUp() public {
        registry = new GreetingsRegistry("prefix_");
    }

    function test_message(string calldata message) public {
        registry.setMessage(message);
        string memory savedMessage = registry.messages(address(this));
        assertEq0(abi.encodePacked("prefix_", message), bytes(savedMessage));
    }
}
