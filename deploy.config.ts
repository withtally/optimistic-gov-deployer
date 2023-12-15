
export const config:any ={
  // Configuration for the deployment
  // Change the values for a more personalized deployment
  token:{
    name: "VETOERS TOKEN",
    symbol: "VT",
    // if empty the role of minter will be given to deployer address.
    minter: "",
  },
  nft:{
    name: "Optimistic Yacth Club",
    symbol: "OYC",
    // if empty the role of minter will be given to deployer address.
    minter: "",
  },
  // Timelock
  timelock:{
    minDelay: 86400, // 12 days
  },
  // Governor
  governor:{
    name: "OPTIMISTIC GROUP",
    // 7200 1 day
    votingDelay: 7200,
    // 50400 7 days
    votingPeriod: 50400,
    // numerator to denominator of 100
    quorumNumerator: 30,
    // threshold to be able to propose
    proposalThreshold: 0, // if you want to prevent proposal spam, you should set the threshold to value diff from zero.
    // vote extension, if a late quorum is reached how much you want to extend it ?
    voteExtension: 7200, // 7200 would be a day.
  },
  // Governor
  vetoGovernor:{
    name: "VETOERS DAO",
    // 5 hours
    votingDelay: 1500,
    // 7200 1 day
    votingPeriod: 7200,
    // numerator to denominator of 100
    quorumNumerator: 4,
    // threshold to be able to propose
    proposalThreshold: 0, // if you want to prevent proposal spam, you should set the threshold to value diff from zero.
    // vote extension, if a late quorum is reached how much you want to extend it ?
    // 10 hours.
    voteExtension: 3000,
    superQuorumThreshold: 50. // 50% of the total supply
  },
  // true set clockMode as timestamp, false is block
  clockMode: false,
  // First Mint is used to mint the first tokens to this governance
  // it has to be higher than the proposalThreshold
  // so it is enough tokens to the governance to be able to propose
  firstMint:{
    amount: 1000000,
    // To is an Ethereum Address, if empty, it will be the deployer, also it not correct, it will be the deployer ( warned when deploying )
    to: "",
  }
}
