import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import type { OzGovernorSuperQuorum, TimelockController, ERC20Token, ERC721Token } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
    export interface Context {
        governor: OzGovernorSuperQuorum;
        token: ERC20Token;
        timelock: TimelockController;
        nft: ERC721Token;
        governorNFT: OzGovernorSuperQuorum;
        loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
        signers: Signers;
    }
}

export interface Signers {
    admin: SignerWithAddress;
    notAuthorized: SignerWithAddress;
}