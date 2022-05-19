pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ClaimsRegistry is ERC721, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public aud;
  string public _name = "AUDNCLAIMS";
  string public _symbol = "AUDNCLAIMS";

  struct ClaimInfo {
    uint256 projectId;
    uint256 contractId;
    address contractAddress;
    address submitter;
    string metaData;
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
  mapping(uint256 => uint256[]) public projectId_claimId_map;
  uint256 claimIdCounter = 0;

  constructor(IERC20 _aud) ERC721(_name, _symbol) {
    aud = _aud;
  }

  function registerClaim(uint256 _projectId, uint256 _contractId, address _contractAddress, string _metaData) public returns (uint256){
    uint256 requiredAudn = 20 * 10 ** 18;
    require(aud.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register project");
    aud.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 claimId = claimIdCounter;
    claimId_info_map[claimId].projectId = _projectId;
    claimId_info_map[claimId].contractId = _contractId;
    claimId_info_map[claimId].contractAddress = _contractAddress;
    claimId_info_map[claimId].submitter = msg.sender;
    claimId_info_map[claimId].metaData = _metaData;
    projectId_claimId_map[_projectId].push(claimId);
    claimIdCounter++;
    return claimId;
  }

  function approveClaim(uint256 _claimId) public onlyOwner{
    require(!claimId_info_map[_claimId].approved, "claim is already approved");
    claimId_info_map[_claimId].approved = true;
  }

  function rejectClaim(uint256 _claimId) public onlyOwner{
    require(claim_info_map[_claimId].approved, "claim is already rejected");
    claimId_info_map[_claimId].approved = false;
  }

  // function withdrawClaim(uint256 _claimId) public {
  //
  // }

  function approveClaim(uint256 _claimId) public returns (bool) {
    claimId_info_map[_claimId].approved = true;
    claimId_info_map[_claimId].claimStart = block.number;
    return true;
  }
}
