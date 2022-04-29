// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract AudToken is ERC20Burnable {
    string public _name = "Audition Token";
    string public _symbol = "AUD";
    uint256 public _decimals = 18;
    uint256 private _initialSupply = 1000000000 * (10 ** uint256(decimals()));

    constructor() ERC20Burnable(_name, _symbol) {
      _mint(msg.sender, _initialSupply);
    }
}
