/* eslint-disable prettier/prettier */
import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import "./CollapsibleTable.css";
import CreateClaims from "./CreateClaims";
import RegisterContract from "./RegisterContract";
import {
  useContractReader,
} from "eth-hooks";
const { ethers } = require("ethers");


function createData(sort, name, expand, funds) {
  return {
    sort,
    name,
    expand,
    funds,
    history: [
      {
        claim: `A Bug in ${0x12345}`,
        insuranceDeposit: [
          `${500} AUDN from ${0x12345578}`,
          `Description: Project DAO ensures up to ${500} AUDN in the case of ...`,
        ],
        insuranceClaim: `${200} AUDN from ${0x7890}`,
      },
      {
        claim: `A Bug in ${0x78911}`,
        insuranceDeposit: [
          `${400} AUDN from ${0x1234aaddb}`,
          `Description: Project DAO ensures up to ${400} AUDN in the case of ...`,
        ],
        insuranceClaim: `${200} AUDN from ${0xddf500}`,
      },
    ],
    // NEEDS TO BE LINKED TO THE CONTRACT DETAILS FROM THE REGISTER CONTRACT FORM
    registerContract: [
      {
        address: `${"0x7822000sdfadadkgjadlkjadal"}`,
        name: `${"ERC20"}`,
      },
      {
        address: `${"0x78399000sdfadadkgjadlkjadal"}`,
        name: `${"ERC"}`,
      },
    ],
  };
}

function ProjectRow(props) {
  const id = props.id;
  const projectInfo = useContractReader(props.props.props.readContracts, "ProjectRegistry", "getProjectInfo", [id]);
  const projectContracts = useContractReader(props.props.props.readContracts, "ProjectRegistry", "getContractsFromProject", [id]);
  const projectClaims = useContractReader(props.props.props.readContracts, "ClaimsRegistry", "getClaims", [id]);
  const projectDeposits = useContractReader(props.props.props.readContracts, "ProjectRegistry", "getDeposits", [id]);
  if (!projectInfo) return null;
  const row = createData(id, projectInfo[0], true, 50001);
  row.projectInfo = projectInfo;
  row.projectContracts = projectContracts ? projectContracts : [];
  row.projectClaims = projectClaims ? projectClaims : [];
  row.projectDeposits = projectDeposits ? projectDeposits : [];
  row.id = id;
  const txtra = {
    address: props.props.props.address,
    tx: props.props.props.tx,
    writeContracts: props.props.props.writeContracts
  };

  return (<Row key={id} row={row} txtra={txtra} />);
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  console.log(props);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell component="th" scope="row" align="center">
          {row.id}
        </TableCell>
        <TableCell align="left">{row.projectInfo ? row.projectInfo[0] : '...'}</TableCell>
        <TableCell align="center">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            className="w-8"
          >
            {open ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">{row.funds} AUDN</TableCell>
      </TableRow>
      <TableRow>
        {/* this is where the collapsible contract registry data are structured */}
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Contracts
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>No.</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    /*
                      struct ContractInfo{
                        uint256 projectId;
                        uint256 contractId;
                        string contractName;
                        string contractSourceUri;
                        address contractAddr;
                        bool bountyStatus;
                        bool active;
                      }
                    */
                   row.projectContracts.map((contractRow) => (
                    <TableRow key={contractRow.address}>
                      <TableCell component="th" scope="row">
                        {contractRow.contractId.toString()}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {contractRow.contractAddr}
                      </TableCell>
                      <TableCell>{contractRow.contractName}</TableCell>
                      <TableCell><a href={contractRow.contractSourceUri}>Link</a></TableCell>
                    </TableRow>
                  ))}

                  {/*row.registerContract.map((contractRow) => (
                    <TableRow key={contractRow.address}>
                      <TableCell component="th" scope="row">
                        {contractRow.address.slice(0, 5)}-{contractRow.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {contractRow.address}
                      </TableCell>
                      <TableCell>{contractRow.name}</TableCell>
                    </TableRow>
                  ))*/}
                </TableBody>
              </Table>
              <RegisterContract rowProps={props} />
            </Box>

            {/* this is where the collapsible transaction history data are structured */}
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transaction History - Deposits &amp; Claims
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Deposit ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Claimed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.projectDeposits.map((deposit) => (
                    <TableRow key={deposit.depositId}>
                      <TableCell component="th" scope="row">
                        {deposit.depositId.toString()}
                      </TableCell>
                      <TableCell>
                        {ethers.utils.formatEther(deposit.amount)}
                      </TableCell>
                      <TableCell align="left">
                        {ethers.utils.formatEther(deposit.claimedAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Container className="flex h-20 gap-4 justify-end items-center ctaButtons">
                <Button className="bg-blue-500 text-white hover:bg-blue-400 w-24">
                  Deposit
                </Button>
              </Container>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Claim</TableCell>
                    <TableCell>Insurance Deposit</TableCell>
                    <TableCell>Insurance Claim</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.projectClaims.map((claim) => (
                    <TableRow key={claim.claimId}>
                      <TableCell component="th" scope="row">
                        Claim[{claim.claimId.toString()}]<br/>
                        Contract#{claim.contractId.toString()}
                      </TableCell>
                      <TableCell>
                        {claim.metaData}
                      </TableCell>
                      <TableCell align="left">
                        {claim.depositAmount.toString()} AUDN
                      </TableCell>
                    </TableRow>
                  ))}
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.claim}>
                      <TableCell component="th" scope="row">
                        {historyRow.claim}
                      </TableCell>
                      <TableCell>
                        {historyRow.insuranceDeposit[0]}
                        <br></br>
                        {historyRow.insuranceDeposit[1]}
                      </TableCell>
                      <TableCell align="left">
                        {historyRow.insuranceClaim}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Container className="flex h-20 gap-4 justify-end items-center ctaButtons">
                <CreateClaims rowProps={props} />
              </Container>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

//this is where the table data types are set
Row.propTypes = {
  row: PropTypes.shape({
    sort: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    funds: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        claim: PropTypes.string.isRequired,
        //insuranceDeposit: PropTypes.string.isRequired,
        insuranceClaim: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

// this is where the table data gets fed
const rows = [
  createData(1, "UST", "", 5000),
  createData(2, "Maker DAO", "", 2000),
  createData(3, "0x Audition", "", 1500),
];

// this is where the actual table heading and the entire structure get set
export default function CollapsibleTable(props) {
  if (!props.projectCount) return null;
  const projectIds = [...Array(props.projectCount.toNumber())].map((_, i) => i + 1); // array of projectIds from 1

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Sort</TableCell>
            <TableCell align="left">Name</TableCell>
            <TableCell align="center">Expand</TableCell>
            <TableCell>Funds</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projectIds.map((id) => (
            <ProjectRow key={id} id={id} props={props} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
