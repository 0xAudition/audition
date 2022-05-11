pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract ProjectRegistry is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public aud;

  struct ProjectInfo{
    string projectName;
    address submitee;
    // uint256 proposalType;
    string metaData;
    bool bountyStatus;
    ContractInfo contracts[];
    uint256 contractCount = 0;
  }

  struct ContractInfo{
    uint256 projectId;
    uint256 contractId;
    string contractName;
    string contractSourceUri;
    address contractAddr;
    bool bountyStatus;
  }

  mapping(uint256 => ProjectInfo) public map_id_info;
  uint256 projectIdCounter = 0;

  constructor(IERC20 _aud) {
    aud = _aud;
  }

  function registerProject (string _projectName, string _metaData) public returns (uint256) {
    ProjectInfo project = ProjectInfo(_projectName, msg.sender, _proposalType, _metaData, false);
    uint256 projectlId = projectIdCounter;
    map_id_info[proposalId] = project;
    projectIdCounter++;
    return projectId;
  }

  function registerContract (uint256 _projectId, string _contractName, string _contractSourceUri, address _contractAddr) public returns (uint256) {
    uint256 _contractId = getNewContractId(_projectId);
    ContractInfo _contract = ContractInfo(_projectId, _contractId, _contractName, _contractSourceUri, _contractAddr, false);
    map_id_info[_projectId].contracts.push(_contract);
    map_id_info[_projectId].contractCount++;
    return _contractId;

  }

  function getNewContractId (uint256 _projectId) public returns (uint256){
    return (map_id_info[_projectId].contractCount + 1);
  }
}
