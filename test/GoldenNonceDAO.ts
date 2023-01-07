import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

// 10,000 time 10^18
const ten_thousand = "10000000000000000000000";

describe("Golden Nonce DAO Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use deployGNDT to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployGNDT() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, jack, grant] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("USDC");
    const usdc = await USDC.deploy(ten_thousand);

    const GNDT = await ethers.getContractFactory("GoldenNonceDAO");
    const gndt = await GNDT.deploy(ten_thousand, usdc.address);

    return { deployer, jack, grant, usdc, gndt };
  }

  describe("Deployment", function () {
    it("contracts initialize as expected", async function () {
      const { deployer, jack, grant, usdc, gndt } = await deployGNDT();

      expect(deployer).to.not.equal(null);
      expect(jack).to.not.equal(null);
      expect(grant).to.not.equal(null);
      expect(usdc).to.not.equal(null);
      expect(gndt).to.not.equal(null);

      expect(await usdc.balanceOf(deployer.address)).to.equal(ten_thousand);
      expect(await gndt.members(0)).to.equal(deployer.address);
      expect(await gndt.balanceOf(deployer.address)).to.equal(ten_thousand);
    });

    it("real world LLC set up works", async function () {
      const { deployer, jack, grant, usdc, gndt } = await deployGNDT();

      // send gdnt to grant and jack
      const five_thousand = "5000000000000000000000"
      await gndt.transfer(jack.address, five_thousand);
      await gndt.transfer(grant.address, five_thousand);

      expect(await gndt.balanceOf(grant.address)).to.equal(five_thousand);
      expect(await gndt.balanceOf(jack.address)).to.equal(five_thousand);
      expect(await gndt.balanceOf(grant.address)).to.equal(await gndt.balanceOf(jack.address))

      expect(await gndt.members(0)).to.equal(deployer.address);
      expect(await gndt.members(1)).to.equal(jack.address);
      expect(await gndt.members(2)).to.equal(grant.address);

      // send USDC to the contract, make sure it gets split 50 / 50
      expect(await usdc.balanceOf(deployer.address)).to.equal(ten_thousand);
      expect(await usdc.balanceOf(grant.address)).to.equal(0);
      expect(await usdc.balanceOf(jack.address)).to.equal(0);
      await usdc.connect(deployer).transfer(gndt.address, ten_thousand)

      await gndt.pay_members();

      expect(await usdc.balanceOf(deployer.address)).to.equal(0);
      expect(await usdc.balanceOf(grant.address)).to.equal(five_thousand);
      expect(await usdc.balanceOf(jack.address)).to.equal(five_thousand);
      expect(await usdc.balanceOf(grant.address)).to.equal(await gndt.balanceOf(jack.address))
    });
  });
});
