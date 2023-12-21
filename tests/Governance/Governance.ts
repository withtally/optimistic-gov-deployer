import { ethers } from "hardhat";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import type { Signers } from "../types";

import { deployGovernanceContractsClockTimestampFixture, deployGovernanceContractsFixture } from "./Governance.fixture";
import { shouldBehaveLikeGovernor, shouldBehaveLikeGovernorWithTimestamp } from "./Goverance.behavior";

describe("OZGovernorSuperQuorum", async function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.notAuthorized = signers[1];    

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {   

    const { token,timelock,governor,nft,governorNFT } = await this.loadFixture(deployGovernanceContractsFixture);
    this.governor = governor;
    this.token = token;
    this.timelock = timelock;
    this.nft = nft;
    this.governorNFT = governorNFT;

  });

  shouldBehaveLikeGovernor();

});


describe("OZGovernorSQWithTimestamp", async function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.notAuthorized = signers[1];    

    this.loadFixture = loadFixture;
  });

  beforeEach(async function () {   

    const { token,timelock,governor,nft,governorNFT } = await this.loadFixture(deployGovernanceContractsClockTimestampFixture);
    this.governor = governor;
    this.token = token;
    this.timelock = timelock;
    this.nft = nft;
    this.governorNFT = governorNFT;

  });

  shouldBehaveLikeGovernorWithTimestamp();

});