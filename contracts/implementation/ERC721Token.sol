// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Votes.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

/**
 * @title ERC721Token
 * @dev This contract is an implementation of an ERC721 token with additional features such as pausing, minting, burning, and voting.
 * It inherits from various OpenZeppelin ERC721 extension contracts and uses AccessControl for role-based access control.
 * This Contract uses Initializable and will use initialize and a proxy clone minimal EIP
 */
contract ERC721Token is Initializable, ERC721Upgradeable, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, AccessControl, ERC721Burnable, EIP712Upgradeable, ERC721Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    function initialize(
        string memory name,
        string memory symbol,
        address defaultAdmin,
        address pauser,
        address minter
        )
    public virtual initializer {

        __EIP712_init(name, "1");
        __ERC721_init(name, symbol);
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Returns the base URI for token metadata.
     * @return The base URI string.
     */
    function _baseURI() internal pure override returns (string memory) {
        return "http:///";
    }

    /**
     * @dev Pauses all token transfers.
     * Only accounts with the PAUSER_ROLE can call this function.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses token transfers.
     * Only accounts with the PAUSER_ROLE can call this function.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Safely mints a new token and assigns it to the specified address.
     * Only accounts with the MINTER_ROLE can call this function.
     * @param to The address to mint the token to.
     * @param uri The URI for the token metadata.
     */
    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721Enumerable, ERC721Pausable, ERC721Votes)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721Upgradeable, ERC721Enumerable, ERC721Votes)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}