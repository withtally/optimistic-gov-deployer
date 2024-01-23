// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ERC20Token.sol";


/**
 * @title ERC20Token
 * @dev ERC20Token is an ERC20 token with additional features such as burning, pausing, and minting,
 * along with AccessControl and Permit functionalities.
 */
contract ERC20TokenClock is ERC20Token {


    /**
     * @dev Initializes the ERC20Token contract.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param defaultAdmin The default admin role holder.
     * @param pauser The address with the pauser role.
     * @param minter The address with the minter role.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address defaultAdmin,
        address pauser,
        address minter
    )
        ERC20Token(
            _name,
            _symbol,
            defaultAdmin,
            pauser,
            minter
        )
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
