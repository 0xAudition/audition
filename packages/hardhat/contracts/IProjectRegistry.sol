pragma solidity ^0.8.0;

interface IProjectRegistry {

  function verifyContract(uint256 _projectId, uint256 _contractId) external view returns(bool);

}
