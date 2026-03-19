// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {GreetingsRegistry} from "./GreetingsRegistry.sol";

contract GreetingsRegistryTest is Test {
    uint256 internal testNumber;
    GreetingsRegistry internal registry;

    address alice = address(0x1);
    address bob = address(0x2);
    address charlie = address(0x3);

    function setUp() public {
        registry = new GreetingsRegistry("");
    }

    function test_setMessageWorks() public {
        string memory message = registry.messages(address(this));
        assertEq(message, "");
        registry.setMessage("hello");
        string memory messageAfter = registry.messages(address(this));
        assertEq(messageAfter, "hello");
    }

    // ==================== getLastMessages Tests ====================

    function test_getLastMessages_emptyRegistry() public view {
        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);
        assertEq(messages.length, 0);
    }

    function test_getLastMessages_singleMessage() public {
        vm.prank(alice);
        registry.setMessage("hello from alice");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);
        assertEq(messages.length, 1);
        assertEq(messages[0].account, alice);
        assertEq(messages[0].message, "hello from alice");
    }

    function test_getLastMessages_multipleAccountsSingleMessage() public {
        vm.prank(alice);
        registry.setMessage("hello from alice");

        vm.prank(bob);
        registry.setMessage("hello from bob");

        vm.prank(charlie);
        registry.setMessage("hello from charlie");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);
        assertEq(messages.length, 3);
        // Messages should be in reverse order (most recent first)
        assertEq(messages[0].account, charlie);
        assertEq(messages[0].message, "hello from charlie");
        assertEq(messages[1].account, bob);
        assertEq(messages[1].message, "hello from bob");
        assertEq(messages[2].account, alice);
        assertEq(messages[2].message, "hello from alice");
    }

    function test_getLastMessages_limitLessThanTotal() public {
        vm.prank(alice);
        registry.setMessage("hello from alice");

        vm.prank(bob);
        registry.setMessage("hello from bob");

        vm.prank(charlie);
        registry.setMessage("hello from charlie");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(2);
        // The limit should cap the number of returned messages
        assertEq(messages.length, 2);
        // Should return the 2 most recent messages
        assertEq(messages[0].account, charlie);
        assertEq(messages[0].message, "hello from charlie");
        assertEq(messages[1].account, bob);
        assertEq(messages[1].message, "hello from bob");
    }

    // ==================== Account Sets Multiple Messages Tests ====================

    function test_accountSetsMultipleMessages_latestIsReturned() public {
        vm.prank(alice);
        registry.setMessage("first message");

        vm.prank(alice);
        registry.setMessage("second message");

        vm.prank(alice);
        registry.setMessage("third message");

        // Check that messages() returns the latest
        string memory latestMessage = registry.messages(alice);
        assertEq(latestMessage, "third message");
    }

    function test_accountSetsMultipleMessages_linkedListHasOnlyLatest() public {
        vm.prank(alice);
        registry.setMessage("first message");

        vm.prank(alice);
        registry.setMessage("second message");

        vm.prank(alice);
        registry.setMessage("third message");

        // The linked list should only have one entry for alice
        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);

        // Count messages from alice
        uint256 aliceCount = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].account == alice) {
                aliceCount++;
            }
        }
        assertEq(aliceCount, 1);
        // The message should be the latest
        bool foundLatest = false;
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].account == alice) {
                assertEq(messages[i].message, "third message");
                foundLatest = true;
            }
        }
        assertTrue(foundLatest);
    }

    function test_multipleAccountsSetMultipleMessages() public {
        // Alice sets 3 messages
        vm.prank(alice);
        registry.setMessage("alice msg 1");
        vm.prank(alice);
        registry.setMessage("alice msg 2");
        vm.prank(alice);
        registry.setMessage("alice msg 3");

        // Bob sets 2 messages
        vm.prank(bob);
        registry.setMessage("bob msg 1");
        vm.prank(bob);
        registry.setMessage("bob msg 2");

        // Charlie sets 1 message
        vm.prank(charlie);
        registry.setMessage("charlie msg 1");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);

        // Should have 3 unique messages (one per account)
        assertEq(messages.length, 3);

        // Verify each account appears only once with their latest message
        uint256 aliceCount = 0;
        uint256 bobCount = 0;
        uint256 charlieCount = 0;

        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].account == alice) {
                aliceCount++;
                assertEq(messages[i].message, "alice msg 3");
            } else if (messages[i].account == bob) {
                bobCount++;
                assertEq(messages[i].message, "bob msg 2");
            } else if (messages[i].account == charlie) {
                charlieCount++;
                assertEq(messages[i].message, "charlie msg 1");
            }
        }

        assertEq(aliceCount, 1);
        assertEq(bobCount, 1);
        assertEq(charlieCount, 1);
    }

    function test_interleavedMessages_linkedListOrder() public {
        // Interleave messages from different accounts
        vm.prank(alice);
        registry.setMessage("alice first");

        vm.prank(bob);
        registry.setMessage("bob first");

        vm.prank(alice);
        registry.setMessage("alice second");

        vm.prank(charlie);
        registry.setMessage("charlie first");

        vm.prank(bob);
        registry.setMessage("bob second");

        vm.prank(alice);
        registry.setMessage("alice third");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);

        // Should have exactly 3 messages (one per account)
        assertEq(messages.length, 3);

        // Most recent is alice's third (added last)
        assertEq(messages[0].account, alice);
        assertEq(messages[0].message, "alice third");

        // Then bob's second
        assertEq(messages[1].account, bob);
        assertEq(messages[1].message, "bob second");

        // Then charlie's first
        assertEq(messages[2].account, charlie);
        assertEq(messages[2].message, "charlie first");
    }

    function test_accountUpdatesAfterOthers() public {
        // Set up initial state
        vm.prank(alice);
        registry.setMessage("alice initial");

        vm.prank(bob);
        registry.setMessage("bob initial");

        vm.prank(charlie);
        registry.setMessage("charlie initial");

        // Now alice updates
        vm.prank(alice);
        registry.setMessage("alice updated");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);

        // Alice should now be at the front of the list
        assertEq(messages[0].account, alice);
        assertEq(messages[0].message, "alice updated");
        assertEq(messages.length, 3);
    }

    function test_timestampIsRecorded() public {
        uint256 timestamp1 = 1000;
        vm.warp(timestamp1);
        vm.prank(alice);
        registry.setMessage("message at 1000");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(10);
        assertEq(messages[0].timestamp, timestamp1);

        uint256 timestamp2 = 2000;
        vm.warp(timestamp2);
        vm.prank(alice);
        registry.setMessage("message at 2000");

        messages = registry.getLastMessages(10);
        assertEq(messages[0].timestamp, timestamp2);
    }

    function test_manyUpdatesFromSingleAccount() public {
        // Test many sequential updates from same account
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(alice);
            registry.setMessage(string(abi.encodePacked("message ", vm.toString(i))));
        }

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(20);

        // Should only have 1 message in the list
        assertEq(messages.length, 1);
        assertEq(messages[0].account, alice);
        assertEq(messages[0].message, "message 9");
    }

    function test_prefixIsApplied() public {
        GreetingsRegistry prefixedRegistry = new GreetingsRegistry("PREFIX: ");

        vm.prank(alice);
        prefixedRegistry.setMessage("hello");

        string memory message = prefixedRegistry.messages(alice);
        assertEq(message, "PREFIX: hello");

        GreetingsRegistry.Message[] memory messages = prefixedRegistry.getLastMessages(10);
        assertEq(messages[0].message, "PREFIX: hello");
    }
}
