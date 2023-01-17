// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Subsidiary is Ownable {
    function withdraw(address token) public onlyOwner {
        uint256 balance = ERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(msg.sender == owner(), "BROKEN"); // TODO: remove this
        ERC20(token).transfer(msg.sender, balance);
    }
}