// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Subsidiary is Ownable {
    function withdraw(address token) public {
        uint256 balance = ERC20(token).balanceOf(address(this));
        require(balance > 0, "Subsidiary: no tokens to withdraw");
        ERC20(token).transfer(owner(), balance);
    }
}