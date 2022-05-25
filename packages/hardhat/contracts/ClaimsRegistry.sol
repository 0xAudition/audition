pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IProjectRegistry.sol";
import "./KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

contract ClaimsRegistry is ERC721, Ownable, KeeperCompatibleInterface {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Strings for uint256;

    IERC20 public audn;
    IGovernor public governor;
    IProjectRegistry public projectRegistry;
    string public _name = "AUDNCLAIMS";
    string public _symbol = "AUDNCLAIMS";

    uint256 requiredAudn = 20 * 10**18;

    struct ClaimInfo {
        uint256 projectId;
        uint256 claimId;
        uint256 contractId;
        address contractAddress;
        address submitter;
        string metaData;
        // ClaimType claimType;
        uint256 claimLength;
        uint256 claimStart;
        uint256 depositAmount;
        bool refClaim;
        uint256 refClaimId;
        uint256 blockNumber;
        uint256 proposalId;
        bool approved;
    }

    struct ReviewInfo {
        string review;
        address reviewer;
        uint256 timeStamp;
    }

    enum ClaimType {
        DEFAULT,
        INSURANCE,
        BOUNTY
    }

    mapping(uint256 => ClaimInfo) public claimId_info_map;
    mapping(uint256 => uint256[]) public projectId_claimId_map;
    uint256 claimIdCounter = 0;

    event RegisterClaim(
        address _from,
        uint256 _projectId,
        uint256 _claimId,
        string _metaData
    );

    constructor(IERC20 _audn) ERC721(_name, _symbol) {
        audn = _audn;
    }

    function registerClaim(
        uint256 _projectId,
        uint256 _contractId,
        address _contractAddress,
        string memory _metaData
    ) public returns (uint256) {
        require(projectRegistry.verifyContract(_projectId, _contractId));
        require(
            audn.balanceOf(msg.sender) >= requiredAudn,
            "insufficient AUDN balance to register claim"
        );
        audn.safeTransferFrom(msg.sender, address(this), requiredAudn);
        uint256 claimId = claimIdCounter + 1;
        claimId_info_map[claimId].projectId = _projectId;
        claimId_info_map[claimId].claimId = claimId;
        claimId_info_map[claimId].contractId = _contractId;
        claimId_info_map[claimId].contractAddress = _contractAddress;
        claimId_info_map[claimId].submitter = msg.sender;
        claimId_info_map[claimId].metaData = _metaData;
        claimId_info_map[claimId].blockNumber = block.number;

        projectId_claimId_map[_projectId].push(claimId);
        _mint(msg.sender, claimId);
        claimIdCounter++;
        emit RegisterClaim(msg.sender, _projectId, claimId, _metaData);
        return claimId;
    }

    function setProjectRegistry(IProjectRegistry _projectRegistry)
        public
        onlyOwner
    {
        projectRegistry = _projectRegistry;
    }

    function setGoverner(IGovernor _governor) public onlyOwner {
        governor = _governor;
    }

    function rejectClaim(uint256 _claimId) public onlyOwner {
        require(
            claimId_info_map[_claimId].approved,
            "claim is already rejected"
        );
        claimId_info_map[_claimId].approved = false;
    }

    // function withdrawClaim(uint256 _claimId) public {
    //
    // }

    function approveClaim(uint256 _claimId) public onlyOwner {
        require(
            !claimId_info_map[_claimId].approved,
            "claim is already approved"
        );
        claimId_info_map[_claimId].approved = true;
        claimId_info_map[_claimId].claimStart = block.number;
    }

    function setRequiredAudn(uint256 _value) public {
        requiredAudn = _value;
    }

    function getClaimInfo(uint256 _claimId)
        public
        view
        returns (ClaimInfo memory)
    {
        return claimId_info_map[_claimId];
    }

    function getClaimIds(uint256 _projectId)
        public
        view
        returns (uint256[] memory)
    {
        return projectId_claimId_map[_projectId];
    }

    function getClaims(uint256 _projectId)
        public
        view
        returns (ClaimInfo[] memory)
    {
        uint256 count = projectId_claimId_map[_projectId].length;
        require(count > 0, "no claims for this project");
        ClaimInfo[] memory claims = new ClaimInfo[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 claimId = projectId_claimId_map[_projectId][i];
            ClaimInfo storage claim = claimId_info_map[claimId];
            claims[i] = claim;
        }
        return claims;
    }

    function createProposal(uint256 _claimId)
        public
        returns (uint256 proposalId)
    {
        ClaimInfo storage claim = claimId_info_map[_claimId];
        if (!claim.approved && claim.proposalId == 0) {
            bytes memory transferCalldata = abi.encodeWithSignature(
                "mint(address,uint256)",
                claim.submitter,
                500 * 10 ** 18
            );
            bytes memory claimApproveCalldata = abi.encodeWithSignature(
                "approveClaim(uint256)",
                _claimId
            );

            string memory title = string(
                bytes.concat(
                    bytes("Proposal to approve ClaimId: "),
                    bytes(_claimId.toString())
                )
            );

            address[] memory targets = new address[](2);
            targets[0] = address(audn);
            targets[1] = address(governor);

            uint256[] memory values = new uint256[](2);

            bytes[] memory calldatas = new bytes[](2);
            calldatas[0] = transferCalldata;
            calldatas[1] = claimApproveCalldata;

            claim.proposalId = governor.propose(
                targets,
                values,
                calldatas,
                title
            );
        }
        return claim.proposalId;
    }

    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // after claim creation, we can give the creator some time to receieve comments and withdraw.
        // It might be unnecessary to create a proposal and vote unless its worthy.
        uint256[] memory pendingClaims = new uint256[](100);
        uint256 counter = 0;
        for (uint256 i = 0; i <= claimIdCounter; i++) {
            ClaimInfo memory claim = claimId_info_map[i];
            if (
                !claim.approved &&
                claim.proposalId == 0 &&
                claim.blockNumber < (block.number - 100)
            ) {
                // We can create a proposal for this
                // add claim Id to list
                pendingClaims[counter++] = claim.claimId;
            }
        }
        if (counter > 0) {
            uint256[] memory _pendingClaims = new uint256[](counter);
            for (uint256 i = 0; i < counter; i++) {
                _pendingClaims[i] = pendingClaims[i];
            }
            return (true, abi.encode(_pendingClaims));
        } else {
            upkeepNeeded = false;
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory pendingClaims;
        (pendingClaims) = abi.decode(performData, (uint256[]));
        // update claim.proposalId
        for (uint256 i = 0; i < pendingClaims.length; i++) {
            createProposal(pendingClaims[i]);
        }
    }
}
