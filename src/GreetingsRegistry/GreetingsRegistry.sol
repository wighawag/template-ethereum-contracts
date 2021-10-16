// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "hardhat/console.sol";

contract GreetingsRegistry is Proxied {
    event MessageChanged(address indexed user, string message);

    mapping(address => string) public messages;
    string internal _prefix;

    function postUpgrade(string memory prefix) public proxied {
        _prefix = prefix;
    }

    constructor(string memory prefix) {
        // the proxied modifier from `hardhat-deploy` ensure postUpgrade effect can only be used once when the contract is deployed without proxy
        // by calling that function in the constructor we ensure the contract behave the same whether it is deployed through a proxy or not.
        postUpgrade(prefix);
    }

    function setMessage(string calldata message) external {
        string memory actualMessage = string(abi.encodePacked(_prefix, message));
        messages[msg.sender] = actualMessage;
        emit MessageChanged(msg.sender, actualMessage);
    }
}
