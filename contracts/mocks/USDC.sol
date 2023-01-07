// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

contract USDC is ERC20 {
    constructor(uint256 initialSupply) ERC20("Stablecoin", "USDC") {
        _mint(msg.sender, initialSupply);
    }
}