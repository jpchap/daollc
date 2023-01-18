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

    it("GNDT can own another contract", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();
      await gndt.transfer(grant.address, five_thousand);

      // deployer creates subsidiary
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

    // test we can withdraw funds from multiple subsidiaries without issue
    it("GNDT can withdraw funs from arbitrary / random number of subsidiaries", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();

      const amount = Math.floor(Math.random() * 20);

      let totalSupply = 10000;

      let subsidiaries = [];
      for (let i = 0; i < amount; i++) {
        // deployer creates subsidiary
        const SUBSIDIARY = await ethers.getContractFactory("Subsidiary");
        const subsidiary = await SUBSIDIARY.deploy();
        subsidiaries.push(subsidiary)

        const money = Math.floor(Math.random() * totalSupply / 2);
        totalSupply -= money;
        await usdc.transfer(subsidiary.address, money);
      }

      // expect failure as nothing has been withdrawn
      await expect(
        gndt.distribute(usdc.address)
      ).to.be.revertedWith("DAO LLC: nothing to distribute");

      for (let i = 0; i < amount; i++) {
        await subsidiaries[i].transferOwnership(gndt.address);
        await gndt.withdraw(subsidiaries[i].address, usdc.address);

        await expect(
          gndt.withdraw(subsidiaries[i].address, gndt.address)
        ).to.be.revertedWith("No tokens to withdraw");
      }

      let jbalance = await usdc.balanceOf(jack.address);
      await expect(jbalance).to.not.equal(await usdc.totalSupply());

      // Show that we can withdraw tokens with the contract as well
      await gndt.connect(jack).distribute(usdc.address);

      jbalance = await gndt.balanceOf(jack.address);
      await expect(jbalance).to.equal(await usdc.totalSupply());
    })

    // test we can distribute to n-many wallets
    it("GNDT can distribute to arbitrary / random number of wallets", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();

      const amount = Math.floor(Math.random() * 20);

      let totalSupply = 10000;

      let signers = [];
      for (let i = 0; i < amount; i++) {
        signers.push(ethers.Wallet.createRandom())
        const equity = Math.floor(Math.random() * totalSupply / 2);
        totalSupply -= equity;
        await gndt.connect(jack).transfer(signers[signers.length - 1].address, equity);

        const balance = await gndt.balanceOf(signers[signers.length - 1].address);
      }

      await usdc.connect(jack).transfer(gndt.address, ten_thousand)

      // Show that we can withdraw tokens with the contract as well
      await gndt.distribute(usdc.address);


      for (let i = 0; i < amount; i++) {
        const balance = await usdc.balanceOf(signers[i].address);
        expect(await gndt.balanceOf(signers[i].address)).to.equal(balance);
      }

      const jbalance = await usdc.balanceOf(jack.address);
      expect(await gndt.balanceOf(jack.address)).to.equal(jbalance);
    })

    // test what happens if we give gndt to the gndt contract
    it("GNDT equity cannot be held by GNDT contract", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();

      // transfer gndt to gndt contract
      await expect (
        gndt.transfer(gndt.address, five_thousand)
      ).to.be.revertedWith("DAO LLC: cannot send tokens to the company");
    })

    // test what happens if we burn gndt
    it("GNDT equity cannot be burned", async function () {
      const { jack, grant, usdc, gndt } = await deployGNDT();

      // cannot burn tokens
      await expect (
        gndt.transfer(ethers.constants.AddressZero, ten_thousand)
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    })
  });
});
