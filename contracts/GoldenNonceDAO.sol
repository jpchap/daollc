// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Subsidiary.sol";
import "./Set.sol";

contract GoldenNonceDAO is ERC20 {
    Set public members;
    Set public subsidiaries; // TODO: decide if we want a way to transfer out subsidiaries
    // Set public tokens; // TODO: accept tokens other than USDC
    address usdc;
    
    constructor(uint256 _initial_supply, address _usdc) ERC20("Golden Nonce DAO LLC", "GNDT") {
        members = new Set();
        subsidiaries = new Set();
        usdc = _usdc;
        _mint(msg.sender, _initial_supply); // TODO: verify decimals is whole tokens
    }

    // adds new members to the dao for distribution
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        Set(members).add(to);
        if (from != address(0) && balanceOf(from) == 0) Set(members).remove(from);
    }

    function add_subsidiary(address subsidiary) public {
        require(Subsidiary(subsidiary).owner() == address(this), "GNDT: cannot add a subsidiary we do not own");
        Set(subsidiaries).add(subsidiary);
    }

    // distribute earnings to token holders

    // TODO: make this more gas efficient
    function pay_members() public {
        // loop over subsidiaries and withdraw tokens
        for (uint256 i = 1; i < Set(subsidiaries).length(); i++) {
            Subsidiary s = Subsidiary(Set(subsidiaries).elements(i));
            s.withdraw(usdc);
        }

        // get total sum of USDC... TODO: update if we want to take additional tokens
        uint256 contract_balance = ERC20(usdc).balanceOf(address(this));
        require(contract_balance > 0, "GNDT: no money to be distributed");

        // pay each member proportional to their ownership
        for (uint256 i = 1; i < Set(members).length(); i++) {
            address member = Set(members).elements(i);
            uint256 member_equity = balanceOf(member);
            if (member_equity > 0) {
                uint256 amount = (contract_balance * member_equity) / totalSupply();
                ERC20(usdc).transfer(member, amount);
            }
        }
    }
}
