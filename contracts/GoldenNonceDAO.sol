// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Subsidiary.sol";

/* 
 * This contract represents equity in the DAO LLC
 */
contract GoldenNonceDAO is ERC20 {
    address[] public members; // allows us to iterate over members

    /// @dev add to member set
    function add(address member) internal {
        members.push(member);
    }

    /// @dev remove from member set
    function remove(address member) internal {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                members[i] = members[members.length - 1];
                members.pop();
                return;
            }
        }
    }

    /// @dev called by ERC20 before moving tokens from sender to receiver
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(to != address(this), "DAO LLC: cannot send tokens to the company");
        if (amount == 0) return;
        if (balanceOf(to) == 0) add(to);
    }

    /// @dev called ERC20 after moving tokens from sender to receiver
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from == address(0) || amount == 0) return;
        if (balanceOf(from) == 0) remove(from);
    }
    
    constructor() ERC20("Golden Nonce DAO LLC", "GNDT") {
        _mint(msg.sender, 10000 * (10 ** decimals()));
    }

    /// @dev withdraw ERC20 token from subsidiary contract
    function withdraw(address subsidiary, address token) public {
        Subsidiary(subsidiary).withdraw(token);
    }

    /// @dev distribute ERC20 token proporitionally to members
    function distribute(address token) public {
        uint256 token_balance = ERC20(token).balanceOf(address(this));
        require(token_balance > 0, "DAO LLC: nothing to distribute");

        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            uint256 member_equity = balanceOf(member);
            uint256 amount = (token_balance * member_equity) / totalSupply();
            ERC20(token).transfer(member, amount);
        }
    }
}