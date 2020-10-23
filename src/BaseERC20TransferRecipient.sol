// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./ERC20TransferGateway.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

abstract contract BaseERC20TransferRecipient {
    ERC20TransferGateway internal immutable _erc20TransferGateway;

    constructor(ERC20TransferGateway erc20TransferGateway) {
        _erc20TransferGateway = erc20TransferGateway;
    }

    function _getTokenTransfer()
        internal
        view
        returns (
            address token,
            uint256 amount,
            address sender
        )
    {
        sender = msg.sender;
        if (sender == address(_erc20TransferGateway)) {
            return _extractTokenTransfer(msg.data);
        }
    }

    function _extractTokenTransfer(bytes memory data)
        internal
        pure
        returns (
            address token,
            uint256 amount,
            address sender
        )
    {
        uint256 length = data.length;
        assembly {
            sender := mload(sub(add(data, length), 0x0))
            amount := mload(sub(add(data, length), 0x20))
            token := mload(sub(add(data, length), 0x40))
        }
    }
}
