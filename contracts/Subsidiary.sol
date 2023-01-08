// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Subsidiary is Ownable {
    ERC20[] public holdings;

    function withdraw(address erc20) public onlyOwner {
        uint256 balance = ERC20(erc20).balanceOf(address(this));
        if (balance > 0) ERC20(erc20).transfer(owner(), balance);
    }
}