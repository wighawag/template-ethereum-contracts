// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGreetingsRegistry {
    function messages(address account) external returns (string memory);

    function setMessage(string calldata message) external;
}
