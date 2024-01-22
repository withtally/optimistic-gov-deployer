// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./ERC20Token.sol";
import "./ERC721Token.sol";
import "./TimelockController.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";


contract FactoryClone {

    address immutable tokenImplementation;
    address[] public tokens;

    constructor() public {
        tokenImplementation = address(new ERC20Token());
        // timelockImplementation = address(new TimelockController());
        // OzGovernorSuperQuorum = address(new OzGovernorSuperQuorum());
    }

    function createToken(
        string calldata name, 
        string calldata symbol, 
        uint256 initialSupply
    ) external returns (
        address,
        address,
        address
    ) {

        // Creating Token
        address clone = Clones.clone(tokenImplementation);
        ERC20Token(clone).initialize(name, symbol, initialSupply, msg.sender);
        tokens.push(clone);

        return clone,clone,clone;
    }


}