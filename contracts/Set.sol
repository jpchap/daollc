// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// TODO: make sure the zero indexing always works!

contract Set is Ownable { // TODO: consider how ridiculous an ownable Set is...
    address[] public elements;
    mapping (address => uint256) public indices;

    constructor() {
        elements.push(address(0));
        indices[address(0)] = 0;
    }

    function length() public view returns (uint256) { return elements.length; }

    function add(address addr) public onlyOwner {
        // if its not in the set, add it!
        if(indices[addr] == 0) {
            // add it to the set
            indices[addr] = elements.length + 1;
            elements.push(addr);
        }
    }

    // removes final element from the array
    function remove(address addr) public onlyOwner {
        // verify this address is included in the set
        uint256 index = indices[addr];
        require(index != 0, "SET: invalid address provided");

        // reset the indices of the elements
        indices[elements[elements.length + 1]] = index;
        indices[addr] = 0;

        // remove addr from the set
        elements[index] = elements[elements.length + 1];
        elements.pop();
    }
}