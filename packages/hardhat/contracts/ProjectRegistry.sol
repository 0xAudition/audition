pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract ProjectRegistry is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public audn;

  uint256 requiredAudn = 20 * 10 ** decimals();

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
  uint256 internal projectIdCounter = 0;

  event RegisterProject(address indexed _from, uint256 _id, string _name, string _metaData);
  event RegisterContract(address indexed _from, uint256 _projectId, uint256 _id, string _contractSourceUri, address _contractAddress);

  constructor(IERC20 _audn) {
    audn = _audn;
  }

  function registerProject(string memory _projectName, string memory _metaData, string memory _contractName, string memory _contractSourceUri, address _contractAddress) public{
    require(audn.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register project");
    audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 projectId = projectIdCounter + 1;
    map_id_info[projectId].projectName = _projectName;
    map_id_info[projectId].submitter = msg.sender;
    map_id_info[projectId].metaData = _metaData;
    map_id_info[projectId].bountyStatus = false;
    map_id_info[projectId].active = true;
    ContractInfo memory inputContract = ContractInfo(projectId, 1, _contractName, _contractSourceUri, _contractAddress, false, true);
    map_id_info[projectId].contracts.push(inputContract);
    map_id_info[projectId].contractCount++;
    projectIdCounter++;
    emit RegisterProject(msg.sender, projectId, _projectName, _metaData);
    emit RegisterContract(msg.sender, projectId, 1, _contractSourceUri, _contractAddress);

  }

  function registerContract(uint256 _projectId, string memory _contractName, string memory _contractSourceUri, address _contractAddress) public{
    require(map_id_info[_projectId].active, "invalid project id");
    require(audn.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register contract");
    audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
    uint256 contractId = map_id_info[_projectId].contractCount + 1;
    ContractInfo memory inputContract = ContractInfo(_projectId, contractId, _contractName, _contractSourceUri, _contractAddress, false, true);
    map_id_info[_projectId].contracts.push(inputContract);
    map_id_info[_projectId].contractCount++;
    emit RegisterContract(msg.sender, _projectId, contractId, _contractSourceUri, _contractAddress);
  }

  function rejectProject(uint256 _projectId) public onlyOwner{
    require(map_id_info[_projectId].active, "project is already deactivated");
    map_id_info[_projectId].active = false;
  }

  function rejectContract(uint256 _projectId, uint256 _contractId) public onlyOwner{
    require(map_id_info[_projectId].contracts[_contractId].active, "contract is already deactivated");
    map_id_info[_projectId].contracts[_contractId].active = false;
  }

  function setRequiredAudn(uint256 _value) public onlyOwner {
    requiredAudn = _value;
  }

  function validateProjAndContract(uint256 _projectId) public returns(bool) {
      require(map_id_info[_projectId].active, "Project is not valid");

  }

  function getContractInfo(uint256 _projectId, uint256 _contractId) public view returns (ContractInfo memory) {
    return map_id_info[_projectId].contracts[_contractId];
  }

  function getContractsFromProject(uint256 _projectId) public view returns (ContractInfo[] memory) {
    return map_id_info[_projectId].contracts;
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

  function decimals() public view returns (uint256){
    return 18;
  }
}
