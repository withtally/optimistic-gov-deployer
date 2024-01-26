import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "../deploy.config";
import { getExpectedContractAddress } from '../helpers/expected_contract';
import fs from "fs";

/**
 * @description Deploys the Governor, Timelock, and Token contracts. It will output a contracts.out file so you can verify everything after deployment.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	console.log("\x1B[37mDeploying Optimistic Governance contracts");

	// DEPLOY
	const { deploy } = hre.deployments;

	const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	const minter = deployer;
	// HARDHAT LOG
	console.log(
		`network:\x1B[36m${hre.network.name}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// Load values for constructor from a ts file deploy.config.ts
	// If you change the order of the instantly invoked functions with deployers inside, you also have to change the numbers here in the expectedContractAddress
	const token_address = await getExpectedContractAddress(deployerSigner, 0);
	const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
	const governance_address = await getExpectedContractAddress(deployerSigner, 2);
	const nft_address = await getExpectedContractAddress(deployerSigner, 3);
	const vetoer_address = await getExpectedContractAddress(deployerSigner, 4);

	const admin_address = governance_address;

	console.log("Future contract addresses");
	console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m");
	console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m");
	console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m");
	console.log("NFT contract address:\x1B[33m", nft_address, "\x1B[37m");
	console.log("Vetoer contract address:\x1B[33m", vetoer_address, "\x1B[37m\n");

	console.log("ClockMode will use ", config.clockMode ? "timestamp" : "block number", " as the time unit\n");

	//// deploy token
	await (async function deployToken() {

		// TOKEN CONTRACT
		// INFO LOGS
		console.log("VETOER TOKEN ARGS");
		console.log("token name:\x1B[36m", config.token.name, "\x1B[37m");
		console.log("token symbol:\x1B[36m", config.token.symbol, "\x1B[37m");
		console.log("default admin:\x1B[33m", minter, "\x1B[37m");
		console.log("pauser:\x1B[33m", minter, "\x1B[37m");
		console.log("minter:\x1B[33m", minter, "\x1B[37m\n");



		let token: DeployResult;
		const args = [
			config.token.name,
			config.token.symbol,
			// Admin Address is pointing to the governance contract
			minter,
			minter,
			// If the minter is neither the deployer nor an EOA, no one will be able to mint,
			// after all you can only propose and vote while having tokens, 
			// so no one would be able to execute or propose anything in this governance.
			minter,
		]
		/*  
			string memory _name,
			string memory _symbol,
			address defaultAdmin,
			address pauser,
			address minter
		*/
		token = await deploy(
			config.clockMode ? "ERC20TokenClock" : "ERC20Token", {
			from: deployer,
			args: args,
			log: true,
		});


		const tdBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nToken contract: `, token.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${token_address} "${config.token.name}" "${config.token.symbol}" ${minter} ${minter} ${minter}`
		console.log("\n" + verify_str + "\n");

		// save it to a file to make sure the user doesn't lose it.
		fs.appendFileSync(
			"contracts.out",
			`${new Date()}\nToken contract deployed at: ${await token.address}` +
			` - ${hre.network.name} - block number: ${tdBlock?.number}\n${verify_str}\n\n`
		);
	})();

	//// deploy timelock
	await (async function deployTimelock() {

		const executors = [admin_address, timelock_address, vetoer_address];
		const proposers = [admin_address, timelock_address, vetoer_address];
		// TIMELOCK CONTRACT
		// INFO LOGS
		console.log("TIMELOCK ARGS");
		console.log("timelock min delay:\x1B[36m", config.timelock.minDelay, "\x1B[37m");
		console.log("executors:\x1B[33m", JSON.stringify(executors), "\x1B[37m");
		console.log("proposers:\x1B[33m", JSON.stringify(proposers), "\x1B[37m");
		console.log("admin:\x1B[33m", timelock_address, "\x1B[37m\n");

		/*  
			uint256 minDelay,
			address[] memory proposers,
			address[] memory executors,
			address admin
		*/
		const timelock = await deploy("TimelockController", {
			from: deployer,
			contract: "contracts/TimelockController.sol:TimelockController",
			args: [
				config.timelock.minDelay,
				// Admin Address is pointing to the governance contract
				proposers,
				executors,
				timelock_address,
			],
			log: true,
		});

		const timelockBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nTimelock contract: `, timelock.address);

		fs.appendFileSync(
			`arguments_${timelock.address}.js`,
			`module.exports = [` +
			`${config.timelock.minDelay},` +
			`${JSON.stringify(proposers)},` +
			`${JSON.stringify(executors)},` +
			`${timelock_address}` +
			`];`
		);

		// verify cli command
		const verify_str_timelock = `npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`--contract "contracts/TimelockController.sol:TimelockController" ` +
			`--constructor-args arguments_${timelock.address}.js ` +
			`${timelock.address}\n`;
		console.log("\n" + verify_str_timelock);

		// Save it to a file to make sure the user doesn't lose it.
		fs.appendFileSync(
			"contracts.out",
			`${new Date()}\nTimelock contract deployed at: ${await timelock.address
			}` +
			` - ${hre.network.name} - block number: ${timelockBlock?.number}\n${verify_str_timelock}\n\n`
		);
	})();

	//// deploy vetor governor
	await (async function deployVetoer() {

		// GOVERNOR CONTRACT
		// INFO LOGS
		console.log("VETOER GOVERNOR ARGS");
		console.log("name:\x1B[36m", config.vetoGovernor.name, "\x1B[37m");
		console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
		console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m")
		console.log("voting delay:\x1B[36m", config.vetoGovernor.votingDelay, "\x1B[37m");
		console.log("voting period:\x1B[36m", config.vetoGovernor.votingPeriod, "\x1B[37m");
		console.log("proposal threshold period:\x1B[36m", config.vetoGovernor.proposalThreshold, "\x1B[37m");
		console.log("quorum numerator:\x1B[36m", config.vetoGovernor.quorumNumerator, "\x1B[37m");
		console.log("super quorum threshold:\x1B[36m", config.vetoGovernor.superQuorumThreshold, "\x1B[37m");
		console.log("vote extension:\x1B[36m", config.vetoGovernor.voteExtension, "\x1B[37m\n");


		/*  
			string memory _name,
			IVotes _token,
			TimelockController _timelock,
			uint48 _initialVotingDelay,
			uint32 _initialVotingPeriod,
			uint256 _initialProposalThreshold,
			uint256 _quorumNumeratorValue,
			uint256 _superQuorumThreshold,     
			uint48 _initialVoteExtension
		*/
		let governor: DeployResult;
		const args = [
			config.vetoGovernor.name,
			token_address,
			timelock_address,
			config.vetoGovernor.votingDelay,
			config.vetoGovernor.votingPeriod,
			config.vetoGovernor.proposalThreshold,
			config.vetoGovernor.quorumNumerator,
			config.vetoGovernor.superQuorumThreshold,
			config.vetoGovernor.voteExtension
		]
		const gasLimit = 5000000; // Example gas limit, adjust as needed
		governor = await deploy(config.clockMode ?  "OzGovernorSuperQuorumClock": "OzGovernorSuperQuorum", {
			from: deployer,
			args: args,
			log: false,
			gasLimit: gasLimit, // Adding the gasLimit here
		});

		const govBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nVETOER Governor contract: `, governor.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${await governor.address} "${config.vetoGovernor.name}" ${token_address} ${timelock_address} ${config.vetoGovernor.votingDelay} ${config.vetoGovernor.votingPeriod} ${config.vetoGovernor.proposalThreshold} ${config.vetoGovernor.quorumNumerator} ${config.vetoGovernor.superQuorumThreshold} ${config.vetoGovernor.voteExtension}`
		console.log("\n" + verify_str + "\n");


		// save it to a file to make sure the user doesn't lose it.
		fs.appendFileSync(
			"contracts.out",
			`${new Date()}\nToken contract deployed at: ${governor.address}` +
			` - ${hre.network.name} - block number: ${govBlock?.number}\n${verify_str}\n\n`
		);
	})();

	//// deploy nft
	await (async function deployNFT() {
		const minterNFT = deployer

		// NFT CONTRACT
		// INFO LOGS
		console.log("NFT ARGS");
		console.log("token name:\x1B[36m", config.nft.name, "\x1B[37m");
		console.log("token symbol:\x1B[36m", config.nft.symbol, "\x1B[37m");
		console.log("default admin:\x1B[33m", admin_address, "\x1B[37m");
		console.log("pauser:\x1B[33m", admin_address, "\x1B[37m");
		console.log("minter:\x1B[33m", minterNFT, "\x1B[37m\n");


		let nft: DeployResult;
		const args = [
			config.nft.name,
			config.nft.symbol,
			config.nft.baseTokenURI,
			// Admin Address is pointing to the governance contract
			minterNFT,
			minterNFT,
			// if minter is not deployer no one will be able to mint, 
			// After all, you can only propose and vote while having tokens, 
			// so no one would be able to execute or propose anything in this governance system.
			minterNFT,
		]
		/*  
			string memory _name,
			string memory _symbol,
			address defaultAdmin,
			address pauser,
			address minter
		*/
		nft = await deploy(
			config.clockMode ? "ERC721TokenClock" : "ERC721Token", {
			from: deployer,
			args: args,
			log: true,
		});


		const nftBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nNFT contract: `, nft.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${nft_address} "${config.nft.name}" "${config.nft.symbol}" ${admin_address} ${admin_address} ${minterNFT}`
		console.log("\n" + verify_str + "\n");

		// save it to a file to make sure the user doesn't lose it.
		fs.appendFileSync(
			"contracts.out",
			`${new Date()}\nToken contract deployed at: ${await nft.address}` +
			` - ${hre.network.name} - block number: ${nftBlock?.number}\n${verify_str}\n\n`
		);
	})();

	//// deploy nft governor
	await (async function deployNFTGovernor() {

		// GOVERNOR CONTRACT
		// INFO LOGS
		console.log("NFT GOVERNOR ARGS");
		console.log("name:\x1B[36m", config.governor.name, "\x1B[37m");
		console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
		console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m")
		console.log("voting delay:\x1B[36m", config.governor.votingDelay, "\x1B[37m");
		console.log("voting period:\x1B[36m", config.governor.votingPeriod, "\x1B[37m");
		console.log("proposal threshold period:\x1B[36m", config.governor.proposalThreshold, "\x1B[37m");
		console.log("quorum numerator:\x1B[36m", config.governor.quorumNumerator, "\x1B[37m");
		console.log("super quorum threshold:\x1B[36m", config.governor.superQuorumThreshold, "\x1B[37m");
		console.log("vote extension:\x1B[36m", config.governor.voteExtension, "\x1B[37m\n");

		/*  
			string memory _name,
			IVotes _token,
			TimelockController _timelock,
			uint48 _initialVotingDelay,
			uint32 _initialVotingPeriod,
			uint256 _initialProposalThreshold,
			uint256 _quorumNumeratorValue,
			uint48 _superQuorumThreshold,
			uint48 _initialVoteExtension
		*/
		let governor: DeployResult;
		const args = [
			config.governor.name,
			nft_address,
			timelock_address,
			config.governor.votingDelay,
			config.governor.votingPeriod,
			config.governor.proposalThreshold,
			config.governor.quorumNumerator,
			config.governor.superQuorumThreshold,
			config.governor.voteExtension

		]
		governor = await deploy(
			config.clockMode ? "OzGovernorSuperQuorumClock": "OzGovernorSuperQuorum", {
			from: deployer,
			args: args,
			log: true,
		});

		const govBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nVETOER Governor contract: `, governor.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${await governor.address} "${config.governor.name}" ${nft_address} ${timelock_address} ${config.governor.votingDelay} ${config.governor.votingPeriod} ${config.governor.proposalThreshold} ${config.governor.quorumNumerator} ${config.vetoGovernor.superQuorumThreshold} ${config.governor.voteExtension}`
		console.log("\n" + verify_str + "\n");


		// save it to a file to make sure the user doesn't lose it.
		fs.appendFileSync(
			"contracts.out",
			`${new Date()}\nToken contract deployed at: ${governor.address}` +
			` - ${hre.network.name} - block number: ${govBlock?.number}\n${verify_str}\n\n`
		);
	})();

	//// ending line on contracts.out
	fs.appendFileSync(
		"contracts.out",
		"\n\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\" +
		"\n\n"
	);

};

func.id = "deploy_governor_optimistic"; // id required to prevent re-execution
func.tags = ["ERC20", "ERC721", "GOVERNOR", "TIMELOCK", "VETOER"];

export default func;