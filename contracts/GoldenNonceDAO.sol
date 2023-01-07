// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GoldenNonceDAO is ERC20 {
    address[] public members; // TODO: make this more efficient
    ERC20 USDC;

    constructor(address _USDC) ERC20("Golden Nonce DAO LLC", "GNDT") {
        USDC = ERC20(_USDC);
        members = new address[](1);
    }

    // adds new members to the dao for distribution
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        // if you already have this person as a member do not add them!
        uint256 from_index = members.length + 1;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == to) return;
            if (members[i] == from) from_index = i;
        }

        // if this is true, then something is seriously wrong!
        // TODO: remove prior to deploy
        require(from_index != members.length + 1);

        // confirmed this person is not yet recorded as a member!
        if (this.balanceOf(from) > 0) {
            members.push(to);
        } else {
            // replace the old address with the new one!
            members[from_index] = to;
        }
    }

    // distribute earnings to token holders
    function pay_members() public {
        // get total sum of USDC
        uint256 contract_balance = USDC.balanceOf(address(this));

        // pay each member proportional to their ownership
        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            uint256 member_equity = this.balanceOf(member);
            if (member_equity > 0) {
                uint256 amount = (contract_balance * member_equity) / this.totalSupply();
                USDC.transfer(member, amount);
            }
        }
    }
}
