import { ethers } from "hardhat";

async function main() {
  const DAOLLC = await ethers.getContractFactory("DAOLLC");
  const daollc = await DAOLLC.deploy();

  await daollc.deployed();

  console.log(`DAO LLC deployed to ${daollc.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
