pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ClaimsRegistry is ERC721, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public aud;
  string public _name = "AUDCLAIMS";
  string public _symbol = "AUDCLAIMS";

  struct ClaimInfo {
    uint256 projectId;
    uint256 contractId;
    address contractAddress;
    address submitter;
    string metadata;
    uint256 claimType;
    // uint256 claimLength;
    uint256 claimStart;
    uint256 depositAmount;
    bool refClaim;
    uint256 refClaimId;
    bool approved;
  }

  struct ReviewInfo {
    string review;
    address reviewer;
    uint256 timeStamp;
  }

  mapping(uint256 => ClaimInfo) public claimId_info_map;
  mapping(uint256 => uint256) public projectId_claimId_map;
  uint256 claimIdCounter = 0;

  constructor(IERC20 _aud) ERC721(_name, _symbol) {
    aud = _aud;
  }

  function registerClaim(ClaimInfo memory _claim) public returns (uint256){
    ClaimInfo memory claim = _claim;
    uint256 claimId = claimIdCounter;
    claimId_info_map[claimId] = claim;
    projectId_claimId_map[claim.projectId] = claimId;
    claimIdCounter++;
    return claimId;
  }

  function approveClaim(uint256 _claimId) public returns (bool) {
    claimId_info_map[_claimId].approved = true;
    claimId_info_map[_claimId].claimStart = block.number;
    return true;
  }
}
