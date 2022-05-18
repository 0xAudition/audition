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
    let ClaimsRegistry;
    let Token;

    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;

    it("Should deploy ProjectRegistry and AUDN and set owner (owner should also have 100k AUDN tokens)", async function () {
      Token = await (await ethers.getContractFactory("AudToken")).deploy();

      ProjectRegistry = await (await ethers.getContractFactory("ProjectRegistry")).deploy(Token.address);

      ClaimsRegistry = await (await ethers.getContractFactory("ClaimsRegistry")).deploy(Token.address);

      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

      expect(await Token.owner()).to.equal(owner.address);
      expect(await ProjectRegistry.owner()).to.equal(owner.address);
      expect(await ClaimsRegistry.owner()).to.equal(owner.address);

      expect(await Token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should register project with given data", async function (){
      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerProject("TombFork", "tombfork.io");

      expect(await ProjectRegistry.getProjectCount()).to.equal("1");

      let projectInfo = await ProjectRegistry.getProjectInfo(0);
      // console.log("project info: ", projectInfo);

      expect(projectInfo.projectName).to.equal("TombFork");
      expect(projectInfo.metaData).to.equal("tombfork.io");
      expect(projectInfo.submitter).to.equal(owner.address);
    });

    it("Should register contracts with given data", async function () {
      await expect(ProjectRegistry.registerContract(0, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F"))
        .to.be.revertedWith('ERC20: insufficient allowance');

      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerContract(0, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F");

      expect(await ProjectRegistry.getContractCount(0)).to.equal('1'); //contract counter should go up for project

      let contractInfo = await ProjectRegistry.getContractInfo(0, 0);

      expect(contractInfo.projectId).to.equal('0');
      expect(contractInfo.contractId).to.equal('0');
      expect(contractInfo.contractName).to.equal("Vaults");
      expect(contractInfo.contractSourceUri).to.equal("ipfs://somehash");
      expect(contractInfo.contractAddr).to.equal('0xBd696eA529180b32e8c67F1888ed51Ac071cb56F');
      expect(contractInfo.bountyStatus).to.equal(false);
      expect(contractInfo.active).to.equal(true);

      await expect(ProjectRegistry.registerContract(0, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F"))
        .to.be.revertedWith('ERC20: insufficient allowance');

      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerContract(0, "Router", "ipfs://somehashsomehash", "0xF491e7B69E4244ad4002BC14e878a34207E38c29");

      expect(await ProjectRegistry.getContractCount(0)).to.equal('2'); //contract counter should go up for project

      contractInfo = await ProjectRegistry.getContractInfo(0, 1);

      expect(contractInfo.projectId).to.equal('0');
      expect(contractInfo.contractId).to.equal('1');
      expect(contractInfo.contractName).to.equal("Router");
      expect(contractInfo.contractSourceUri).to.equal("ipfs://somehashsomehash");
      expect(contractInfo.contractAddr).to.equal('0xF491e7B69E4244ad4002BC14e878a34207E38c29');
      expect(contractInfo.bountyStatus).to.equal(false);
      expect(contractInfo.active).to.equal(true);
    });

    it("Should deactivate project and contracts (onlyOwner)", async function () {
      expect(await ProjectRegistry.getProjectCount()).to.equal("1");

      await expect(ProjectRegistry.connect(addr1).rejectProject(0)) //only owner should be able to call reject project
        .to.be.revertedWith('Ownable: caller is not the owner');

      await expect(ProjectRegistry.connect(addr1).rejectContract(0, 0)) //only owner should be able to call reject contract
        .to.be.revertedWith('Ownable: caller is not the owner');

      await ProjectRegistry.rejectProject(0);

      expect((await ProjectRegistry.map_id_info(0)).active).to.equal(false);

      await ProjectRegistry.rejectContract(0,0);

      expect((await ProjectRegistry.getContractInfo(0,0)).active).to.equal(false);

      await expect(ProjectRegistry.rejectProject(0))
        .to.be.revertedWith('project is already deactivated');

      await expect(ProjectRegistry.rejectContract(0,0)) 
        .to.be.revertedWith('contract is already deactivated');

    });

  });
});