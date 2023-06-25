// SPDX-License-Identifier: AGPL-1.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./ERC20Internal.sol";
import "../Libraries/Constants.sol";

interface ITransferReceiver {
	function onTokenTransfer(address, uint256, bytes calldata) external returns (bool);
}

interface IPaidForReceiver {
	function onTokenPaidFor(
		address payer,
		address forAddress,
		uint256 amount,
		bytes calldata data
	) external returns (bool);
}

interface IApprovalReceiver {
	function onTokenApproval(address, uint256, bytes calldata) external returns (bool);
}

abstract contract ERC20Base is IERC20, ERC20Internal {
	using Address for address;

	uint256 internal _totalSupply;
	mapping(address => uint256) internal _balances;
	mapping(address => mapping(address => uint256)) internal _allowances;

	function burn(uint256 amount) external virtual {
		address sender = msg.sender;
		_burnFrom(sender, amount);
	}

	function _internal_totalSupply() internal view override returns (uint256) {
		return _totalSupply;
	}

	function totalSupply() public view override returns (uint256) {
		return _internal_totalSupply();
	}

	function balanceOf(address owner) external view override returns (uint256) {
		return _balances[owner];
	}

	function allowance(address owner, address spender) external view override returns (uint256) {
		if (owner == address(this)) {
			// see transferFrom: address(this) allows anyone
			return Constants.UINT256_MAX;
		}
		return _allowances[owner][spender];
	}

	function decimals() external pure virtual returns (uint8) {
		return uint8(18);
	}

	function transfer(address to, uint256 amount) external override returns (bool) {
		_transfer(msg.sender, to, amount);
		return true;
	}

	function transferAlongWithETH(address payable to, uint256 amount) external payable returns (bool) {
		_transfer(msg.sender, to, amount);
		to.transfer(msg.value);
		return true;
	}

	function distributeAlongWithETH(address payable[] memory tos, uint256 totalAmount) external payable returns (bool) {
		uint256 val = msg.value / tos.length;
		require(msg.value == val * tos.length, "INVALID_MSG_VALUE");
		uint256 amount = totalAmount / tos.length;
		require(totalAmount == amount * tos.length, "INVALID_TOTAL_AMOUNT");
		for (uint256 i = 0; i < tos.length; i++) {
			_transfer(msg.sender, tos[i], amount);
			tos[i].transfer(val);
		}
		return true;
	}

	function transferAndCall(address to, uint256 amount, bytes calldata data) external returns (bool) {
		_transfer(msg.sender, to, amount);
		return ITransferReceiver(to).onTokenTransfer(msg.sender, amount, data);
	}

	function transferFromAndCall(
		address from,
		address to,
		uint256 amount,
		bytes calldata data
	) external returns (bool) {
		_transferFrom(from, to, amount);
		return ITransferReceiver(to).onTokenTransfer(from, amount, data);
	}

	function payForAndCall(
		address forAddress,
		address to,
		uint256 amount,
		bytes calldata data
	) external returns (bool) {
		_transfer(msg.sender, to, amount);
		return IPaidForReceiver(to).onTokenPaidFor(msg.sender, forAddress, amount, data);
	}

	function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
		_transferFrom(from, to, amount);
		return true;
	}

	function approve(address spender, uint256 amount) external override returns (bool) {
		_approveFor(msg.sender, spender, amount);
		return true;
	}

	function approveAndCall(address spender, uint256 amount, bytes calldata data) external returns (bool) {
		_approveFor(msg.sender, spender, amount);
		return IApprovalReceiver(spender).onTokenApproval(msg.sender, amount, data);
	}

	function _approveFor(address owner, address spender, uint256 amount) internal override {
		require(owner != address(0) && spender != address(0), "INVALID_ZERO_ADDRESS");
		_allowances[owner][spender] = amount;
		emit Approval(owner, spender, amount);
	}

	function _transferFrom(address from, address to, uint256 amount) internal {
		// anybody can transfer from this
		// this allow mintAndApprovedCall without gas overhead
		if (msg.sender != from && from != address(this)) {
			uint256 currentAllowance = _allowances[from][msg.sender];
			if (currentAllowance != Constants.UINT256_MAX) {
				// save gas when allowance is maximal by not reducing it (see https://github.com/ethereum/EIPs/issues/717)
				require(currentAllowance >= amount, "NOT_AUTHOIZED_ALLOWANCE");
				_allowances[from][msg.sender] = currentAllowance - amount;
			}
		}
		_transfer(from, to, amount);
	}

	function _transfer(address from, address to, uint256 amount) internal {
		require(to != address(0), "INVALID_ZERO_ADDRESS");
		require(to != address(this), "INVALID_THIS_ADDRESS");
		uint256 currentBalance = _balances[from];
		require(currentBalance >= amount, "NOT_ENOUGH_TOKENS");
		_balances[from] = currentBalance - amount;
		_balances[to] += amount;
		emit Transfer(from, to, amount);
	}

	function _transferAllIfAny(address from, address to) internal {
		uint256 balanceLeft = _balances[from];
		if (balanceLeft > 0) {
			_balances[from] = 0;
			_balances[to] += balanceLeft;
			emit Transfer(from, to, balanceLeft);
		}
	}

	function _mint(address to, uint256 amount) internal override {
		_totalSupply += amount;
		_balances[to] += amount;
		emit Transfer(address(0), to, amount);
	}

	function _burnFrom(address from, uint256 amount) internal override {
		uint256 currentBalance = _balances[from];
		require(currentBalance >= amount, "NOT_ENOUGH_TOKENS");
		_balances[from] = currentBalance - amount;
		_totalSupply -= amount;
		emit Transfer(from, address(0), amount);
	}
}
