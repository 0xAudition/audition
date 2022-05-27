pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IClaimsRegistry is IERC721 {

  struct ClaimInfo {
      uint256 projectId;
      uint256 claimId;
      uint256 contractId;
      address contractAddress;
      address submitter;
      string metaData;
      ClaimType claimType;
      // uint256 claimLength;
      uint256 claimStart;
      uint256 depositAmount;
      bool refClaim;
      uint256 refClaimId;
      uint256 blockNumber;
      uint256 proposalId;
      bool approved;
  }

  enum ClaimType {
      DEFAULT,
      INSURANCE,
      BOUNTY
  }

  function getClaimInfo(uint256 _claimId) external view returns (ClaimInfo memory);

  function getClaimType(uint256 _claimId) external view returns (ClaimType claimType);

}
