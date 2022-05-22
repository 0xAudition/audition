pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IProjectRegistry.sol";

contract ClaimsRegistry is ERC721, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public audn;
  IProjectRegistry public projectRegistry;
  string public _name = "AUDNCLAIMS";
  string public _symbol = "AUDNCLAIMS";

  uint256 requiredAudn = 20 * 10 ** 18;

  struct ClaimInfo {
    uint256 projectId;
    uint256 contractId;
    address contractAddress;
    address submitter;
    string metaData;
    uint256 claimType;
    uint256 claimLength;
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

  event RegisterClaim(address _from, uint256 _projectId, uint256 _contractId, address _contractAddress, string _metaData);

  constructor(IERC20 _audn) ERC721(_name, _symbol) {
    audn = _audn;
  }

  function registerClaim(uint256 _projectId, uint256 _contractId, address _contractAddress, string memory _metaData) public returns (uint256){
    require(projectRegistry.verifyContract(_projectId, _contractId));
    require(audn.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register claim");
    audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 claimId = claimIdCounter;
    claimId_info_map[claimId].projectId = _projectId;
    claimId_info_map[claimId].contractId = _contractId;
    claimId_info_map[claimId].contractAddress = _contractAddress;
    claimId_info_map[claimId].submitter = msg.sender;
    claimId_info_map[claimId].metaData = _metaData;
    projectId_claimId_map[_projectId].push(claimId);
    _mint(msg.sender, claimId);
    claimIdCounter++;
    emit RegisterClaim(msg.sender, _projectId, _contractId, _contractAddress, _metaData);
    return claimId;
  }

  function setProjectRegistry(IProjectRegistry _projectRegistry) public onlyOwner{
    projectRegistry = _projectRegistry;
  }

  function rejectClaim(uint256 _claimId) public onlyOwner{
    require(claimId_info_map[_claimId].approved, "claim is already rejected");
    claimId_info_map[_claimId].approved = false;
  }

  // function withdrawClaim(uint256 _claimId) public {
  //
  // }

  function approveClaim(uint256 _claimId) public onlyOwner{
    require(!claimId_info_map[_claimId].approved, "claim is already approved");
    claimId_info_map[_claimId].approved = true;
    claimId_info_map[_claimId].claimStart = block.number;
  }

  function setRequiredAudn(uint256 _value) public{
    requiredAudn = _value;
  }
}
