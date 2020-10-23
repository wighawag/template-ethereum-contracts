// SPDX-License-Identifier: MIT

pragma solidity 0.7.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/* TODO is MetaTransactionReceiver */

///@notice Gateway that forwward payment information to the recipient.
contract ERC20TransferGateway {
    using SafeERC20 for IERC20;
    using Address for address;

    function transferERC20AndCall(
        IERC20 token,
        uint256 amount,
        address to,
        bytes calldata callData
    ) external payable returns (bytes memory) {
        address sender = msg.sender; // TODO use _msgSender() from MetaTransactionReceiver
        token.safeTransferFrom(sender, to, amount);
        return _call(sender, token, amount, to, callData);
    }

    ///@notice to be called atomically after sending the tokens to the gateway
    function forward(
        IERC20 token,
        uint256 amount,
        address to,
        bytes calldata callData
    ) external payable returns (bytes memory) {
        address sender = msg.sender; // TODO use _msgSender() from MetaTransactionReceiver
        token.safeTransfer(to, amount);
        return _call(sender, token, amount, to, callData);
    }

    // -------------------------------
    // INTERNAL
    // -------------------------------

    function _call(
        address sender,
        IERC20 token,
        uint256 amount,
        address to,
        bytes calldata callData
    ) internal returns (bytes memory) {
        bytes memory data = abi.encodePacked(callData, abi.encode(token, amount, sender));
        return to.functionCallWithValue(data, msg.value);
    }
}
