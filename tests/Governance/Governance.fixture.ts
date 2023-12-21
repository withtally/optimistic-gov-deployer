import { ethers } from "hardhat";
// import hardhat from "hardhat";

import { getExpectedContractAddress } from "../../helpers/expected_contract";
import { type OzGovernorSuperQuorum, type TimelockController, type ERC20Token, type ERC721Token } from "../../types";
import { config } from "../../deploy.config"
import { TimelockController__factory, ERC20Token__factory, OzGovernorSuperQuorum__factory, ERC721Token__factory } from "../../types/factories/contracts";

export async function deployGovernanceContractsFixture(): Promise<{
    token: ERC20Token;
    timelock: TimelockController;
    governor: OzGovernorSuperQuorum;
    nft: ERC721Token;
    governorNFT: OzGovernorSuperQuorum;
}> {
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];

    // Load values for constructor from a ts file deploy.config.ts
    const governance_address = await getExpectedContractAddress(deployerSigner, 2);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
    const token_address = await getExpectedContractAddress(deployerSigner, 0);
    const nft_address = await getExpectedContractAddress(deployerSigner, 3);
    const nft_governance_address = await getExpectedContractAddress(deployerSigner, 4);

    const admin_address = governance_address;

    // TOKEN CONTRACT
    const GovernorToken = (await ethers.getContractFactory("contracts/ERC20Token.sol:ERC20Token")) as ERC20Token__factory
    const token = await GovernorToken.connect(deployerSigner).deploy(
        config.token.name,
        config.token.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // TIMELOCK CONTRACT
    const TimelockController: TimelockController__factory = (await ethers.getContractFactory("contracts/TimelockController.sol:TimelockController")) as TimelockController__factory
    const timelock = await TimelockController.connect(deployerSigner).deploy(
        config.timelock.minDelay,
        [admin_address, timelock_address,nft_governance_address],
        [admin_address, timelock_address,nft_governance_address],
        timelock_address,
    );

    // VETO GOVERNOR CONTRACT
    const OzGovernorSuperQuorum = (await ethers.getContractFactory("contracts/OzGovernorSuperQuorum.sol:OzGovernorSuperQuorum")) as OzGovernorSuperQuorum__factory
    const governor = await OzGovernorSuperQuorum.connect(deployerSigner).deploy(
        config.vetoGovernor.name,
        token_address,
        timelock_address,
        config.vetoGovernor.votingDelay,
        config.vetoGovernor.votingPeriod,
        config.vetoGovernor.proposalThreshold,
        config.vetoGovernor.quorumNumerator,
        config.vetoGovernor.superQuorumThreshold,
        config.vetoGovernor.voteExtension,
    );

    // NFT CONTRACT
    const NFT = (await ethers.getContractFactory("contracts/ERC721Token.sol:ERC721Token")) as ERC721Token__factory
    const nft = await NFT.connect(deployerSigner).deploy(
        config.nft.name,
        config.nft.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // NFT GOVERNOR CONTRACT
    const OzGovernorSuperQuorum2 = (await ethers.getContractFactory("contracts/OzGovernorSuperQuorum.sol:OzGovernorSuperQuorum")) as OzGovernorSuperQuorum__factory
    const governorNFT = await OzGovernorSuperQuorum2.connect(deployerSigner).deploy(
        config.governor.name,
        token_address,
        timelock_address,
        config.governor.votingDelay,
        config.governor.votingPeriod,
        config.governor.proposalThreshold,
        config.governor.quorumNumerator,
        config.governor.superQuorumThreshold,
        config.governor.voteExtension,
    );

    return { token, timelock, governor, nft, governorNFT };
}

export async function deployGovernanceContractsClockTimestampFixture(): Promise<{
    token: ERC20Token;
    timelock: TimelockController;
    governor: OzGovernorSuperQuorum;
    nft: ERC721Token;
    governorNFT: OzGovernorSuperQuorum;
}> {
    const signers = await ethers.getSigners();
    const deployerSigner = signers[0];

    // Load values for constructor from a ts file deploy.config.ts
    const governance_address = await getExpectedContractAddress(deployerSigner, 2);
    const timelock_address = await getExpectedContractAddress(deployerSigner, 1);
    const token_address = await getExpectedContractAddress(deployerSigner, 0);
    const nft_governance_address = await getExpectedContractAddress(deployerSigner, 4);

    const admin_address = governance_address;

    // TOKEN CONTRACT
    const GovernorToken = (await ethers.getContractFactory("contracts/clock/ERC20Token.sol:ERC20Token")) as ERC20Token__factory
    const token = await GovernorToken.connect(deployerSigner).deploy(
        config.token.name,
        config.token.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // TIMELOCK CONTRACT
    const TimelockController: TimelockController__factory = (await ethers.getContractFactory("contracts/TimelockController.sol:TimelockController")) as TimelockController__factory
    const timelock = await TimelockController.connect(deployerSigner).deploy(
        config.timelock.minDelay,
        [admin_address, timelock_address,nft_governance_address],
        [admin_address, timelock_address,nft_governance_address],
        timelock_address,
    );

    // VETO GOVERNOR CONTRACT
    const OzGovernorSuperQuorum = (await ethers.getContractFactory("contracts/clock/OzGovernorSuperQuorum.sol:OzGovernorSuperQuorum")) as OzGovernorSuperQuorum__factory
    const governor = await OzGovernorSuperQuorum.connect(deployerSigner).deploy(
        config.vetoGovernor.name,
        token_address,
        timelock_address,
        config.vetoGovernor.votingDelay,
        config.vetoGovernor.votingPeriod,
        config.vetoGovernor.proposalThreshold,
        config.vetoGovernor.quorumNumerator,
        config.vetoGovernor.superQuorumThreshold,
        config.vetoGovernor.voteExtension,
    );

    // NFT CONTRACT
    const NFT = (await ethers.getContractFactory("contracts/clock/ERC721Token.sol:ERC721Token")) as ERC721Token__factory
    const nft = await NFT.connect(deployerSigner).deploy(
        config.nft.name,
        config.nft.symbol,
        deployerSigner.address,
        deployerSigner.address,
        deployerSigner.address,
    );

    // NFT GOVERNOR CONTRACT
    const OzGovernorSuperQuorum2 = (await ethers.getContractFactory("contracts/clock/OzGovernorSuperQuorum.sol:OzGovernorSuperQuorum")) as OzGovernorSuperQuorum__factory
    const governorNFT = await OzGovernorSuperQuorum2.connect(deployerSigner).deploy(
        config.governor.name,
        token_address,
        timelock_address,
        config.governor.votingDelay,
        config.governor.votingPeriod,
        config.governor.proposalThreshold,
        config.governor.quorumNumerator,
        config.governor.superQuorumThreshold,
        config.governor.voteExtension,
    );

    return { token, timelock, governor,nft,governorNFT };
}