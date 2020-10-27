// SPDX-License-Identifier: MIT

pragma solidity 0.7.1;

import "../BaseERC20TransferRecipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

///@notice Can Receive ERC20 payment either from the transfer getaway or through the standard approval-based mechanism.
contract ERC20Consumer is BaseERC20TransferRecipient {
    using SafeERC20 for IERC20;

    uint256 internal immutable _price;
    IERC20 internal immutable _token;

    event Purchase(address buyer, address recipient, uint256 id);

    constructor(
        ERC20TransferGateway erc20TransferGateway,
        address token,
        uint256 price
    ) BaseERC20TransferRecipient(erc20TransferGateway) {
        _token = IERC20(token);
        _price = price;
    }

    function purchase(uint256 id) external {
        purchaseFor(address(0), id);
    }

    function purchaseFor(address recipient, uint256 id) public {
        (address token, uint256 amount, address sender) = _getTokenTransfer();
        if (token != address(0)) {
            require(token == address(_token), "UNEXPECTED_ERC20_TOKEN");
            require(amount == _price, "UNEXPECTED_AMOUNT"); // Alternative: reimburse the diff but fails on less
        } else {
            _token.safeTransferFrom(sender, address(this), _price);
        }

        // at this point the purchase has been paid and `sender` is the purchaser
        if (recipient == address(0)) {
            recipient = sender;
        }
        // TODO transfer NFT to recipient
        emit Purchase(sender, recipient, id);
    }
}
