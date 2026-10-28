// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {GreetingsRegistry} from "src/GreetingsRegistry/GreetingsRegistry.sol";

contract GreetingsRegistryTest is Test {
    uint256 internal testNumber;
    GreetingsRegistry internal registry;

    address internal alice = address(0x1);
    address internal bob = address(0x2);
    address internal charlie = address(0x3);

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
        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );
        assertEq(messages.length, 0);
    }

    function test_getLastMessages_singleMessage() public {
        vm.prank(alice);
        registry.setMessage("hello from alice");

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );
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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );
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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            2
        );
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
        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );

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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );

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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );

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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );

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

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );
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
            registry.setMessage(
                string(abi.encodePacked("message ", vm.toString(i)))
            );
        }

        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            20
        );

        // Should only have 1 message in the list
        assertEq(messages.length, 1);
        assertEq(messages[0].account, alice);
        assertEq(messages[0].message, "message 9");
    }

    /// @notice Test for the bug where shifting a message during update
    /// would leave orphaned entries causing duplicate accounts in getLastMessages.
    /// Scenario:
    /// 1. A sets message 1 (slot 1)
    /// 2. B sets message 2 (slot 2, prev: 1)
    /// 3. C sets message 3 (slot 3, prev: 2)
    /// 4. B sets message 4 - this shifts A's message from slot 1 to slot 2
    ///    BUG: _accountToMessage[A] was not updated, still points to deleted slot 1
    /// 5. A sets message 5 - since _accountToMessage[A] = 1 (deleted), A's message
    ///    at slot 2 is NOT removed, causing A to appear twice
    function test_shiftedMessageAccountMappingUpdated() public {
        // Step 1: A sets message
        vm.prank(alice);
        registry.setMessage("alice first");

        // Step 2: B sets message
        vm.prank(bob);
        registry.setMessage("bob first");

        // Step 3: C sets message
        vm.prank(charlie);
        registry.setMessage("charlie first");

        // Step 4: B updates - this should shift alice's message
        vm.prank(bob);
        registry.setMessage("bob second");

        // Step 5: A updates - this MUST remove A's shifted message
        vm.prank(alice);
        registry.setMessage("alice second");

        // Verify: each account should appear exactly once
        GreetingsRegistry.Message[] memory messages = registry.getLastMessages(
            10
        );

        uint256 aliceCount = 0;
        uint256 bobCount = 0;
        uint256 charlieCount = 0;

        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].account == alice) {
                aliceCount++;
                // Should be the latest message
                assertEq(messages[i].message, "alice second");
            } else if (messages[i].account == bob) {
                bobCount++;
                assertEq(messages[i].message, "bob second");
            } else if (messages[i].account == charlie) {
                charlieCount++;
                assertEq(messages[i].message, "charlie first");
            }
        }

        // CRITICAL: Each account must appear exactly once
        // Before the fix, alice would appear twice
        assertEq(aliceCount, 1, "Alice should appear exactly once");
        assertEq(bobCount, 1, "Bob should appear exactly once");
        assertEq(charlieCount, 1, "Charlie should appear exactly once");
        assertEq(messages.length, 3, "Should have exactly 3 messages");
    }

    function test_prefixIsApplied() public {
        GreetingsRegistry prefixedRegistry = new GreetingsRegistry("PREFIX: ");

        vm.prank(alice);
        prefixedRegistry.setMessage("hello");

        string memory message = prefixedRegistry.messages(alice);
        assertEq(message, "PREFIX: hello");

        GreetingsRegistry.Message[] memory messages = prefixedRegistry
            .getLastMessages(10);
        assertEq(messages[0].message, "PREFIX: hello");
    }

    // ==================== Storage layout ====================

    /// @notice This contract's state must stay in the slots it already occupies.
    ///
    /// It is live behind an ERC-1967 proxy, so the storage belongs to the proxy
    /// and outlives any implementation deployed against it. A slot shift would
    /// not lose the greetings, it would reinterpret them: whatever sat at a slot
    /// before is read back as whatever the new layout says lives there.
    ///
    /// Nothing in the source shows that happening. Declaring a state variable
    /// above the existing ones, reordering them, or inheriting a base contract
    /// that declares state of its own all move the whole layout down while every
    /// line that reads it still compiles and still looks right. Hence this.
    function test_storageLayoutIsWhatTheProxyExpects() public {
        GreetingsRegistry prefixed = new GreetingsRegistry("PREFIX: ");

        // A short string lives inline in its slot: the bytes left-aligned, and
        // twice the length in the lowest byte. `_prefix` is declared first, so
        // this is slot 0 or the layout has moved.
        bytes32 slot0 = vm.load(address(prefixed), bytes32(0));
        assertEq(bytes8(slot0), bytes8(bytes("PREFIX: ")));
        assertEq(uint8(uint256(slot0)), 16);

        vm.prank(alice);
        prefixed.setMessage("hello");

        // `_accountToMessage` is declared next, so alice's entry is at the slot
        // a mapping at index 1 puts it, and holds the id of her only message.
        assertEq(
            uint256(
                vm.load(
                    address(prefixed),
                    keccak256(abi.encode(alice, uint256(1)))
                )
            ),
            1
        );

        // `_messages` takes index 2, and `_lastMessage` is the plain word after
        // it, now holding that same id.
        assertEq(uint256(vm.load(address(prefixed), bytes32(uint256(3)))), 1);

        // Writing a greeting left the prefix where it was.
        assertEq(vm.load(address(prefixed), bytes32(0)), slot0);
    }
}
