import { DeployFunction,DeployResult } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { config } from "../deploy.config"
import { getExpectedContractAddress } from '../helpers/expected_contract';
import fs from "fs";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	console.log("\x1B[37mDeploying Open Zepellin Governance contracts");

	// DEPLOY
	const { deploy } = hre.deployments;

	// const signer = await hre.ethers.getSigner()
	const [deployerSigner] = await hre.ethers.getSigners();
	const deployer = await deployerSigner.getAddress();

	// HARDHAT LOG
	console.log(
		`network:\x1B[36m${hre.network.name}\x1B[37m`,
		`\nsigner:\x1B[33m${deployer}\x1B[37m\n`
	);

	// Load values for constructor from a ts file deploy.config.ts
	const governance_address = await getExpectedContractAddress(deployerSigner, 2);
	const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
	const token_address = await getExpectedContractAddress(deployerSigner, 0);

	const admin_address = governance_address;
	

	console.log("Future contract addresses")
	console.log("Token contract addresses:\x1B[33m",token_address,"\x1B[37m")
	console.log("Governance contract address:\x1B[33m",governance_address,"\x1B[37m")
	console.log("Timelock contract address:\x1B[33m",timelock_address,"\x1B[37m\n")
	
	console.log("ClockMode will use ", config.clockMode ? "timestamp" : "block number", " as time unit\n")

	// TOKEN CONTRACT
	// INFO LOGS
	console.log("TOKEN ARGS");
	console.log("token name:\x1B[36m", config.token.name, "\x1B[37m");
	console.log("token symbol:\x1B[36m", config.token.symbol, "\x1B[37m");
	console.log("default admin:\x1B[33m", admin_address, "\x1B[37m");
	console.log("pauser:\x1B[33m", admin_address, "\x1B[37m");
	console.log("minter:\x1B[33m", admin_address, "\x1B[37m\n");
	

	let token:DeployResult;
		/*  
			string memory _name,
			string memory _symbol,
			address defaultAdmin,
			address pauser,
			address minter
		*/
	if( config.clockMode ){
		token = await deploy("GovernorToken", {
			from: deployer,
			contract: "contracts/clock/GovernorToken.sol:GovernorToken",
			args: [
				config.token.name,
				config.token.symbol,
				// Admin adress is pointing to the governance contract
				admin_address,
				admin_address,
				// if minter is not deployer no one will be able to mint, 
				// after all you can only propose and vote while having tokens, 
				// so no one would be able to execute or propose anything in this governance.
				deployer,
			],
			log: true,
		});
	} else {
		token = await deploy("GovernorToken", {
			from: deployer,
			contract: "contracts/GovernorToken.sol:GovernorToken",
			args: [
				config.token.name,
				config.token.symbol,
				// Admin adress is pointing to the governance contract
				admin_address,
				admin_address,
				// if minter is not deployer no one will be able to mint, 
				// after all you can only propose and vote while having tokens, 
				// so no one would be able to execute or propose anything in this governance.
				deployer,
			],
			log: true,
		});
	}


	// const tdBlock = token.
	const tdBlock = await hre.ethers.provider.getBlock("latest");

	console.log(`\nToken contract: `, token.address);
	// verify cli
	let verify_str =
		`npx hardhat verify ` +
		`--network ${hre.network.name} ` +
		`${token_address} "${config.token.name}" "${config.token.symbol}" ${admin_address} ${admin_address} ${admin_address}`
	console.log("\n" + verify_str+"\n");

	// save it to a file to make sure the user doesn't lose it.
	fs.appendFileSync(
		"contracts.out",
		`${new Date()}\nToken contract deployed at: ${await token.address}` +
		` - ${hre.network.name} - block number: ${tdBlock?.number}\n${verify_str}\n\n`
	);
	
	// TIMELOCK CONTRACT
	// INFO LOGS
	console.log("TIMELOCK ARGS");
	console.log("timelock min delay:\x1B[36m", config.timelock.minDelay, "\x1B[37m");
	console.log("executors:\x1B[33m", JSON.stringify([admin_address,timelock_address]), "\x1B[37m");
	console.log("proposers:\x1B[33m", JSON.stringify([admin_address,timelock_address]), "\x1B[37m");
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
			[admin_address,timelock_address],
			[admin_address,timelock_address],
			timelock_address,
		],
		log: true,
	});

	const timelockBlock = await hre.ethers.provider.getBlock("latest");

	console.log(`\nTimelock contract: `, timelock.address);

	const proposers = [timelock_address];
	const executors = [timelock_address];

	fs.appendFileSync(
		`arguments_${timelock.address}.js`,
		`module.exports = [`+
			`${config.timelock.minDelay},`+
			`${JSON.stringify(proposers)},`+
			`${JSON.stringify(executors)},`+
		`];`
	);

	// verify cli command
	const verify_str_timelock = `npx hardhat verify ` +
	`--network ${hre.network.name} ` +
	`--constructor-args arguments_${timelock.address}.js `+
	`${timelock.address}\n`;
	console.log("\n" + verify_str_timelock);

	// save it to a file to make sure the user doesn't lose it.
	fs.appendFileSync(
		"contracts.out",
		`${new Date()}\nTimelock contract deployed at: ${await timelock.address
		}` +
		` - ${hre.network.name} - block number: ${timelockBlock?.number}\n${verify_str_timelock}\n\n`
	);

	// GOVERNOR CONTRACT
	// INFO LOGS
	console.log("GOVERNOR ARGS");
	console.log("name:\x1B[36m", config.governor.name, "\x1B[37m");
	console.log("Token contract addresses:\x1B[33m",token_address,"\x1B[37m")
	console.log("Timelock contract address:\x1B[33m",timelock_address,"\x1B[37m")
	console.log("voting delay:\x1B[36m",  config.governor.votingDelay, "\x1B[37m");
	console.log("voting period:\x1B[36m", config.governor.votingPeriod,  "\x1B[37m");
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
	let governor:DeployResult;
	if( config.clockMode ){
		governor = await deploy("OZGovernor", {
			from: deployer,
			contract: "contracts/clock/OZGovernor.sol:OZGovernor",
			args: [
				config.governor.name,
				token.address,
				timelock.address,
				config.governor.votingDelay,
				config.governor.votingPeriod,
				config.governor.proposalThreshold,
				config.governor.quorumNumerator,
				config.governor.voteExtension,
			],
			log: true,
		});
	} else {
		governor = await deploy("OZGovernor", {
			from: deployer,
			contract: "contracts/OZGovernor.sol:OZGovernor",
			args: [
				config.governor.name,
				token.address,
				timelock.address,
				config.governor.votingDelay,
				config.governor.votingPeriod,
				config.governor.proposalThreshold,
				config.governor.quorumNumerator,
				config.governor.voteExtension,
			],
			log: true,
		});
	}

	const govBlock = await hre.ethers.provider.getBlock("latest");

	console.log(`\nGovernor contract: `, governor.address);
	// verify cli
	verify_str =
		`npx hardhat verify ` +
		`--network ${hre.network.name} ` +
		`${await governor.address} "${config.governor.name}" ${token.address} ${timelock.address} ${config.governor.votingDelay} ${config.governor.votingPeriod} ${config.governor.proposalThreshold} ${config.governor.quorumNumerator}`
	console.log("\n" + verify_str+"\n");


	// save it to a file to make sure the user doesn't lose it.
	fs.appendFileSync(
		"contracts.out",
		`${new Date()}\nToken contract deployed at: ${governor.address}` +
		` - ${hre.network.name} - block number: ${govBlock?.number}\n${verify_str}\n\n`
	);

	// ending line
	fs.appendFileSync(
		"contracts.out",
		"\n\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"+
		"\n\n"
	);

};

func.id = "deploy_governor_token"; // id required to prevent reexecution
func.tags = ["ERC20"];

export default func;
