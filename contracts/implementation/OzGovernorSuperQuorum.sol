// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// tally super quorum upgradeable:
import "@tallyxyz/super-quorum/contracts/SuperQuorumGovernorUpgradeable.sol";

/**
 * @title OzGovernorSuperQuorum
 * @dev OzGovernorSuperQuorum is a smart contract that extends OpenZeppelin's Governor with additional features
 * for voting, timelock, and quorum.
 */
contract OzGovernorSuperQuorumUpgradeable is SuperQuorumGovernorUpgradeable
{
    // TODO: Do I need to override initialize method here ?
}
