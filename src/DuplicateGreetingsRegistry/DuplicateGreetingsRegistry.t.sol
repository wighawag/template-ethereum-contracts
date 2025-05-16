// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "src/DuplicateGreetingsRegistry/DuplicateGreetingsRegistry.sol";

contract DuplicateGreetingsRegistryTest is Test {
    uint256 testNumber;
    DuplicateGreetingsRegistry registry;

    function setUp() public {
        registry = new DuplicateGreetingsRegistry("");
    }

    function test_setMessageWorks() public {
        string memory message = registry.messages(address(this));
        assertEq(message, "");
        registry.setMessage("hello");
        string memory messageAfter = registry.messages(address(this));
        assertEq(messageAfter, "hello");
    }

    // function testFail_Hello() public view {
    //     string memory message = registry.messages(msg.sender);
    //     assertEq(message, "hello");
    // }
}
