// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGreetingsRegistry {
    struct Message {
        address account;
        string message;
        uint256 timestamp;
    }

    function messages(address account) external view returns (string memory);

    function setMessage(string calldata message) external;

    function getLastMessages(
        uint256 limit
    ) external view returns (Message[] memory);
}
