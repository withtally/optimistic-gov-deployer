// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title ERC20TokenUpgradeable
 * @dev ERC20TokenUpgradeable is an ERC20 token with additional features such as burning, pausing, and minting,
 * along with AccessControl and Permit functionalities.
 * This Contract uses Initializable and will use initialize and a proxy clone minimal EIP
 */
contract ERC20TokenUpgradeable is Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable
{

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Initializes the ERC20TokenUpgradeable contract.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param defaultAdmin The default admin role holder.
     * @param pauser The address with the pauser role.
     * @param minter The address with the minter role.
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        address defaultAdmin,
        address pauser,
        address minter
    ) public virtual initializer {
        // __ERC20PresetFixedSupply_init(name, symbol, initialSupply, owner);
        __ERC20_init(_name,_symbol);
        __ERC20Permit_init(_name);
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @notice Pauses all token transfers. Only callable by an address with the pauser role.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses token transfers. Only callable by an address with the pauser role.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @notice Mints new tokens and assigns them to the specified address.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.
    /**
     * @inheritdoc ERC20
     */ 
    /**
     * @inheritdoc ERC20Pausable
     */ 
    /**
     * @inheritdoc ERC20Votes
     */ 
    /**
     * @notice 
     * @param from The address which transferred the tokens.
     * @param to The address which received the tokens.
     * @param value The amount of tokens transferred.
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20VotesUpgradeable)
    {
        super._update(from, to, value);
    }

    /**
     * @notice Retrieves the nonce for a particular owner.
     * @param owner The address of the owner for which the nonce is retrieved.
     * @return The nonce for the given owner.
     */
    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable,NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }

}
