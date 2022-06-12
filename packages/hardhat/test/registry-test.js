const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

function bigNumber(num) {
  return ethers.BigNumber.from(num);
}

describe("Audition ProjectRegistry", function () {
  const initialSupply = '100000000000000000000000'; //100k AUDN
  const approveAmount = '20000000000000000000'; //20 AUDN
  const bountyAmount = '1000000000000000000000'; //1000 AUDN
  const percentYield =     '200000000000000000';
  const decimals = '1000000000000000000'; // 10 ** 18

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
      Token = await (await ethers.getContractFactory("AudnToken")).deploy();

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

      await ProjectRegistry.registerProject("TombFork", "tombfork.io", "Boardroom", "ipfs://forkboardroom", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F");

      expect(await ProjectRegistry.getProjectCount()).to.equal("1");
      expect(await ProjectRegistry.getContractCount(1)).to.equal("1");

      let projectInfo = await ProjectRegistry.getProjectInfo(1);
      let contractInfo = await ProjectRegistry.getContractInfo(1, 1);

      console.log("project info: ", projectInfo);
      expect(projectInfo[0]).to.equal("TombFork");
      expect(projectInfo[1]).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      expect(projectInfo[2]).to.equal('tombfork.io');
      expect(projectInfo[3]).to.equal(false);
      expect(projectInfo[4]).to.equal('1');
      expect(projectInfo[5]).to.equal(true);

      expect(contractInfo.projectId).to.equal('1');
      expect(contractInfo.contractId).to.equal('1');
      expect(contractInfo.contractName).to.equal("Boardroom");
      expect(contractInfo.contractSourceUri).to.equal("ipfs://forkboardroom");
      expect(contractInfo.contractAddr).to.equal('0xBd696eA529180b32e8c67F1888ed51Ac071cb56F');
      expect(contractInfo.bountyStatus).to.equal(false);
      expect(contractInfo.active).to.equal(true);

    });

    it("Should register contracts with given data", async function () {
      await expect(ProjectRegistry.registerContract(0, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F"))
        .to.be.revertedWith('invalid project id');

      // await expect(ProjectRegistry.registerContract(1, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F"))
      //   .to.be.revertedWith('ERC20: insufficient allowance');

      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerContract(1, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F");

      expect(await ProjectRegistry.getContractCount(1)).to.equal('2'); //contract counter should go up for project

      let contractInfo = await ProjectRegistry.getContractInfo(1, 2);

      expect(contractInfo.projectId).to.equal('1');
      expect(contractInfo.contractId).to.equal('2');
      expect(contractInfo.contractName).to.equal("Vaults");
      expect(contractInfo.contractSourceUri).to.equal("ipfs://somehash");
      expect(contractInfo.contractAddr).to.equal('0xBd696eA529180b32e8c67F1888ed51Ac071cb56F');
      expect(contractInfo.bountyStatus).to.equal(false);
      expect(contractInfo.active).to.equal(true);

      // await expect(ProjectRegistry.registerContract(1, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F"))
      //   .to.be.revertedWith('ERC20: insufficient allowance');

      await Token.approve(ProjectRegistry.address, approveAmount, {from: owner.address});

      await ProjectRegistry.registerContract(1, "Router", "ipfs://somehashsomehash", "0xF491e7B69E4244ad4002BC14e878a34207E38c29");

      expect(await ProjectRegistry.getContractCount(1)).to.equal('3'); //contract counter should go up for project

      contractInfo = await ProjectRegistry.getContractInfo(1, 3);

      expect(contractInfo.projectId).to.equal('1');
      expect(contractInfo.contractId).to.equal('3');
      expect(contractInfo.contractName).to.equal("Router");
      expect(contractInfo.contractSourceUri).to.equal("ipfs://somehashsomehash");
      expect(contractInfo.contractAddr).to.equal('0xF491e7B69E4244ad4002BC14e878a34207E38c29');
      expect(contractInfo.bountyStatus).to.equal(false);
      expect(contractInfo.active).to.equal(true);

      let contracts = await ProjectRegistry.getContractsFromProject(1);

      console.log("contracts: ", contracts);
    });

    it("Should set bounties for given project", async function () {
      await Token.mint(addr1.address, bountyAmount);
      await Token.connect(addr1).approve(ProjectRegistry.address, bountyAmount);

      await ProjectRegistry.connect(addr1).setDeposit(1, 1000, 1, 5);

      let deposit = await ProjectRegistry.getDeposits(1);

      expect(deposit[0].projectId).to.equal('1');
      expect(deposit[0].depositId).to.equal('0');
      expect(deposit[0].submitter).to.equal(addr1.address);
      expect(deposit[0].amount).to.equal(bountyAmount);
      expect(deposit[0].depositType).to.equal(1);

      await Token.mint(addr2.address, bountyAmount);
      await Token.connect(addr2).approve(ProjectRegistry.address, bountyAmount);

      await ProjectRegistry.connect(addr2).setDeposit(1, 1000, 2, 1);

      deposit = await ProjectRegistry.getDeposits(1);

      expect(deposit[1].projectId).to.equal('1');
      expect(deposit[1].depositId).to.equal('1');
      expect(deposit[1].submitter).to.equal(addr2.address);
      expect(deposit[1].amount).to.equal(bountyAmount);
      expect(deposit[1].depositType).to.equal(2);
    });

    it("Should register claims with given project info", async function () {

      await ClaimsRegistry.setProjectRegistry(ProjectRegistry.address);

      await Token.approve(ClaimsRegistry.address, ethers.BigNumber.from(bountyAmount).mul(2), {from: owner.address});

      await ClaimsRegistry.registerClaim(1, 1, '0xBd696eA529180b32e8c67F1888ed51Ac071cb56F', 'some meta data possibly Json', 1, 200, 0);

      console.log("FIRST CLAIM REGISTERED");

      expect(await ClaimsRegistry.balanceOf(owner.address)).to.equal('1');

      let claim = await ClaimsRegistry.getClaimInfo(1);

      console.log("first claim passed");

      expect(claim.projectId).to.equal('1');
      expect(claim.contractId).to.equal('1');
      expect(claim.contractAddress).to.equal('0xBd696eA529180b32e8c67F1888ed51Ac071cb56F');
      expect(claim.metaData).to.equal('some meta data possibly Json');
      expect(claim.premiumBalance).to.equal(ethers.BigNumber.from('200').mul(decimals));
      expect(claim.claimType).to.equal(1);

      await Token.approve(ClaimsRegistry.address, approveAmount, {from: owner.address});

      await ClaimsRegistry.registerClaim(1, 1, '0xF491e7B69E4244ad4002BC14e878a34207E38c29', 'Json meta data', 2, 0, 0);

      expect(await ClaimsRegistry.balanceOf(owner.address)).to.equal('2');

      let claims = await ClaimsRegistry.getClaims(1);

      console.log("claims: ", claims);
    });

    it("calculating deposit yields", async function () {
      let depositYield = ethers.BigNumber.from(bountyAmount).div(100).mul(20);
      let oneDayYield = depositYield.div(365);
      console.log("deposit yield one day: ", oneDayYield.toString());
      console.log("deposit yield one year: ", depositYield.toString());

      console.log("deposit yield one day token amount : ", ethers.utils.formatUnits(oneDayYield.toString()));

      let deposit = await ProjectRegistry.getDeposits(1);

      expect(deposit[0].projectId).to.equal('1');
      expect(deposit[0].depositId).to.equal('0');
      expect(deposit[0].submitter).to.equal(addr1.address);
      expect(deposit[0].amount).to.equal(bountyAmount);
      expect(deposit[0].depositType).to.equal(1);

      // let flag = await ProjectRegistry.verifyProject(1);
      // let flag = await ProjectRegistry.verifyDepositGivenIdAndUser(5, 1, addr1.address);
      // console.log("flag :", flag);
      //
      // deposit = await ProjectRegistry.getDepositGivenIdAndUser(1, 0, addr1.address);
      //
      // console.log("deposit givenid and user :", deposit);
      // let startBlock = deposit[0].startBlock;
      // console.log("startBlock :", startBlock.toString());

      // console.log("block before forward: ", await ethers.provider.getBlockNumber());
      // for (let index = 0; index < 40000; index++) {
      //   await ethers.provider.send('evm_mine');
      // }
      //
      // console.log("block after forward", await ethers.provider.getBlockNumber());
      //
      // let currentYield = await ProjectRegistry.calculateYieldGivenDeposit(1, 0, addr1.address);
      // console.log('current yield', currentYield.toString());
      //
      // expect(currentYield).to.equal(oneDayYield);
      //
      // console.log("yieldGivenDeposit: ", currentYield.toString());

    });

    it("Users should claim bounty from released deposit", async function () {
      await ProjectRegistry.setClaimsRegistry(ClaimsRegistry.address);
      await Token.setRegistry(ProjectRegistry.address);

      await ProjectRegistry.connect(addr1).releaseDeposit(1, 0, 1);

      deposit = await ProjectRegistry.getDepositGivenIdAndUser(1, 0, addr1.address);

      console.log("deposit released amount : ", ethers.utils.formatUnits(deposit.releasedAmount.toString()));

      expect(await ClaimsRegistry.getPremiumBalance()).to.equal(bigNumber(200).mul(decimals).toString());

      let balanceBeforeClaim = await Token.balanceOf(owner.address);
      let contractBalance = await ProjectRegistry.getDepositBalance();
      let contractRealBalance = await Token.balanceOf(ProjectRegistry.address);

      console.log("user balance before collecting claim : ", ethers.utils.formatUnits(balanceBeforeClaim.toString()));
      console.log("contract deposit balance before collecting claim : ", ethers.utils.formatUnits(contractBalance.toString()));
      console.log("contract real balance before collecting claim : ", ethers.utils.formatUnits(contractRealBalance.toString()));

      await ProjectRegistry.collectClaim(1, 0, 1);

      let balanceAfterClaim = await Token.balanceOf(owner.address);
      contractBalance = await ProjectRegistry.getDepositBalance();
      contractRealBalance = await Token.balanceOf(ProjectRegistry.address);

      console.log("user balance after collecting claim : ", ethers.utils.formatUnits(balanceAfterClaim.toString()));
      console.log("contract deposit balance after collecting claim : ", ethers.utils.formatUnits(contractBalance.toString()));
      console.log("contract real balance after collecting claim : ", ethers.utils.formatUnits(contractRealBalance.toString()));


      claims = await ClaimsRegistry.getClaims(1);

      console.log("claims: ", claims);

      expect(claims[0].claimedAmount).to.equal(bigNumber(1000).mul(decimals));
      expect(await ClaimsRegistry.getPremiumBalance()).to.equal(bigNumber(0).mul(decimals));

      expect(await Token.balanceOf(owner.address)).to.equal(bigNumber(101000).mul(decimals));



      //collecting insurance claim.


    });

    it("Should deactivate project and contracts (onlyOwner)", async function () {
      expect(await ProjectRegistry.getProjectCount()).to.equal("1");

      await expect(ProjectRegistry.connect(addr1).rejectProject(1)) //only owner should be able to call reject project
        .to.be.revertedWith('Ownable: caller is not the owner');

      await expect(ProjectRegistry.connect(addr1).rejectContract(1, 1)) //only owner should be able to call reject contract
        .to.be.revertedWith('Ownable: caller is not the owner');

      await ProjectRegistry.rejectProject(1);

      expect((await ProjectRegistry.map_id_info(1)).active).to.equal(false);

      await ProjectRegistry.rejectContract(1,1);

      expect((await ProjectRegistry.getContractInfo(1,1)).active).to.equal(false);

      await expect(ProjectRegistry.rejectProject(1))
        .to.be.revertedWith('project is already deactivated');

      await expect(ProjectRegistry.rejectContract(1,1))
        .to.be.revertedWith('contract is already deactivated');

    });


  });
});
