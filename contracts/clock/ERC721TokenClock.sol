// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ERC721Token.sol";

/**
 * @title ERC721TokenClock
 * @dev This contract is an implementation of an ERC721 token with additional features such as pausing, minting, burning, and voting.
 * It inherits from various OpenZeppelin ERC721 extension contracts and uses AccessControl for role-based access control.
 */
contract ERC721TokenClock is ERC721Token {
   
    /**
     * @dev Initializes the ERC20Token contract.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param defaultAdmin The default admin role holder.
     * @param pauser The address with the pauser role.
     * @param minter The address with the minter role.
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address defaultAdmin,
        address pauser,
        address minter
        )
        ERC721Token(name, symbol,baseTokenURI, defaultAdmin, pauser, minter)
        {
    }

    /**
     * @dev Returns the current timestamp as a `uint48`.
     * @return The current timestamp.
     */
    function clock() 
        public 
        view 
        override 
        returns (uint48) {
        return uint48(block.timestamp);
    }

    /**
     * @dev Returns the clock mode as a string.
     * @return The clock mode.
     */
    function CLOCK_MODE()
        public
        view
        virtual
        override
        returns (string memory) {
        return "mode=timestamp";
    }
}