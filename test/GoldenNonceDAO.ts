import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { string } from "hardhat/internal/core/params/argumentTypes";

// 10,000 time 10^18
const ten_thousand = "10000000000000000000000";
const five_thousand = "5000000000000000000000"

describe("Golden Nonce DAO Token", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use deployGNDT to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployGNDT() {
    // Contracts are deployed using the first signer/account by default
    const [jack, grant] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("USDC");
    const usdc = await USDC.deploy(ten_thousand);

    const GNDT = await ethers.getContractFactory("GoldenNonceDAO");
    const gndt = await GNDT.deploy();

    await ethers.getContractFactory("GoldenNonceDAO");

    return { jack, grant, usdc, gndt };
  }

  describe("Deployment", function () {
    it("contracts initialize as expected", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();

      expect(jack).to.not.equal(null);
      expect(grant).to.not.equal(null);
      expect(usdc).to.not.equal(null);
      expect(gndt).to.not.equal(null);

      expect(await usdc.balanceOf(jack.address)).to.equal(ten_thousand);
      expect(await gndt.balanceOf(jack.address)).to.equal(ten_thousand);
    });

    it("real world LLC set up works", async function () {
      const { jack, grant, usdc, gndt }  = await deployGNDT();

      // send gdnt to grant and jack
      // await gndt.transfer(jack.address, five_thousand);
      await gndt.transfer(grant.address, five_thousand);

      expect(await gndt.balanceOf(grant.address)).to.equal(five_thousand);
      expect(await gndt.balanceOf(jack.address)).to.equal(five_thousand);
      expect(await gndt.balanceOf(grant.address)).to.equal(await gndt.balanceOf(jack.address))

      // send USDC to the contract, make sure it gets split 50 / 50
      expect(await usdc.balanceOf(jack.address)).to.equal(ten_thousand);
      expect(await usdc.balanceOf(grant.address)).to.equal(0);
      await usdc.connect(jack).transfer(gndt.address, ten_thousand)

      // Show that we can withdraw tokens with the contract as well
      await gndt.distribute(usdc.address);

      expect(await usdc.balanceOf(grant.address)).to.equal(five_thousand);
      expect(await usdc.balanceOf(jack.address)).to.equal(five_thousand);
      expect(await usdc.balanceOf(grant.address)).to.equal(await gndt.balanceOf(jack.address))
    });

    it("LLC can own another contract", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();
      await gndt.transfer(grant.address, five_thousand);

      // deployer creates OwnableMock
      const SUBSIDIARY = await ethers.getContractFactory("Subsidiary");
      const subsidiary = await SUBSIDIARY.deploy();

      // verify deployer is owner
      expect(await subsidiary.owner()).to.equal(jack.address);

      // verify non-owner cannot withdraw
      await expect(
        subsidiary.connect(grant).transferOwnership(grant.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // use jack wallet to change owner to gndt
      await subsidiary.transferOwnership(gndt.address);

      // verify non-owner cannot withdraw
      await expect(
        subsidiary.withdraw(usdc.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      // verify correct owner
      expect(await subsidiary.owner()).to.equal(gndt.address);

      expect(await usdc.balanceOf(subsidiary.address)).to.equal(0);

      // send USDC to subsidiary
      await usdc.transfer(subsidiary.address, await usdc.balanceOf(jack.address));

      expect(await usdc.balanceOf(subsidiary.address)).to.equal(ten_thousand);

      // withdraw and distribute monies from contract
      await gndt.withdraw(subsidiary.address, usdc.address);
      await gndt.distribute(usdc.address);

      expect(await usdc.balanceOf(grant.address)).to.equal(five_thousand);
      expect(await usdc.balanceOf(jack.address)).to.equal(five_thousand);
    });

    // TODO: additional tests

    // test we can distribute to n-many wallets

    // test we can distribute to n-many wallets and change the number multiple times and use different ERC20s
  });
});
