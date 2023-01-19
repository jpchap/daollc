// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Code for DAO LLC equity
/// @author Jack Chapman
contract DAOLLC is ERC20 {
    address[] public members; /// @dev keep track of who owns tokens

    /// @dev add to member set
    function _add(address member) internal {
        members.push(member);
    }

    /// @dev remove from member set
    function _remove(address member) internal {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                members[i] = members[members.length - 1];
                members.pop();
                return;
            }
        }
    }

    /// @dev ERC20 calls before transfer from sender to receiver
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(to != address(this), "DAO LLC: cannot send tokens to the company");
        if (amount == 0) return;
        if (balanceOf(to) == 0) _add(to);
    }

    /// @dev ERC20 calls after transfer from sender to receiver
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from == address(0) || amount == 0) return;
        if (balanceOf(from) == 0) _remove(from);
    }
    
    /// @dev please reuse with different name and symbol
    constructor() ERC20("Golden Nonce DAO LLC", "GNDT") {
        _mint(msg.sender, 10000 * (10 ** decimals()));
    }

    /// @dev distribute ERC20 token according to equity
    function distribute(address token) public {
        uint256 token_balance = ERC20(token).balanceOf(address(this));
        require(token_balance > members.length, "DAO LLC: insufficient funds for distribution");

        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            uint256 member_equity = balanceOf(member);
            uint256 amount = (token_balance * member_equity) / totalSupply();
            ERC20(token).transfer(member, amount);
        }
    }
}