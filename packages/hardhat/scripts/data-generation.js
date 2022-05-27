const { getNamedAccounts, deployments, getChainId, ethers } = require("hardhat");

const main = async () => {

    const { deployer } = await getNamedAccounts();

    const AudnToken = await ethers.getContract("AudnToken", deployer);
    const ProjectRegistry = await ethers.getContract("ProjectRegistry", deployer);
    const ClaimsRegistry = await ethers.getContract("ClaimsRegistry", deployer);
    const AudnGovernor = await ethers.getContract("AudnGovernor", deployer);

    console.log(await AudnToken.balanceOf(await deployer));
    await addProjects({ AudnToken, ProjectRegistry, ClaimsRegistry, AudnGovernor });
    await addClaims({ AudnToken, ProjectRegistry, ClaimsRegistry, AudnGovernor });
}

const addProjects = async ({ AudnToken, ProjectRegistry, ClaimsRegistry, AudnGovernor }) => {

    // console.log(AudnToken.address, ProjectRegistry.address, ClaimsRegistry.address, AudnGovernor.address);
    await ProjectRegistry.registerProject('UniSwap V2 - Factory',
        'The factory holds the generic bytecode responsible for powering pairs. Its primary job is to create one and only one smart contract per unique token pair. It also contains logic to turn on the protocol charge',
        'UniswapV2Factory',
        'https://docs.uniswap.org/protocol/V2/reference/smart-contracts/factory',
        '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f');

    await ProjectRegistry.registerProject('Link Token Contract',
        'The link token ERC20 contract',
        'LinkToken',
        'https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code',
        '0x514910771AF9Ca656af840dff83E8264EcF986CA');
}

const addClaims = async ({ AudnToken, ProjectRegistry, ClaimsRegistry, AudnGovernor }) => {
    await ClaimsRegistry.registerClaim(1, 1, '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        JSON.stringify({
            Severity: 'Critical',
            BriefDesciption: 'It seems to have a reentrancy error in one of the linked older contracts',
            Detail: 'The main contract references a DecimalHelper contract while paying out. This is linked to a older contract at 0x123... where a reentrancy attack can be mounted with the right situation',
            Impact: 'Funds maintained in the pool can be siphoned off 4% at a time if the user has staked'
        }));

    await ClaimsRegistry.registerClaim(1, 1, '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        JSON.stringify({
            Severity: 'Moderate',
            BriefDesciption: 'It is missing the onlyOwner modifier for CalculatePayoffs() method',
            Detail: 'Its only called on certain situation and seems non-critical. But if the oracle fails, it might end up being the failover method',
            Impact: 'Attacker can get control of DAO'
        }));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });