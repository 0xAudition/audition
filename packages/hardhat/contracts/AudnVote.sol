pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AudnVote is ERC20Votes, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  string public _name = "Audition Vote Token";
  string public _symbol = "vAUDN";

  IERC20 public audn;

  mapping(address => uint256) public stakeBalance;

  event Stake (address indexed staker, uint256 amount);

  constructor(IERC20 _audn) ERC20(_name, _symbol) ERC20Permit(_name) {
    audn = _audn;
  }

  function stake(uint256 amount) public {
    require(audn.balanceOf(msg.sender) >= amount, "insufficient AUD balance");

    audn.safeTransferFrom(msg.sender, address(this), amount);
    stakeBalance[msg.sender] = stakeBalance[msg.sender].add(amount);

    emit Stake(msg.sender, amount);
  }
}
