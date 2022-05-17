const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Audition ProjectRegistry", function () {
  const initialSupply = '100000000000000000000000'; //100k AUDN
  const approveAmount = '20000000000000000000'; //20 AUDN


  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("project registry functionality", function () {

    let ProjectRegistry;
    let Token;

    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;

    it("Should deploy ProjectRegistry and AUDN and set owner (owner should also have 100k AUDN tokens)", async function () {
      Token = await (await ethers.getContractFactory("AudToken")).deploy();

      ProjectRegistry = await (await ethers.getContractFactory("ProjectRegistry")).deploy(Token.address);

      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

      expect(await Token.owner()).to.equal(owner.address);
      expect(await ProjectRegistry.owner()).to.equal(owner.address);

      expect(await Token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should register project with given data", async function (){
      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerProject("TombFork", "tombfork.io");

      expect(await ProjectRegistry.getProjectCount()).to.equal("1");

      let projectInfo = await ProjectRegistry.getProjectInfo(0);
      console.log("project info: ", projectInfo);

      expect(projectInfo.projectName).to.equal("TombFork");
      expect(projectInfo.metaData).to.equal("tombfork.io");
      expect(projectInfo.submitter).to.equal(owner.address);
    });

  });
});
