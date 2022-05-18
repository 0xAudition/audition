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
    address submitter;
    // uint256 proposalType;
    string metaData;
    bool bountyStatus;
    ContractInfo[] contracts;
    uint256 contractCount;
    bool active;
  }

  struct ContractInfo{
    uint256 projectId;
    uint256 contractId;
    string contractName;
    string contractSourceUri;
    address contractAddr;
    bool bountyStatus;
    bool active;
  }

  mapping(uint256 => ProjectInfo) public map_id_info;
  uint256 public projectIdCounter = 0;

  constructor(IERC20 _aud) {
    aud = _aud;
  }

  function registerProject(string memory _projectName, string memory _metaData) public returns (uint256) {
    uint256 requiredAudn = 20 * 10 ** 18;
    require(aud.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register project");
    aud.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 projectId = projectIdCounter;
    map_id_info[projectId].projectName = _projectName;
    map_id_info[projectId].submitter = msg.sender;
    map_id_info[projectId].metaData = _metaData;
    map_id_info[projectId].bountyStatus = false;
    map_id_info[projectId].active = true;
    projectIdCounter++;
    return projectId;
  }

  function registerContract(uint256 _projectId, string memory _contractName, string memory _contractSourceUri, address _contractAddr) public returns (uint256) {
    uint256 requiredAudn = 20 * 10 ** 18;
    require(aud.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register contract");
    aud.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 _contractId = map_id_info[_projectId].contractCount;
    ContractInfo memory inputContract = ContractInfo(_projectId, _contractId, _contractName, _contractSourceUri, _contractAddr, false, true);
    map_id_info[_projectId].contracts.push(inputContract);
    map_id_info[_projectId].contractCount++;
    return _contractId;
  }

  function rejectProject(uint256 _projectId) public onlyOwner{
    require(map_id_info[_projectId].active, "project is already deactivated");
    map_id_info[_projectId].active = false;
  }

  function rejectContract(uint256 _projectId, uint256 _contractId) public onlyOwner{
    require(map_id_info[_projectId].contracts[_contractId].active, "contract is already deactivated");
    map_id_info[_projectId].contracts[_contractId].active = false;
  }

  function getContractInfo(uint256 _projectId, uint256 _contractId) public view returns (ContractInfo memory) {
    return map_id_info[_projectId].contracts[_contractId];
  }

  function getContractCount(uint256 _projectId) public view returns (uint256) {
    return map_id_info[_projectId].contractCount;
  }

  function getProjectInfo(uint256 _projectId) public view returns (ProjectInfo memory) {
    return map_id_info[_projectId];
  }

  function getProjectCount() public view returns (uint256){
    return projectIdCounter;
  }


}
