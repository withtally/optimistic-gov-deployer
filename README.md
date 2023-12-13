## Optimistic Governance: Empowering Faster DAOs with Tally

**Theme image for repository: resources/banner.png**

**# Streamline Your DAO with Optimistic Governance**

Welcome to the future of DAO governance! This repository empowers you to implement Optimistic Governance, a powerful framework designed to expedite decision-making and streamline your DAO's operations.

Launch a Optimistic Governance with Tally:** [[https://docs.tally.xyz/premium-features/optimistic-governance](https://docs.tally.xyz/premium-features/optimistic-governance)]


## ⚡ What is Optimistic Governance?

Imagine a DAO where trusted members, the **Optimistic Council**, propose changes and swiftly enact them. Yet, the broader community retains control through a **veto mechanism**. This enables:

* **Rapid decision-making:** Proposals move quickly, allowing your DAO to adapt and innovate with agility.
* **Community control:** Veto power ensures proposals align with your DAO's vision and values.
* **Reduced bureaucracy:** Streamlined processes minimize overhead, keeping your DAO lean and efficient.

##  How does it work?

Optimistic Governance leverages a combination of battle-tested smart contracts:

* **Council NFTs:** Grant membership in the Optimistic Council.
* **Voting Tokens:** Determine voting power for vetoes.
* **Optimistic Governor:** Handles proposals and their swift execution.
* **Veto Governor:** Allows the community to challenge and potentially veto proposals.
* **Timelock:** Holds DAO assets and ensures proposals undergo a review period before execution.

To know more about contracts check up our [docs](https://docs.tally.xyz)

Want to deploy your DAO with Tally, we also have [premium features](https://docs.tally.xyz/premium-features).

## 🧐 Using it with Tally

If you want a normal Governance, you can use this [repo](https://github.com/withtally/gov_deployer)

0. Fill `.env` file and install the repo as explained in [instalation](#installation)
1. Remember to fill use the configs for your DAO, you can find it in `deploy.config.ts`
2. Deploy the contracts using the [deploy method](#deploying).
5. Validate your contract as explained [here](#validating-contract).
6. You will also have to mint and share tokens to members of your DAO
7. Remember to remove yourself as minter from the token when finished with task 6
7. Enter in contact with [Tally!](mailto:biz@tally.xyz) 


## 💻 Getting Started

#### Installation

```bash
git clone https://github.com/withtally/gov_deployer.git && cd gov_deployer && git checkout new
pnpm install
cp .env.example .env
# Fill in the necessary values in the .env file (e.g., node RPCs)
# You can also set all the values 
# npx hardhat vars set INFURA_API_KEY
```

Some other commands

```bash
pnpm clean
pnpm test
npx hardhat compile
```

It also adds the whole contracts added and their verify lines to a file called `contracts.out`, for future reference so you can close your terminal with no worries.

#### Pre-Requisites

- Node.js and PNPM
- Git

#### Deploying

The configuration parameters to deploy the contracts can be found at `deploy.config` in the root of this folder.

```bash
# you have to define the network according to network name listed in hardhat.config.ts
pnpm deployc --network sepolia
# to test in hardhat just run
pnpm deployc
```

#### Validating Contract
After running the script to deploy the contract, it will print the command lines needed to validate each contract in your terminal. 

But to run those contracts you must have provided your Etherscan ( or other scan ) to the API KEY in the `.env` file, you can use it to validate the contracts.

Example output:

```bash
quorum numerator: 30 
vote extension: 7200 

deploying "OZGovernor" (tx: 0xc364cf1527fd3fb9d04cc2b53ec1099bd9f77dc745d6932060a06b4fdb2f98f9)...: deployed at 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 with 4800366 gas

OZ Governor contract:  0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

npx hardhat verify --network hardhat 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "EXAMPLE GROUP" 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 7200 50400 0 30 7200
```

----------

### Testing

To run the tests:

```bash
pnpm test
```

----------

## 🚨 Disclaimer

Tally is not responsible for funds or contracts deployed with this tool. It is intended for internal testing & reference purposes only.

## 🤝 Contributions

Contributions are welcome! Refer to the [contributing guidelines](CONTRIBUTING.md) to get started.