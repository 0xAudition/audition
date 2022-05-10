pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectRegistry is Ownable {

  struct ProjectInfo{
    string projectName;
    address submitee;
    uint256 proposalType;
    string metaData;
    bool bountyStatus;
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

  function registerProject (string _projectName, address _submitee, uint256 _proposalType, string _metaData, bool _bountyStatus) public returns (uint256) {
    ProjectInfo project = ProjectInfo(_projectName, _submitee, _proposalType, _metaData, _bountyStatus);
    uint256 projectlId = projectIdCounter;
    map_id_info[proposalId] = project;
    projectIdCounter++;
    return projectId;
  }


}
