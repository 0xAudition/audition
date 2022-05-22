pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IProjectRegistry.sol";

contract ProjectRegistry is IProjectRegistry, Ownable {
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
    mapping(uint256 => ContractInfo) contracts;
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

  struct BountyInfo{
    uint256 projectId;
    address submitter;
    uint256 amount;
  }

  mapping(uint256 => ProjectInfo) public map_id_info;
  mapping(uint256 => BountyInfo[]) public map_id_bounty;
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
    map_id_info[projectId].contracts[1].projectId = projectId;
    map_id_info[projectId].contracts[1].contractId = 1;
    map_id_info[projectId].contracts[1].contractName = _contractName;
    map_id_info[projectId].contracts[1].contractSourceUri = _contractSourceUri;
    map_id_info[projectId].contracts[1].contractAddr = _contractAddress;
    map_id_info[projectId].contracts[1].active = true;
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
    map_id_info[_projectId].contracts[contractId].projectId = _projectId;
    map_id_info[_projectId].contracts[contractId].contractId = contractId;
    map_id_info[_projectId].contracts[contractId].contractName = _contractName;
    map_id_info[_projectId].contracts[contractId].contractSourceUri = _contractSourceUri;
    map_id_info[_projectId].contracts[contractId].contractAddr = _contractAddress;
    map_id_info[_projectId].contracts[contractId].active = true;
    map_id_info[_projectId].contractCount++;
    emit RegisterContract(msg.sender, _projectId, contractId, _contractSourceUri, _contractAddress);
  }

  function rejectProject(uint256 _projectId) public onlyOwner{
    require(map_id_info[_projectId].active, "project is already deactivated");
    map_id_info[_projectId].active = false;
  }

  function setBounty(uint256 _projectId, uint256 _amount) public {
    require(map_id_info[_projectId].active, "project is currently not active");
    uint256 bountyAmount = _amount * 10 ** decimals();
    require(audn.balanceOf(msg.sender) >= bountyAmount, "insufficient AUDN balance to set bounty");
    audn.safeTransferFrom(msg.sender, address(this), bountyAmount);
    BountyInfo memory bounty = BountyInfo(_projectId, msg.sender, bountyAmount);
    map_id_bounty[_projectId].push(bounty);
  }

  function getBounties(uint256 _projectId) public view returns(BountyInfo[] memory) {
    return map_id_bounty[_projectId];
  }

  function rejectContract(uint256 _projectId, uint256 _contractId) public onlyOwner{
    require(map_id_info[_projectId].contracts[_contractId].active, "contract is already deactivated");
    map_id_info[_projectId].contracts[_contractId].active = false;
  }

  function setRequiredAudn(uint256 _value) public onlyOwner {
    requiredAudn = _value;
  }

  function verifyContract(uint256 _projectId, uint256 _contractId) external view override returns(bool) {
      require(map_id_info[_projectId].active, "project is invalid");
      require(map_id_info[_projectId].contracts[_contractId].active, "contract is invalid");
      return true;
  }

  function getContractInfo(uint256 _projectId, uint256 _contractId) public view returns (ContractInfo memory) {
    return map_id_info[_projectId].contracts[_contractId];
  }

  function getContractsFromProject(uint256 _projectId) public view returns (ContractInfo[] memory) {
    require(map_id_info[_projectId].contractCount > 0, "contract count is 0");
    uint256 count = map_id_info[_projectId].contractCount;
    ContractInfo[] memory contracts = new ContractInfo[](count);
    for(uint i = 1; i <= count; i++) {
      ContractInfo memory pushContract = map_id_info[_projectId].contracts[i];
      contracts[i-1] = pushContract;
    }
    return contracts;
  }

  function getContractCount(uint256 _projectId) public view returns (uint256) {
    return map_id_info[_projectId].contractCount;
  }

  // function getProjectInfo(uint256 _projectId) public view returns (ProjectInfo memory) {
  //   return map_id_info[_projectId];
  // }

  function getProjectCount() public view returns (uint256){
    return projectIdCounter;
  }

  function decimals() public view returns (uint256){
    return 18;
  }
}
