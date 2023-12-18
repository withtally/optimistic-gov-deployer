export const config:any = {
  // Configuration for the deployment
  // Change the values for a more personalized deployment
  token: {
    name: "VETOERS TOKEN",
    symbol: "VT",
  },
  nft: {
    name: "Optimistic Yacht Club",
    symbol: "OYC",
  },
  // Timelock
  timelock: {
    minDelay: 86400, // 12 days
  },
  // Governor
  governor: {
    name: "OPTIMISTIC GROUP",
    // 7200 1 day, 
    votingDelay: 7200,
    // 50400 7 days( assuming a block is 12 seconds)
    votingPeriod: 50400,
    // Quorum numerator (percentage of total supply needed for quorum)
    quorumNumerator: 30,
    // Threshold for proposing (set to a non-zero value to prevent proposal spam)
    proposalThreshold: 0,
    // Vote extension duration in seconds
    voteExtension: 7200, // 7200 is 2 hours
    superQuorumThreshold: 50, // 50% of the total supply
  },
  // Veto Governor
  vetoGovernor: {
    name: "VETOERS DAO",
    // 1500 is  5 hours (assuming block is 12 second)
    votingDelay: 1500,
    // 7200 1 day, ( assuming a block is 12 seconds)
    votingPeriod: 7200,
    // Quorum numerator (percentage of total supply needed for quorum)
    quorumNumerator: 4,
    // Threshold for proposing (set to a non-zero value to prevent proposal spam)
    proposalThreshold: 0,
    // Vote extension duration in seconds
    voteExtension: 3000, // 3000 is 10 hours.
    superQuorumThreshold: 50, // 50% of the total supply
  },
  // Set clockMode to true for timestamp mode, false for block number mode
  clockMode: false,
}
