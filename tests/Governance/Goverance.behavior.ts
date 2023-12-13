
import { ethers } from "hardhat";
import { expect } from "chai";


export async function shouldBehaveLikeGovernor(): Promise<void> {
    it("should receive answer from CLOCK_MODE", async function () {
        const { governor,  } = this;

        const clock_mode = await governor.CLOCK_MODE();

        expect(clock_mode).to.be.equal("mode=blocknumber&from=default");
    });

    it("clock shoudl return current block number", async function () {
        const { governor,  } = this;

        const clock = await governor.clock();
        const pBlock = await ethers.provider.getBlock("latest");

        expect(clock).to.be.equal(pBlock?.number);
    });
}