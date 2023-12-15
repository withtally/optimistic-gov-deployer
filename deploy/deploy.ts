import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "../deploy.config"
import { getExpectedContractAddress } from '../helpers/expected_contract';
import fs from "fs";

/**
 * @description Deploys the Governor, Timelock and Token contracts, it will output a contracts.out file you can verify everything after deployment.
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	console.log("\x1B[37mDeploying Optismitic Governance contracts");

	// DEPLOY
	const { deploy } = hre.deployments;

	// const signer = await hre.ethers.getSigner()
	const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	const minter = deployer
	// HARDHAT LOG
	console.log(
		`network:\x1B[36m${hre.network.name}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// Load values for constructor from a ts file deploy.config.ts
	// if you change the order of the instant invoked functions with deployers inside, you also have to change the numbers here in the expectedCotnractAddress
	const token_address = await getExpectedContractAddress(deployerSigner, 0);
	const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
	const governance_address = await getExpectedContractAddress(deployerSigner, 2);
	const nft_address = await getExpectedContractAddress(deployerSigner, 3);
	const vetoer_address = await getExpectedContractAddress(deployerSigner, 4);

	const admin_address = governance_address;

	console.log("Future contract addresses")
	console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
	console.log("Governance contract address:\x1B[33m", governance_address, "\x1B[37m")
	console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m")
	console.log("NFT contract address:\x1B[33m", nft_address, "\x1B[37m")
	console.log("Vetoer contract address:\x1B[33m", vetoer_address, "\x1B[37m\n")

	console.log("ClockMode will use ", config.clockMode ? "timestamp" : "block number", " as time unit\n")

	//// deploy token
	await (async function deployToken() {

		// TOKEN CONTRACT
		// INFO LOGS
		console.log("VETOR TOKEN ARGS");
		console.log("token name:\x1B[36m", config.token.name, "\x1B[37m");
		console.log("token symbol:\x1B[36m", config.token.symbol, "\x1B[37m");
		console.log("default admin:\x1B[33m", admin_address, "\x1B[37m");
		console.log("pauser:\x1B[33m", admin_address, "\x1B[37m");
		console.log("minter:\x1B[33m", minter, "\x1B[37m\n");


		let token: DeployResult;
		const args = [
			config.token.name,
			config.token.symbol,
			// Admin adress is pointing to the governance contract
			admin_address,
			admin_address,
			// if minter is not deployer or an EOA no one will be able to mint, 
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
		token = await deploy("GovernorToken", {
			from: deployer,
			contract: config.clockMode ? "contracts/clock/GovernorToken.sol:GovernorToken" : "contracts/GovernorToken.sol:GovernorToken",
			args: args,
			log: true,
		});

		// const tdBlock = token.
		const tdBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nToken contract: `, token.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${token_address} "${config.token.name}" "${config.token.symbol}" ${admin_address} ${admin_address} ${minter}`
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
				// Admin adress is pointing to the governance contract
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
			`];`
		);

		// verify cli command
		const verify_str_timelock = `npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`--constructor-args arguments_${timelock.address}.js ` +
			`${timelock.address}\n`;
		console.log("\n" + verify_str_timelock);

		// save it to a file to make sure the user doesn't lose it.
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
		console.log("vote extension:\x1B[36m", config.vetoGovernor.voteExtension, "\x1B[37m\n");

		/*  
			string memory _name,
			IVotes _token,
			TimelockController _timelock,
			uint48 _initialVotingDelay,
			uint32 _initialVotingPeriod,
			uint256 _initialProposalThreshold,
			uint256 _quorumNumeratorValue,
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
			config.vetoGovernor.voteExtension,
		]

		governor = await deploy("VetoGovernor", {
			from: deployer,
			contract: config.clockMode ? "contracts/clock/VetoGovernor.sol:VetoGovernor" : "contracts/VetoGovernor.sol:VetoGovernor",
			args: args,
			log: true,
		});

		const govBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nVETOER Governor contract: `, governor.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${await governor.address} "${config.vetoGovernor.name}" ${token_address} ${timelock_address} ${config.vetoGovernor.votingDelay} ${config.vetoGovernor.votingPeriod} ${config.vetoGovernor.proposalThreshold} ${config.vetoGovernor.quorumNumerator} ${config.vetoGovernor.voteExtension}`
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
			// Admin adress is pointing to the governance contract
			admin_address,
			admin_address,
			// if minter is not deployer no one will be able to mint, 
			// after all you can only propose and vote while having tokens, 
			// so no one would be able to execute or propose anything in this governance.
			minterNFT,
		]
		/*  
			string memory _name,
			string memory _symbol,
			address defaultAdmin,
			address pauser,
			address minter
		*/
		nft = await deploy("GovernorNFT", {
			from: deployer,
			contract: config.clockMode ? "contracts/clock/GovernorNFT.sol:GovernorNFT" : "contracts/GovernorNFT.sol:GovernorNFT",
			args: args,
			log: true,
		});

		// const tdBlock = token.
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
		console.log("SUPER GOVERNOR ARGS");
		console.log("name:\x1B[36m", config.governor.name, "\x1B[37m");
		console.log("Token contract addresses:\x1B[33m", token_address, "\x1B[37m")
		console.log("Timelock contract address:\x1B[33m", timelock_address, "\x1B[37m")
		console.log("voting delay:\x1B[36m", config.governor.votingDelay, "\x1B[37m");
		console.log("voting period:\x1B[36m", config.governor.votingPeriod, "\x1B[37m");
		console.log("proposal threshold period:\x1B[36m", config.governor.proposalThreshold, "\x1B[37m");
		console.log("quorum numerator:\x1B[36m", config.governor.quorumNumerator, "\x1B[37m");
		console.log("vote extension:\x1B[36m", config.governor.voteExtension, "\x1B[37m\n");

		/*  
			string memory _name,
			IVotes _token,
			TimelockController _timelock,
			uint48 _initialVotingDelay,
			uint32 _initialVotingPeriod,
			uint256 _initialProposalThreshold,
			uint256 _quorumNumeratorValue,
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
			config.governor.voteExtension
		]
		governor = await deploy("OZGovernor", {
			from: deployer,
			contract: config.clockMode ? "contracts/clock/OZGovernor.sol:OZGovernor" : "contracts/OZGovernor.sol:OZGovernor",
			args: args,
			log: true,
		});

		const govBlock = await hre.ethers.provider.getBlock("latest");

		console.log(`\nVETOER Governor contract: `, governor.address);
		// verify cli
		let verify_str =
			`npx hardhat verify ` +
			`--network ${hre.network.name} ` +
			`${await governor.address} "${config.governor.name}" ${nft_address} ${timelock_address} ${config.governor.votingDelay} ${config.governor.votingPeriod} ${config.governor.proposalThreshold} ${config.governor.quorumNumerator} ${config.governor.voteExtension}`
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

func.id = "deploy_governor_optimistic"; // id required to prevent reexecution
func.tags = ["ERC20", "ERC721", "GOVERNOR", "TIMELOCK", "VETOER"];

export default func;
