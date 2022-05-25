// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "./IAudnToken.sol";

contract AudnToken is IAudnToken, ERC20, Ownable, ERC20Permit, ERC20Votes {

    address projectRegistry;

    modifier onlyOwnerOrRegistry {
      require(msg.sender == owner() || msg.sender == projectRegistry);
      _;
    }

    constructor() ERC20("Audition Token", "AUDN") ERC20Permit("Audition Token") {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public override onlyOwnerOrRegistry{  // SHOULD BE ONLY OWNER OR REGISTRY
        _mint(to, amount);
    }

    function setRegistry(address _registry) public onlyOwner {
      projectRegistry = _registry;
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
