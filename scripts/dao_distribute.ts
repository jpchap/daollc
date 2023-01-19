import { ethers } from "hardhat";

async function main() {
  const llc = "0x0";
  const token = "0x0";
  const DAOLLC = await ethers.getContractFactory("DAOLLC");

  const daollc = await DAOLLC.attach(llc);
  daollc.distribute(token);

  console.log("distributed token successfully");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
