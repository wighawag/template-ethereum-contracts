// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IGreetingsRegistry} from "./IGreetingsRegistry.sol";
import {Proxied} from "@rocketh/proxy/solc_0_8/ERC1967/Proxied.sol";

/// @title Greetings Registry
/// @notice let user set a greeting
///
/// A greeting belongs to the account that sent it: every write reads
/// `msg.sender` and files the greeting under it, so the sender and the greeter
/// are always the same address.
///
/// The registry keeps one greeting per account, and threads them into a list so
/// the most recent ones can be read back in order without an indexer.
contract GreetingsRegistry is IGreetingsRegistry, Proxied {
    /// @notice emitted whenever a user updates their greeting
    /// @param user the account whose greeting was updated
    /// @param message the new greeting
    event MessageChanged(address indexed user, string message);

    /// @notice happen when trying to set an invalid greeting
    /// @param message the greeting
    error InvalidMessage(string message);

    string internal _prefix;

    struct MessagePointer {
        uint256 previous;
        address account;
        string message;
        uint256 timestamp;
    }
    mapping(address => uint256) internal _accountToMessage;
    mapping(uint256 => MessagePointer) internal _messages;
    uint256 internal _lastMessage;

    // ------------------------------------------------------------------------
    // CONSTRUCTOR / INITIALIZER
    //  support both proxy and constructor initialization
    //  zero overhead for constructor
    // ------------------------------------------------------------------------
    constructor(string memory prefix) {
        _init(prefix);
    }

    function _init(string memory prefix) internal {
        _prefix = prefix;
    }

    function init(string memory prefix) external asProxyInitialiser {
        _init(prefix);
    }

    // ------------------------------------------------------------------------

    /// @notice the greeting for each account
    function messages(address account) external view returns (string memory) {
        return _messages[_accountToMessage[account]].message;
    }

    function getLastMessages(
        uint256 limit
    ) external view returns (Message[] memory messagesToReturn) {
        uint256 currentMessageId = _lastMessage;
        if (currentMessageId != 0 && limit > 0) {
            Message[] memory tmpMessages = new Message[](limit);
            uint256 numMessages = 0;
            while (currentMessageId != 0) {
                MessagePointer memory message = _messages[currentMessageId];
                if (message.account == address(0)) {
                    currentMessageId = 0;
                    break;
                }
                tmpMessages[numMessages] = Message({
                    account: message.account,
                    message: message.message,
                    timestamp: message.timestamp
                });
                numMessages++;
                if (numMessages == limit) {
                    break;
                }
                currentMessageId = message.previous;
            }
            messagesToReturn = new Message[](numMessages);
            for (uint256 i = 0; i < numMessages; i++) {
                messagesToReturn[i] = tmpMessages[i];
            }
        }
    }

    /// @notice called to set your own greeting
    /// @param message the new greeting
    function setMessage(string calldata message) external {
        _setMessage(msg.sender, message);
    }

    function _setMessage(address user, string calldata message) internal {
        if (bytes(message).length == 0) {
            revert InvalidMessage(message);
        }
        string memory actualMessage = string(
            abi.encodePacked(_prefix, message)
        );

        uint256 messageId = _lastMessage + 1;

        uint256 previousMessageFromAccount = _accountToMessage[user];
        if (previousMessageFromAccount != 0) {
            // if the account already had a message
            // get its prior
            uint256 prior = _messages[previousMessageFromAccount].previous;
            if (prior != 0) {
                // Move prior message's data into the vacated slot and update its mapping
                address priorAccount = _messages[prior].account;
                _messages[previousMessageFromAccount] = _messages[prior];
                _accountToMessage[priorAccount] = previousMessageFromAccount;
                delete _messages[prior];
            } else {
                delete _messages[previousMessageFromAccount];
            }
        }

        _messages[messageId] = MessagePointer({
            previous: _lastMessage,
            account: user,
            message: actualMessage,
            timestamp: block.timestamp
        });
        _accountToMessage[user] = messageId;
        _lastMessage = messageId;
        emit MessageChanged(user, actualMessage);
    }
}
