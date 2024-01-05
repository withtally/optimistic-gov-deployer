
import { ethers } from "hardhat";
import { expect } from "chai";
import {
    EventLog,
} from "ethers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";

function timelockSalt(contractAddress:String, descriptionHash:string) {
    // Ensure the address is 20 bytes
    const addressBytes20 = ethers.zeroPadValue(ethers.stripZerosLeft(contractAddress), 20);

    // Convert to Buffers for XOR operation
    const bufferAddress = Buffer.from(addressBytes20.slice(2), 'hex'); // Remove '0x'
    const bufferDescriptionHash = Buffer.from(descriptionHash.slice(2), 'hex');

    // Perform XOR operation
    let xorResult = Buffer.alloc(32); // Initialize a 32-byte buffer
    for (let i = 0; i < bufferAddress.length; i++) {
        xorResult[i] = bufferAddress[i] ^ bufferDescriptionHash[i];
    }
    for (let i = bufferAddress.length; i < bufferDescriptionHash.length; i++) {
        xorResult[i] = bufferDescriptionHash[i];
    }

    // Convert the result back to a hex string
    return '0x' + xorResult.toString('hex');

}


export async function shouldBehaveLikeGovernor(): Promise<void> {

    it("should receive answer from CLOCK_MODE", async function () {
        const { governor, _, } = this;

        const clock_mode = await governor.CLOCK_MODE();

        expect(clock_mode).to.be.equal("mode=blocknumber&from=default");
    });

    it("clock should return the current block number", async function () {
        const { governor, _, } = this;

        const clock = await governor.clock();
        const pBlock = await ethers.provider.getBlock("latest");

        expect(clock).to.be.equal(pBlock?.number);
    });

    it("should mint 10000 tokens", async function () {
        const { token, signers, t } = this;

        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balance = await token.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(amountToMint);
    });

    it("should work the full proposal lifecycle up to executed", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cast before voting delay and fails
        await expect(governor.castVote(proposalId, 1)).to.be.reverted;

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        //try to queue before is executable and fails

        // Queue proposal
        await expect(governor.queue(proposalId)).to.be.reverted;

        // Vote
        await expect(governor.castVote(proposalId, 1n)).to.emit(governor, "VoteCast");

        // We can Queue before the voting Period because it is a SuperQuorum.

        // Wait for voting period to end
        await ethers.provider.send("evm_increaseTime", [86400]); // Increase time by 1 day
        await ethers.provider.send("evm_mine"); // Mine a new block
        await mine(Number(await governor.votingPeriod()) + 100);

        // expect proposal state to be succeeded
        let proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(4);

        // Queue proposal
        await expect(await governor.queue(proposalId)).to.emit(governor, "ProposalQueued");

        // expect proposal state to be queued
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(5);

        // Execute proposal
        await expect(governor.execute(proposalId)).to.be.reverted;

        // Simulate time delay required before execution
        // Replace 'executionDelay' with your contract's specific delay
        await mine(86400 + 1);

        // Execute proposal
        await expect(governor.execute(proposalId)).to.emit(governor, "ProposalExecuted");

        // expect proposal state to be executed
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(7);

        // Check if admin's balance has increased
        const balance = await token.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(11000n);
    });

    it("should allow early queue before voting period started", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cast before voting delay and fails
        await expect(governor.castVote(proposalId, 1)).to.be.reverted;

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        //try to queue before is executable and fails

        // Queue proposal
        await expect(governor.queue(proposalId)).to.be.reverted;

        // Vote
        await expect(governor.castVote(proposalId, 1n)).to.emit(governor, "VoteCast");

        // Queue proposal
        await expect(governor.queue(proposalId)).to.emit(governor, "ProposalQueued");
    })

    it("should cancel the proposal before vote start", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cancel it
        await expect(governor.cancel(proposalId)).to.emit(governor, "ProposalCanceled");

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(2);
    });

    it("should not cancel the proposal after vote starts", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        // try to cancel it
        await expect(governor.cancel(proposalId)).to.be.reverted;

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(1);
    });

    it("should be able to see proposal defeated", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]


        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        // Vote
        await expect(governor.castVote(proposalId, 0)).to.emit(governor, "VoteCast");

        // Wait for voting period to end
        // await ethers.provider.send("evm_increaseTime", [86400]); // Increase time by 1 day
        // await ethers.provider.send("evm_mine"); // Mine a new block
        await mine(Number(await governor.votingPeriod()) + 100);

        // expect state to be deafeated
        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(3);
    });

    it("should be able to veto the governorNFT with governor", async function () {
        const { token, governor, signers, timelock, nft,governorNFT } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);
        await nft.safeMint(signers.admin, "a");

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        const balanceOneNFT = await nft.balanceOf(signers.admin.address);
        expect(balanceOneNFT).to.be.equal(1n);

        // delegate
        await token.delegate(signers.admin.address);
        await nft.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        await expect(nft.grantRole(await nft.MINTER_ROLE(), await timelock.getAddress())).to.emit(nft, "RoleGranted");

        // Propose
        // do not change anything at this proposal because the SALT methods will fail and we won't be able to expect for the value without confirming it with console.logs at the contract level.
        const proposalTx = await governorNFT.propose(
            [await nft.getAddress()], // targets 
            [0n], // value
            [token.interface.encodeFunctionData("mint", [signers.notAuthorized.address, amountToMint])],
            "Proposal to mint 1 NFT for admin"// description
        );

        expect(proposalTx).to.emit(governorNFT, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // get Last block
        const createBlock = await ethers.provider.getBlock("latest");

        // console.log("proposalId", receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // console.log("eventLogs", eventLogs);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");
        // console.log("event", event);

        const logDescription = governorNFT.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // console.log("logDescription", logDescription);

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]
        // const proposalIdString = BigInt(proposalId).toString()

        // check proposal state
        let proposalState = await governorNFT.state(proposalId);
        expect(proposalState).to.be.equal(0);



        const details = await governorNFT.proposalDetails(proposalId);
        // keep for educational purpose.
        // console.log("details",{
        //     targets: details[0],
        //     values: details[1],
        //     calldatas: details[2],
        //     descriptionHash: details[3],
        // })
        /*
            details {
                targets: Result(1) [ '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' ],
                values: Result(1) [ 0n ],
                calldatas: Result(1) [
                    '0x40c10f1900000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000002710'
                ],
                descriptionHash: '0xcb25548cdf916d223de19fc110d28ff793bc1a3eb1835d9a706165531065a56c'
            }
        */

        // deconstruct from Result to array to use it bellow.
        const targets: string[] = [];
        const values: bigint[] = [];
        const payloads: string[] = [];

        details[0].forEach((target: string) => {
            targets.push(target);
        });
        details[2].forEach((payload: string) => {
            payloads.push(payload);
        });
        details[1].forEach((value: bigint) => {
            values.push(value);
        });

        const timelockSaltValue = timelockSalt(await governorNFT.getAddress(), details[3]);
        expect(timelockSaltValue).to.be.equal("0x1741f5cc75aff5333d48210b5ebad061bcb0ecf7b1835d9a706165531065a56c");

        const timelockIdHash = await timelock.hashOperationBatch(
            targets,
            values,
            payloads,
            ethers.ZeroHash,
            timelockSaltValue
        );
        // if you change the proposal at governorNFT you will need generate the Hash with console log to discover it before equaling it here.
        expect(timelockIdHash).to.be.equal("0x76ef25f8246162b59cd53f28bbb303194c85b644bd955871ce9e145012f36bac");

        // Can you console log the proposal state?
        // convert bigint to bytes32 like

        // governor will create proposal to veto the proposalId
        // this targets timelock to cancel the proposal
        const vetoTx = await governor.propose(
            [await timelock.getAddress()], // targets 
            [0n], // value
            [timelock.interface.encodeFunctionData("cancel", [timelockIdHash])],
            "Proposal to veto the proposalId"// description
        );

        expect(vetoTx).to.emit(governor, "ProposalCreated");
        
        // Wait for the transaction to be mined
        // Wait for the transaction to be mined
        const receiptVeto = await vetoTx.wait(1);

        // console.log("proposalId", receipt?.logs);

        const eventLogsVeto: EventLog[] = (receiptVeto?.logs ?? []).filter((log): log is EventLog => true);

        // console.log("eventLogs", eventLogs);

        // Find the ProposalCreated event in the transaction receipt
        const eventVeto = eventLogsVeto.find((log) => log.fragment.name === "ProposalCreated");
        // console.log("event", event);

        const logDescriptionVeto = governorNFT.interface.parseLog({
            topics: eventVeto?.topics ? [...eventVeto.topics] : [],
            data: eventVeto?.data ?? "",
        });

        // console.log("logDescription", logDescription);

        // Get the proposalId from the event arguments
        const proposalIdToVeto = logDescriptionVeto?.args["proposalId"]

        // get Last block
        const vetoCreatedBlock = await ethers.provider.getBlock("latest");
        
        // Wait Voting Delay
        const numberOfBlocks = Number(await governor.votingDelay()) + 100;
        await mine(numberOfBlocks);

        // Vote
        await expect(governor.castVote(proposalIdToVeto, 1)).to.emit(governor, "VoteCast");

        const afterVotingDelay =  await ethers.provider.getBlock("latest");

        // Wait Voting Delay
        const numberOfBlocks2 = Number(await governorNFT.votingDelay()) - (
            (afterVotingDelay?.number ?? 0) - (createBlock?.number ?? 0)
        )
        await mine(numberOfBlocks2 + 1);

        const currentBlock =  await ethers.provider.getBlock("latest");

        // check optimistic governor proposal proposal state
        proposalState = await governorNFT.state(proposalId);

        //proposal at governor NFT should be ACTIVE
        expect(proposalState).to.be.equal(1);


        await expect(governorNFT.castVote(proposalId, 1)).to.emit(governorNFT, "VoteCast");

        const votingPeriodWait = Number(await governor.votingPeriod()) 
        const numberOfBlocks3 = votingPeriodWait - (
            (currentBlock?.number ?? 0) - (afterVotingDelay?.number ?? 0)
        )

        // Queue and Execute
        await mine(numberOfBlocks3 + 10);

        // check optimistic governor proposal proposal state
        proposalState = await governorNFT.state(proposalId);

        //proposal at governor NFT should be SUCEEDED
        expect(proposalState).to.be.equal(4);

        await expect(governor.queue(proposalIdToVeto)).to.emit(governor, "ProposalQueued");
        const queuedBlock = await ethers.provider.getBlock("latest");

        proposalState = await governorNFT.state(proposalId);
        // check optimistic governor proposal proposal state

        expect(proposalState).to.satisfy(num => num === 3n || num === 4n);
        // have to equal to defeated or succeded
        
        // queue porosalId
        await expect(governorNFT.queue(proposalId)).to.emit(governorNFT, "ProposalQueued");

        // check if previous proposal is cancelled
        expect( await governorNFT.state(proposalId) ).to.be.equal(5);
        await mine(100);

        expect( await timelock.getOperationState(timelockIdHash) ).to.be.equal(1);
        expect( await timelock.isOperation(timelockIdHash) ).to.be.equal(true);


        // mine
        const timelockDelay = Number(await timelock.getMinDelay()) - (Number((await ethers.provider.getBlock("latest"))?.number) - Number(queuedBlock?.number)  )
        await mine(timelockDelay + 1);

        // here it is complaining that the state is 3 Defeated
        await expect(governor.execute(proposalIdToVeto)).to.emit(governor, "ProposalExecuted");
        // check if previous proposal is cancelled
        expect( await timelock.getOperationState(timelockIdHash) ).to.be.equal(0);

    })

}

export async function shouldBehaveLikeGovernorWithTimestamp(): Promise<void> {
    it("should receive answer from CLOCK_MODE", async function () {
        const { governor, _, } = this;

        const clock_mode = await governor.CLOCK_MODE();

        expect(clock_mode).to.be.equal("mode=timestamp");
    });

    it("clock should return the current block number", async function () {
        const { governor, _, } = this;

        const clock = await governor.clock();
        // const pTime = await ethers.provider.getBlock("latest");
        const pBlock = await ethers.provider.getBlock("latest");

        expect(clock).to.be.equal(pBlock?.timestamp);
    });

    it("should mint 10000 tokens", async function () {
        const { token, signers, t } = this;

        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balance = await token.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(amountToMint);
    });

    it("should work the full proposal lifecycle up to executed", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cast before voting delay and fails
        await expect(governor.castVote(proposalId, 1)).to.be.reverted;

        const votingDelay = Number(await governor.votingDelay()) + 100;
        await hre.network.provider.send("evm_increaseTime", [votingDelay]);
        await hre.network.provider.send("evm_mine");

        // Queue proposal
        await expect(governor.queue(proposalId)).to.be.reverted;

        // Vote
        await expect(governor.castVote(proposalId, 1n)).to.emit(governor, "VoteCast");

        // Wait for voting period to end
        const votingPeriod = Number(await governor.votingPeriod()) + 100;
        await hre.network.provider.send("evm_increaseTime", [votingPeriod]);
        await hre.network.provider.send("evm_mine");


        // expect proposal state to be succeeded
        let proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(4);

        // Queue proposal
        await expect(governor.queue(proposalId)).to.emit(governor, "ProposalQueued");

        // expect proposal state to be queued
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(5);

        // Execute proposal
        await expect(governor.execute(proposalId)).to.be.reverted;

        // Simulate time delay required before execution
        // Replace 'executionDelay' with your contract's specific delay
        const executionDelay = Number(await timelock.getMinDelay() + 1n);
        await hre.network.provider.send("evm_increaseTime", [executionDelay]);
        await hre.network.provider.send("evm_mine");

        // Execute proposal
        await expect(governor.execute(proposalId)).to.emit(governor, "ProposalExecuted");

        // expect proposal state to be executed
        proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(7);

        // Check if admin's balance has increased
        const balance = await token.balanceOf(signers.admin.address);
        expect(balance).to.be.equal(11000n);
    });

    it("should allow early queue before voting period started", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cast before voting delay and fails
        await expect(governor.castVote(proposalId, 1)).to.be.reverted;

        const votingDelay = Number(await governor.votingDelay()) + 100;
        await hre.network.provider.send("evm_increaseTime", [votingDelay]);
        await hre.network.provider.send("evm_mine");

        // Queue proposal
        await expect(governor.queue(proposalId)).to.be.reverted;

        // Vote
        await expect(governor.castVote(proposalId, 1n)).to.emit(governor, "VoteCast");

        // Queue proposal
        await expect(governor.queue(proposalId)).to.emit(governor, "ProposalQueued");

    });

    it("should cancel the proposal before vote start", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        // try to cancel it
        await expect(governor.cancel(proposalId)).to.emit(governor, "ProposalCanceled");

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(2);
    });

    it("should not cancel the proposal after vote starts", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        const votingDelay = Number(await governor.votingDelay() + 100n);
        await hre.network.provider.send("evm_increaseTime", [votingDelay]);
        await hre.network.provider.send("evm_mine");

        // try to cancel it
        await expect(governor.cancel(proposalId)).to.be.reverted;

        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(1);
    });

    it("should be able to see proposal defeated", async function () {
        const { token, governor, signers, timelock } = this;

        // initial mint
        const amountToMint = 10000n;
        await token.mint(signers.admin, amountToMint);

        const balanceOne = await token.balanceOf(signers.admin.address);
        expect(balanceOne).to.be.equal(amountToMint);

        // delegate
        await token.delegate(signers.admin.address);

        await expect(token.grantRole(await token.MINTER_ROLE(), await timelock.getAddress())).to.emit(token, "RoleGranted");
        // expect(await token.grantRole(await token.MINTER_ROLE(), await governor.getAddress())).to.emit(token, "RoleGranted");

        const calldata = token.interface.encodeFunctionData("mint", [signers.admin.address, 1000n]);

        // Propose
        const proposalTx = await governor.propose(
            [await token.getAddress()], // targets 
            [0n], // value
            [calldata],
            "Proposal to mint 1000 tokens for admin"// description
        );

        expect(proposalTx).to.emit(governor, "ProposalCreated");

        // Wait for the transaction to be mined
        const receipt = await proposalTx.wait(1);

        // console.log("proposalId",receipt?.logs);

        const eventLogs: EventLog[] = (receipt?.logs ?? []).filter((log): log is EventLog => true);

        // Find the ProposalCreated event in the transaction receipt
        const event = eventLogs.find((log) => log.fragment.name === "ProposalCreated");

        const logDescription = governor.interface.parseLog({
            topics: event?.topics ? [...event.topics] : [],
            data: event?.data ?? "",
        });

        // Get the proposalId from the event arguments
        const proposalId = logDescription?.args["proposalId"]

        const votingDelay = Number(await governor.votingDelay() + 100n);
        await hre.network.provider.send("evm_increaseTime", [votingDelay]);
        await hre.network.provider.send("evm_mine");

        // Vote
        await expect(governor.castVote(proposalId, 0)).to.emit(governor, "VoteCast");

        // Wait for voting period to end
        const votingPeriod = Number(await governor.votingPeriod() + 100n);
        await hre.network.provider.send("evm_increaseTime", [votingPeriod]);
        await hre.network.provider.send("evm_mine");

        // expect state to be deafeated
        const proposalState = await governor.state(proposalId);
        expect(proposalState).to.be.equal(3);
    });
}