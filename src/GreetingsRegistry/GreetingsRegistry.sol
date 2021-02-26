// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "hardhat-deploy/solc_0.7/proxy/Proxied.sol";
import "hardhat/console.sol";

contract GreetingsRegistry is Proxied {
    event MessageChanged(address indexed user, string message);

    mapping(address => string) internal _messages;
    uint256 internal _id;

    function postUpgrade(uint256 id) public proxied {
        _id = id;
    }

    constructor(uint256 id) {
        postUpgrade(id); // the proxied modifier from `hardhat-deploy` ensure postUpgrade effect can only be used once when the contract is deployed without proxy
    }

    function setMessage(string calldata message) external {
        string memory actualMessage = string(abi.encodePacked("", message));
        _messages[msg.sender] = actualMessage;
        emit MessageChanged(msg.sender, actualMessage);
    }

    function fails(string calldata message) external {
        console.log("it fails: '%s'", message);
        emit MessageChanged(msg.sender, message);
        revert("fails");
    }
}
