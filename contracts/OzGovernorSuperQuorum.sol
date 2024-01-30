// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// tally super quorum extension:
import "@tallyxyz/super-quorum/contracts/SuperQuorumGovernor.sol";

/**
 * @title OzGovernorSuperQuorum
 * @dev OzGovernorSuperQuorum is a smart contract that extends OpenZeppelin's Governor with additional features
 * for voting, timelock, and quorum.
 */
contract OzGovernorSuperQuorum is SuperQuorumGovernor {
    /**
     * @dev Initializes the OZGovernor contract.
     * @param _name The name of the governor.
     * @param _token The voting token.
     * @param _timelock The timelock controller.
     * @param _initialVotingDelay, 7200, 1 day
     * @param _initialVotingPeriod, 50400, 1 week 
     * @param _initialProposalThreshold, 0, proposal threshold
     * @param _quorumNumeratorValue, 4, numerator value for quorum
     * @param _superQuorumThreshold, minimum number of votes required for super quorum,
     * @param _initialVoteExtension,
     */
    constructor(
        string memory _name, IVotes _token, TimelockController _timelock,
        uint48 _initialVotingDelay, uint32 _initialVotingPeriod, uint256 _initialProposalThreshold,
        uint256 _quorumNumeratorValue,   
        uint32 _superQuorumThreshold,     
        uint48 _initialVoteExtension
    )
    SuperQuorumGovernor(
        _name, _token, _timelock,
        _initialVotingDelay, _initialVotingPeriod, _initialProposalThreshold,
        _quorumNumeratorValue, _superQuorumThreshold, _initialVoteExtension
    ){}
}
