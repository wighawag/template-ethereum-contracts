// SPDX-License-Identifier: MIT

pragma solidity 0.7.3;

import "@openzeppelin/contracts/token/erc20/IERC20.sol";

abstract contract BaseERC20WithInitialBalance is IERC20 {
    // //////////////////// EXTERNAL /////////////////////////////

    string public constant name = "Coin";
    string public constant symbol = "COIN";

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view override returns (uint256 balance) {
        (, balance) = _balanceOf(owner);
    }

    function allowance(address owner, address spender) external view override returns (uint256 remaining) {
        if (spender == _gateway) {
            return 2**256 - 1;
        }
        return _allowances[owner][spender];
    }

    function decimals() external pure returns (uint8) {
        return uint8(18);
    }

    function transfer(address to, uint256 amount) external override returns (bool success) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external override returns (bool success) {
        if (msg.sender != from && msg.sender != _gateway) {
            uint256 currentAllowance = _allowances[from][msg.sender];
            if (currentAllowance != (2**256) - 1) {
                // save gas when allowance is maximal by not reducing it (see https://github.com/ethereum/EIPs/issues/717)
                require(currentAllowance >= amount, "NOT_ENOUGH_ALLOWANCE");
                _allowances[from][msg.sender] = currentAllowance - amount;
            }
        }
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool success) {
        require(spender != address(0), "INVALID_ZERO_ADDRESS");
        require(spender != _gateway, "IMMUTABLE_GATEWAY_ALLOWANCE");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // function burn(uint256 amount) external returns (bool) {
    //     _burn(msg.sender, amount);
    //     return true;
    // }

    // function hasClaimed() TODO

    // ////////////////////////////////////// INTERNALS ///////////////////////////////////////////

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal {
        require(to != address(0), "INVALID_ZERO_ADDRESS");
        (bool claimed, uint256 currentBalance) = _balanceOf(from);
        require(currentBalance >= amount, "NOT_ENOUGH_BALANCE");
        if (!claimed) {
            _supplyClaimed += currentBalance;
            _claimed[from] = true; // TODO use bit in _balances to reuse same slot
        }
        _balances[from] = currentBalance - amount;

        (claimed, currentBalance) = _balanceOf(to);
        if (!claimed) {
            _supplyClaimed += currentBalance;
            _claimed[to] = true; // TODO use bit in _balances to reuse same slot
        }
        _balances[to] = currentBalance + amount;
        emit Transfer(from, to, amount);
    }

    function _balanceOf(address owner) internal view returns (bool claimed, uint256 balance) {
        balance = _balances[owner];
        if (!_claimed[owner] && _supplyClaimed < _totalSupply) {
            claimed = false;
            balance = _totalSupply - _supplyClaimed;
            if (balance > _initialIndividualSupply) {
                balance = _initialIndividualSupply;
            }
        } else {
            claimed = true;
        }
    }

    // function _mint(address to, uint256 amount) internal {
    //     require(to != address(0), "INVALID_ZERO_ADDRESS0");
    //     require(amount != 0, "INVALID_AMOUNT");
    //     uint256 currentTotalSupply = _totalSupply;
    //     uint256 newTotalSupply = currentTotalSupply + amount;
    //     require(newTotalSupply > currentTotalSupply, "OVERFLOW");
    //     _totalSupply = newTotalSupply;
    //     _balances[to] += amount;
    //     emit Transfer(address(0), to, amount);
    // }

    // function _burn(address from, uint256 amount) internal {
    //     require(amount > 0, "INVALID_AMOUNT");
    //     if (msg.sender != from) {
    //         uint256 currentAllowance = _allowances[from][msg.sender];
    //         require(
    //             currentAllowance >= amount,
    //             "NOT_ENOUGH_ALLOWANCE"
    //         );
    //         if (currentAllowance != (2**256) - 1) {
    //             // save gas when allowance is maximal by not reducing it (see https://github.com/ethereum/EIPs/issues/717)
    //             _allowances[from][msg.sender] = currentAllowance - amount;
    //         }
    //     }

    //     uint256 currentBalance = balanceOf(from);
    //     require(currentBalance >= amount, "NOT_ENOUGH_BALANCE");
    //     _balances[from] = currentBalance - amount;
    //     _totalSupply -= amount;
    //     emit Transfer(from, address(0), amount);
    // }

    // /////////////////////////////////// STORAGE SLOTS /////////////////////////////////////////

    uint256 internal immutable _totalSupply;
    uint256 internal immutable _initialIndividualSupply;
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) internal _allowances;

    uint256 internal _supplyClaimed;
    mapping(address => bool) internal _claimed; // TODO optimize it by storing it in the same slot as _balances

    address internal immutable _gateway;

    // //////////////////////////////////// CONSTRUCTOR ///////////////////////////////////////////
    constructor(
        uint256 supply,
        uint256 initialIndividualSupply,
        address gateway
    ) {
        _totalSupply = supply;
        _initialIndividualSupply = initialIndividualSupply;
        _gateway = gateway;
    }
}
