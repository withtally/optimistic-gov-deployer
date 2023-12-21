
import { ethers } from "hardhat";
import { expect } from "chai";
import {
    EventLog,
} from "ethers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import hre from "hardhat";


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
        console.log("createdBlock",createBlock?.number);

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

        // check proposal state
        let proposalState = await governorNFT.state(proposalId);
        expect(proposalState).to.be.equal(0);

        // governor will create proposal to veto the proposalId
        // this targets timelock to cancel the proposal
        const vetoTx = await governor.propose(
            [await governor.getAddress()], // targets 
            [0n], // value
            [timelock.interface.encodeFunctionData("cancel", [ethers.encodeBytes32String(proposalId)])],
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

        // Queue and Execute
        await mine(Number(await governor.votingPeriod()) + 10);

        // check optimistic governor proposal proposal state
        proposalState = await governorNFT.state(proposalId);

        //proposal at governor NFT should be ACTIVE
        expect(proposalState).to.be.equal(1);

        await expect(governor.queue(proposalIdToVeto)).to.emit(governor, "ProposalQueued");
        await mine( Number(await timelock.getMinDelay()) + 1);

        proposalState = await governorNFT.state(proposalId);
        // check optimistic governor proposal proposal state

        // get Last block
        const lastBlock = await ethers.provider.getBlock("latest");
        console.log("logging block sitatuion",{
            "created proposal block": createBlock?.number,
            "block proposed veto": vetoCreatedBlock?.number,
            "timelock Delay": await timelock.getMinDelay(),
            "last block":lastBlock?.number,
            "block + delays + periods": Number(createBlock?.number) + Number(await governorNFT.votingDelay()) + Number(await governorNFT.votingPeriod())
        });

        expect(proposalState).to.satisfy(num => num === 3n || num === 4n);
        // have to equal to defeated or succeded
        
        // check if previous proposal is cancelled

        console.log("HERE1", await governorNFT.state(proposalId))

        // here it is complaining that the state is 3 Defeated
        await expect(governor.execute(proposalIdToVeto)).to.emit(governor, "ProposalExecuted");

        console.log("HERE2")



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