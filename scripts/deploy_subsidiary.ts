import { ethers } from "hardhat";

async function main() {
  const llc = "0x0"
  const SUBSIDIARY = await ethers.getContractFactory("Subsidiary");
  const subsidiary = await SUBSIDIARY.deploy();

  await subsidiary.deployed();

  console.log(`DAO LLC deployed to ${subsidiary.address}`);

  await subsidiary.transferOwnership(llc);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
