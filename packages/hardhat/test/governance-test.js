const { ethers } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Audition Voting", function () {

    const ProposalState = {
        Pending: 0,
        Active: 1,
        Canceled: 2,
        Defeated: 3,
        Succeeded: 4,
        Queued: 5,
        Expired: 6,
        Executed: 7
    }

    // quick fix to let gas reporter fetch data from gas station & coinmarketcap
    before((done) => {
        setTimeout(done, 2000);
    });

    describe("proposal process", function () {
        let AudToken;
        let AudGoverner;

        let owner;
        let addr1;
        let addr2;
        let addr3;
        let addrs;
        let proposalInfo =

            it("Should deploy all contracts", async function () {
                AudToken = await (await ethers.getContractFactory("AudToken")).deploy();
                AudGoverner = await (await ethers.getContractFactory("AudGoverner")).deploy(AudToken.address);
                //...Other contracts


                [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
            });

        it("Should delegate user vote to self", async function () {
            assert.notEqual((await AudToken.getVotes(owner.address)).toString(), (await AudToken.balanceOf(owner.address)).toString());
            await AudToken.delegate(owner.address);
            assert.equal((await AudToken.getVotes(owner.address)).toString(), (await AudToken.balanceOf(owner.address)).toString());
        });

        it("should create a proposal", async function () {
            const grantAmount = 100;
            const transferCalldata = AudToken.interface.encodeFunctionData('mint', [addr1.address, grantAmount]);

            let tx = await AudGoverner.propose(
                [AudToken.address],
                [0],
                [transferCalldata],
                'Proposal #1: Mint funds',
            );
            await expect(tx).to.emit(AudGoverner, "ProposalCreated");

            const receipt = await tx.wait();
            let proposal = receipt.events.find(e => e.event === 'ProposalCreated').args;
            proposalInfo = proposal;
            // console.log('state', await AudGoverner.state(proposal.proposalId));

            assert.equal(await AudGoverner.state(proposal.proposalId), 0);
        });

        it("should vote on created proposal", async function () {
            console.log('state', await AudGoverner.state(proposalInfo.proposalId));
            assert.isFalse(await AudGoverner.hasVoted(proposalInfo.proposalId, owner.address));
            await AudGoverner.castVote(proposalInfo.proposalId, 1);
            assert.isTrue(await AudGoverner.hasVoted(proposalInfo.proposalId, owner.address));
        });

        it("should verify proposal success", async function () {
            // const x = 10;
            // const xDays = x * 24 * 60 * 60;

            // await ethers.provider.send('evm_increaseTime', [xDays]);

            // console.log('Current Block', await ethers.provider.getBlockNumber());
            // console.log('Proposal End Block', proposalInfo.endBlock);

            while (proposalInfo.endBlock >= await ethers.provider.getBlockNumber()) {
                await ethers.provider.send('evm_mine');
                // console.log('After mining - Current Block', await ethers.provider.getBlockNumber());
            }

            // console.log('blockNumber', await ethers.provider.getBlockNumber());
            assert.isTrue(proposalInfo.endBlock < await ethers.provider.getBlockNumber());

            // console.log('state', await AudGoverner.state(proposalInfo.proposalId));
            assert.equal(await AudGoverner.state(proposalInfo.proposalId), ProposalState.Succeeded);
        });

        it("should change Governer contract to Token owner", async function () {
            await AudToken.transferOwnership(AudGoverner.address);
            assert.equal(await AudToken.owner(), AudGoverner.address);
        });

        it("should execute proposal", async function () {
            const grantAmount = 100;
            const transferCalldata = AudToken.interface.encodeFunctionData('mint', [addr1.address, grantAmount]);
            const descriptionHash = ethers.utils.id('Proposal #1: Mint funds');

            let previousTokenCount = await AudToken.balanceOf(addr1.address);
            // console.log({ previousTokenCount });

            let tx = await AudGoverner.execute(
                [AudToken.address],
                [0],
                [transferCalldata],
                descriptionHash
            );

            const receipt = await tx.wait();
            let data = receipt.events.find(e => e.event === 'ProposalExecuted').args;
            // console.log(data);

            await expect(tx).to.emit(AudGoverner, "ProposalExecuted");
            assert.equal((await AudToken.balanceOf(addr1.address)).toString(), '100');
        });
    });


    describe("Full flow", function () {
        let AudToken;
        let AudGoverner;
        let ProjectRegistry;
        let ClaimsRegistry;

        const approveAmount = '20000000000000000000'; //20 AUDN

        let owner;
        let addr1;
        let addr2;
        let addr3;
        let addrs;
        let proposalInfo =

            it("Should deploy all contracts", async function () {
                AudToken = await (await ethers.getContractFactory("AudToken")).deploy();
                AudGoverner = await (await ethers.getContractFactory("AudGoverner")).deploy(AudToken.address);
                ProjectRegistry = await (await ethers.getContractFactory("ProjectRegistry")).deploy(AudToken.address);
                ClaimsRegistry = await (await ethers.getContractFactory("ClaimsRegistry")).deploy(AudToken.address);
                //...Other contracts


                [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
            });

        it("Should delegate user vote to self", async function () {
            assert.notEqual((await AudToken.getVotes(owner.address)).toString(), (await AudToken.balanceOf(owner.address)).toString());
            await AudToken.delegate(owner.address);
            assert.equal((await AudToken.getVotes(owner.address)).toString(), (await AudToken.balanceOf(owner.address)).toString());
        });


        it("Submit Project and Claim against it", async function () {

            await AudToken.approve(ProjectRegistry.address, approveAmount, { from: owner.address });

            await ProjectRegistry.registerContract(0, "Vaults", "ipfs://somehash", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F");

            await AudToken.approve(ClaimsRegistry.address, approveAmount, { from: owner.address });

            await ClaimsRegistry.registerClaim(0, 1, "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F", "Metadata info for claim- could be json data");

            console.log('sns - Project & claim done');

            // Skipping project approval and going to claim approval
            let claimId = 0; // from code

            // console.log('sns-1', await ClaimsRegistry.claimId_info_map(claimId));
            // console.log('sns-2', await ClaimsRegistry.claimId_info_map[claimId]);

            const grantAmount = 100;
            let claimSubmitter = (await ClaimsRegistry.claimId_info_map(claimId)).submitter;
            const transferCalldata = AudToken.interface.encodeFunctionData('mint', [claimSubmitter, grantAmount]);
            const claimApproveCallData = ClaimsRegistry.interface.encodeFunctionData('approveClaim', [claimId]);

            let tx = await AudGoverner.propose(
                [AudToken.address, ClaimsRegistry.address],
                [0, 0],
                [transferCalldata, claimApproveCallData],
                'Proposal to approve ClaimId: ' + claimId,
            );
            await expect(tx).to.emit(AudGoverner, "ProposalCreated");

            const receipt = await tx.wait();
            let proposal = receipt.events.find(e => e.event === 'ProposalCreated').args;
            proposalInfo = proposal;
            // console.log('state', await AudGoverner.state(proposal.proposalId));

            assert.equal(await AudGoverner.state(proposal.proposalId), 0);
        });

        it("should vote on created proposal", async function () {
            console.log('state', await AudGoverner.state(proposalInfo.proposalId));
            assert.isFalse(await AudGoverner.hasVoted(proposalInfo.proposalId, owner.address));
            await AudGoverner.castVote(proposalInfo.proposalId, 1);
            assert.isTrue(await AudGoverner.hasVoted(proposalInfo.proposalId, owner.address));
        });

        it("should verify proposal success", async function () {
            // const x = 10;
            // const xDays = x * 24 * 60 * 60;

            // await ethers.provider.send('evm_increaseTime', [xDays]);

            // console.log('Current Block', await ethers.provider.getBlockNumber());
            // console.log('Proposal End Block', proposalInfo.endBlock);

            while (proposalInfo.endBlock >= await ethers.provider.getBlockNumber()) {
                await ethers.provider.send('evm_mine');
                // console.log('After mining - Current Block', await ethers.provider.getBlockNumber());
            }

            // console.log('blockNumber', await ethers.provider.getBlockNumber());
            assert.isTrue(proposalInfo.endBlock < await ethers.provider.getBlockNumber());

            // console.log('state', await AudGoverner.state(proposalInfo.proposalId));
            assert.equal(await AudGoverner.state(proposalInfo.proposalId), ProposalState.Succeeded);
        });

        it("should change Governer contract to Token owner", async function () {
            await AudToken.transferOwnership(AudGoverner.address);
            assert.equal(await AudToken.owner(), AudGoverner.address);

            await ClaimsRegistry.transferOwnership(AudGoverner.address);
            assert.equal(await ClaimsRegistry.owner(), AudGoverner.address);
        });

        it("should execute proposal", async function () {
            let claimId = 0;
            const descriptionHash = ethers.utils.id('Proposal to approve ClaimId: ' + claimId);

            let previousTokenCount = await AudToken.balanceOf(addr1.address);
            console.log({ previousTokenCount });

            

            
            const grantAmount = 100;
            let claimSubmitter = (await ClaimsRegistry.claimId_info_map(claimId)).submitter;
            const transferCalldata = AudToken.interface.encodeFunctionData('mint', [claimSubmitter, grantAmount]);
            const claimApproveCallData = ClaimsRegistry.interface.encodeFunctionData('approveClaim', [claimId]);

            assert.isFalse((await ClaimsRegistry.claimId_info_map(claimId)).approved);

            let tx = await AudGoverner.execute(
                [AudToken.address, ClaimsRegistry.address],
                [0, 0],
                [transferCalldata, claimApproveCallData],
                descriptionHash
            );

            const receipt = await tx.wait();
            let data = receipt.events.find(e => e.event === 'ProposalExecuted').args;
            console.log(data);

            await expect(tx).to.emit(AudGoverner, "ProposalExecuted");
            // assert.equal((await AudToken.balanceOf(addr1.address)).toString(), '100');

            assert.isTrue((await ClaimsRegistry.claimId_info_map(claimId)).approved);


        });
    });


});
