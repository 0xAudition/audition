pragma solidity ^0.8.0;

interface IProjectRegistry {

  function verifyContract(uint256 _projectId, uint256 _contractId) external view returns(bool);
  function verifyInsuranceDeposit(uint256 _projectId, uint256 _depositId) external view returns (bool);
  function verifyPremiumAmount(uint256 _projectId, uint256 _depositId, uint256 _premium) external view returns (bool);

}
