import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
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

function createData(sort, name, expand, funds) {
  return {
    sort,
    name,
    expand,
    funds,
    history: [
      {
        claim: "A Bug in 0x12345",
        insuranceDeposit: [
          `${500} AUDN from 0x12345578`,
          `Description: Project DAO ensures up to ${500} AUDN in the case of ...`,
        ],
        insuranceClaim: `${200} AUDN from 0x7890`,
      },
      {
        claim: "A Bug in 0x78911",
        insuranceDeposit: [
          `${400} AUDN from 0x1234aaddb`,
          `Description: Project DAO ensures up to ${400} AUDN in the case of ...`,
        ],
        insuranceClaim: `${200} AUDN from 0xdfkjs`,
      },
    ],
  };
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell component="th" scope="row" align="center">
          {row.sort}
        </TableCell>
        <TableCell align="left">{row.name}</TableCell>
        <TableCell align="center">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)} className="w-8">
            {open ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">{row.funds} AUDN</TableCell>
      </TableRow>
      <TableRow>
        {/* this is where the collapsible transaction history data are structured */}
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transaction History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Claim</TableCell>
                    <TableCell>Insurance Deposit</TableCell>
                    <TableCell>Insurance Claim</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map(historyRow => (
                    <TableRow key={historyRow.claim}>
                      <TableCell component="th" scope="row">
                        {historyRow.claim}
                      </TableCell>
                      <TableCell>
                        {historyRow.insuranceDeposit[0]}
                        <br></br>
                        {historyRow.insuranceDeposit[1]}
                      </TableCell>
                      <TableCell align="left">{historyRow.insuranceClaim}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    fund: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        claim: PropTypes.string.isRequired,
        insuranceDeposit: PropTypes.string.isRequired,
        insuranceClaim: PropTypes.string.isRequired,
      }),
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
export default function CollapsibleTable() {
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
          {rows.map(row => (
            <Row key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
