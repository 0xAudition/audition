pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IProjectRegistry.sol";
import "./IClaimsRegistry.sol";
import "./IAudnToken.sol";

contract ProjectRegistry is IProjectRegistry, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IAudnToken;

  IAudnToken public audn;
  IClaimsRegistry public claims;

  uint256 requiredAudn = 20 * 10 ** decimals();

  uint256 blocksPerDay = 40000;

  uint256 apyDeposit = 20;

  struct ProjectInfo{
    string projectName;
    address submitter;
    // uint256 proposalType;
    string metaData;
    bool bountyStatus;
    mapping(uint256 => ContractInfo) contracts;
    // mapping(uint256 => DepositInfo) deposits;
    uint256 contractCount;
    // uint256 depositCount;
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

  struct DepositInfo{
    uint256 projectId;
    uint256 depositId;
    address submitter;
    uint256 amount;
    DepositType depositType;
    uint256 condition;
    uint256 startBlock; // deposit start block
    uint256 releasedAmount;
    uint256 releasedBlock;
    uint256 claimedAmount;
    uint256 releasedTo;
    bool released;
  }

  enum DepositType {DEFAULT, INSURANCE, BOUNTY}

  mapping(uint256 => ProjectInfo) public map_id_info;
  mapping(uint256 => DepositInfo[]) public map_id_deposit;
  mapping(address => mapping(uint256 => uint256[])) public map_address_id_depositIds;
  uint256 internal projectIdCounter = 0;
  uint256 feeBalance;  // keep track of fees accrued from registrations
  uint256 depositBalance; // keep track of total deposit pool
  // uint256 yieldBalance;  //keep track of unpaid yield balance
  // uint256 lastYieldBlock; //last block to mint yield

  event RegisterProject(address indexed _from, uint256 _id, string _name, string _metaData);
  event RegisterContract(address indexed _from, uint256 _projectId, uint256 _id, string _contractSourceUri, address _contractAddress);

  constructor(IAudnToken _audn) {
    audn = _audn;
    // lastYieldBlock = block.number;
  }

  function registerProject(string memory _projectName, string memory _metaData, string memory _contractName, string memory _contractSourceUri, address _contractAddress) public{
    // require(audn.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register project");
    // audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
    // feeBalance += requiredAudn;
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
    // require(audn.balanceOf(msg.sender) >= requiredAudn, "insufficient AUDN balance to register contract");
    // audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
    // feeBalance += requiredAudn;
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

  function setDeposit(uint256 _projectId, uint256 _amount, DepositType _type, uint256 _condition) public {
    require(map_id_info[_projectId].active, "project is currently not active");
    uint256 depositAmount = _amount * 10 ** decimals();
    require(audn.balanceOf(msg.sender) >= depositAmount, "insufficient AUDN balance to set bounty");
    audn.safeTransferFrom(msg.sender, address(this), depositAmount);
    depositBalance += depositAmount;
    map_id_info[_projectId].bountyStatus = true;
    map_address_id_depositIds[msg.sender][_projectId].push(map_id_deposit[_projectId].length);
    DepositInfo memory deposit = DepositInfo(_projectId, map_id_deposit[_projectId].length, msg.sender, depositAmount, _type, _condition, block.number, 0, 0, 0, 0, false);
    map_id_deposit[_projectId].push(deposit);
  }

  function setInsuranceDeposit(uint256 _projectId, uint256 _amount, uint256 _maxPremium) public {
    require(map_id_info[_projectId].active, "project is currently not active");
    uint256 depositAmount = _amount * 10 ** decimals();
  }

  function getDeposits(uint256 _projectId) public view returns(DepositInfo[] memory) {
    return map_id_deposit[_projectId];
  }

  function rejectContract(uint256 _projectId, uint256 _contractId) public onlyOwner{
    require(map_id_info[_projectId].contracts[_contractId].active, "contract is already deactivated");
    map_id_info[_projectId].contracts[_contractId].active = false;
  }

  function setRequiredAudn(uint256 _value) public onlyOwner {
    requiredAudn = _value;
  }

  function verifyContract(uint256 _projectId, uint256 _contractId) public view override returns(bool) {
    require(map_id_info[_projectId].active, "project is invalid");
    require(map_id_info[_projectId].contracts[_contractId].active, "contract is invalid");
    return true;
  }

  function verifyProject(uint256 _projectId) public view returns(bool) {
    require(map_id_info[_projectId].active, "project is invalid");
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
      ContractInfo storage pushContract = map_id_info[_projectId].contracts[i];
      contracts[i-1] = pushContract;
    }
    return contracts;
  }

  function getContractCount(uint256 _projectId) public view returns (uint256) {
    return map_id_info[_projectId].contractCount;
  }

  function getProjectInfo(uint256 _projectId) public view returns (string memory, address, string memory, bool, uint256, bool) {
    return (map_id_info[_projectId].projectName, map_id_info[_projectId].submitter, map_id_info[_projectId].metaData,
            map_id_info[_projectId].bountyStatus, map_id_info[_projectId].contractCount, map_id_info[_projectId].active);
  }

  function getProjectCount() public view returns (uint256){
    return projectIdCounter;
  }

  function setClaimsRegistry(IClaimsRegistry _claims) public{
    claims = _claims;
  }

  function decimals() public view returns (uint256){
    return 18;
  }

  function withdrawDeposit(DepositInfo memory _deposit) public {

  }

  function getNumDepositsForUser(uint256 _projectId, address _user) public view returns (uint256) {
    return map_address_id_depositIds[_user][_projectId].length;
  }

  function getDepositIndexesGivenUser(uint256 _projectId, address _user) public view returns(uint256[] memory) {
    uint256 count = map_address_id_depositIds[_user][_projectId].length;
    uint256[] memory indexes = new uint256[](count);
    for(uint i = 0; i < count; i++) {
      indexes[i] = map_address_id_depositIds[_user][_projectId][i];
    }

    return indexes;
  }

  function getDepositsGivenUser(uint256 _projectId, address _user) public view returns(DepositInfo[] memory) {
    uint256 count = map_id_deposit[_projectId].length;
    require(count > 0, "no deposits for project");
    uint256 counter;
    DepositInfo[] memory deposits = new DepositInfo[](map_address_id_depositIds[_user][_projectId].length);
    for(uint i = 0; i < count; i++) {
      if(map_id_deposit[_projectId][i].submitter == _user) {
        DepositInfo storage deposit = map_id_deposit[_projectId][i];
        deposits[counter++] = deposit;
      }
    }
    return deposits;
  }

  function verifyDepositGivenIdAndUser(uint256 _projectId, uint256 _depositId, address _user) public view returns(bool) {
    verifyProject(_projectId);
    bool flag;
    uint256 count = map_address_id_depositIds[_user][_projectId].length;
    require(count > 0, "no deposits found for user");
    for(uint i = 0; i < count && !flag; i++) {
      if(map_address_id_depositIds[_user][_projectId][i] == _depositId) {
        flag = true;
      }
    }
    return flag;
  }

  function getDepositGivenIdAndUser(uint256 _projectId, uint256 _depositId, address _user) public view returns(DepositInfo memory) {
    require(verifyDepositGivenIdAndUser(_projectId, _depositId, _user));
    DepositInfo memory deposit = map_id_deposit[_projectId][_depositId];
    return deposit;
  }

  function calculateYieldGivenDeposit(uint256 _projectId, uint256 _depositId, address _user) public view returns(uint256) {
    DepositInfo memory deposit = getDepositGivenIdAndUser(_projectId, _depositId, _user);
    uint256 depositTime = block.number - deposit.startBlock;
    if(depositTime < blocksPerDay) {
      return 0;
    } else {
      uint256 depositDays = depositTime.div(blocksPerDay);
      return deposit.amount.div(100).mul(apyDeposit).div(365).mul(depositDays);
    }
  }

  function releaseDeposit(uint256 _projectId, uint256 _depositId, uint256 _claimId) public {
    uint256 yieldAmount = calculateYieldGivenDeposit(_projectId, _depositId, msg.sender);
    require(map_id_deposit[_projectId][_depositId].released == false, "deposit is already released");
    address claimOwner = claims.ownerOf(_claimId);
    if(yieldAmount > 0) {
      audn.mint(msg.sender, yieldAmount);
    }
    map_id_deposit[_projectId][_depositId].released = true;
    map_id_deposit[_projectId][_depositId].releasedTo = _claimId;
    map_id_deposit[_projectId][_depositId].releasedAmount = map_id_deposit[_projectId][_depositId].amount;
  }

  function collectClaim(uint256 _projectId, uint256 _depositId, uint256 _claimId) public {
    address claimOwner = claims.ownerOf(_claimId);
    require(claimOwner == msg.sender, "you do not own the claim");
    require(map_id_deposit[_projectId][_depositId].released, "deposit is not released");
    IClaimsRegistry.ClaimType claimType = claims.getClaimType(_claimId);
    if(claimType == IClaimsRegistry.ClaimType.INSURANCE && (map_id_deposit[_projectId][_depositId].depositType == DepositType.INSURANCE)) {
      uint256 maxAllowedClaimAmount;
      uint256 premiumBalance = claims.getClaimPremiumBalance(_claimId);
      require(premiumBalance > 0, "premium balance is 0");
      uint256 remainingDepositBalance = map_id_deposit[_projectId][_depositId].releasedAmount - map_id_deposit[_projectId][_depositId].claimedAmount;
      require(remainingDepositBalance > 0, "deposit balance is 0");
      maxAllowedClaimAmount = premiumBalance.mul(map_id_deposit[_projectId][_depositId].condition);
      uint256 claimAllowance = claims.getClaimAllowance(_claimId, maxAllowedClaimAmount);
      require(claimAllowance > 0, "already claimed the max amount for this claim");
      if(remainingDepositBalance >= claimAllowance) {
        audn.safeTransfer(msg.sender, claimAllowance);
        map_id_deposit[_projectId][_depositId].claimedAmount += claimAllowance;
        depositBalance -= claimAllowance;
        claims.setClaimedAmount(_claimId, claimAllowance);
        claims.withdrawPremium(_claimId);
      } else {
        audn.safeTransfer(msg.sender, remainingDepositBalance);
        map_id_deposit[_projectId][_depositId].claimedAmount += remainingDepositBalance;
        depositBalance -= remainingDepositBalance;
        claims.setClaimedAmount(_claimId, remainingDepositBalance);
      }
    } else {
      require(map_id_deposit[_projectId][_depositId].releasedTo == _claimId, "invalid claimer");
      require(map_id_deposit[_projectId][_depositId].claimedAmount == 0, "deposit was already claimed");
      audn.safeTransfer(msg.sender, map_id_deposit[_projectId][_depositId].releasedAmount);
      depositBalance -= map_id_deposit[_projectId][_depositId].releasedAmount;
      map_id_deposit[_projectId][_depositId].claimedAmount = map_id_deposit[_projectId][_depositId].releasedAmount;
    }

  }

  function getDepositBalance() public view returns (uint256) {
    return depositBalance;
  }

  function getTotalDepositsGivenId(uint256 _projectId) public view returns (uint256){
    verifyProject(_projectId);
    uint256 count = map_id_deposit[_projectId].length;
    uint256 total = 0;
    for(uint i = 0; i < count; i++) {
      total += map_id_deposit[_projectId][i].amount;
    }
    return total;
  }


  function verifyInsuranceDeposit(uint256 _projectId, uint256 _depositId) public view override returns (bool) {
    if(map_id_deposit[_projectId][_depositId].depositType == DepositType.INSURANCE) {
      return true;
    } else {
      return false;
    }
  }

  function verifyPremiumAmount(uint256 _projectId, uint256 _depositId, uint256 _premium) public view override returns (bool) {
    uint256 multiplier = map_id_deposit[_projectId][_depositId].condition;
    uint256 depositAmount = map_id_deposit[_projectId][_depositId].amount;

    if(_premium.mul(multiplier) <= depositAmount) {
      return true;
    } else {
      return false;
    }
  }

}
