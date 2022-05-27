/* eslint-disable prettier/prettier */
import {
  Modal,
  Button,
  Box,
  TextField,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { useState } from "react";

const style = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  height: "auto",
  bgcolor: "background.paper",
  boxShadow: "2px 2px 24px black",
  borderRadius: "10px",
  p: 3,
  maxWidth: "850px",
};

export default function FormModalClaims(props) {
  const [selectContractIdx, setSelectContractIdx] = useState(0);
  const [claimTitle, setClaimTitle] = useState('');
  const [claimerHandle, setClaimerHandle] = useState('');
  const [claimDetails, setClaimDetails] = useState('');

  const regContract = props.rowProps.registerContract;
  console.log(props);
  if (!regContract) return null;

  const handleSelectChange = (e) => {
    setSelectContractIdx(e.target.value);
  };

  return (
    <>
      <Modal
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="w-10/12" sx={style} component="form" noValidate>
          <TextField
            id="outlined-claim-title-input"
            className="w-3/4"
            label={"Claim Title"}
            type="text"
            variant="outlined"
            onChange={e => {
              setClaimTitle(e.target.value);
            }}
          />
          <TextField
            id="outlined-submitter-input"
            className="w-3/4"
            label="Claimer Name / Handle"
            type="text"
            variant="outlined"
            onChange={e => {
              setClaimerHandle(e.target.value);
            }}
          />
          <TextField
            id="outlined-claimerAddress-input"
            className="w-3/4"
            label="Claimer Address"
            type="text"
            variant="standard"
            value={props.txtra.address}
            InputProps={{
              readOnly: true,
            }}
          />

          {/* read only section */}
          <TextField
            id="projectID-read-only-input"
            label="Project ID"
            className="w-3/4"
            value={"Designated Project ID"}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          {/* Contract address dropdown selection here - NEED TO CONNECT TO EXISTING CONTRACT ADDRESSES TO SEE THE OPTIONS */}
          <FormControl className="w-3/4">
            <InputLabel id="demo-simple-select-label">
              Contract Address
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={0}
              label="Contract Reference - select"
              onChange={handleSelectChange}
            >
              {props.rowProps.projectContracts.map((projectContract, idx) => (
                <MenuItem key={idx} value={idx /*projectContract.contractId.toString()*/}>
                  {projectContract.contractAddr.slice(0, 8) +
                    "-" +
                    projectContract.contractName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Text to be encrypted  - SOMEONE NEEDS TO ENCRYPT THE TEXTS ON SUBMIT*/}
          <TextField
            id="outlined-claimDetails-input"
            className="w-3/4"
            label="Claim Details"
            type="text"
            variant="outlined"
            onChange={e => {
              setClaimDetails(e.target.value);
            }}
            multiline
          />
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              // function registerClaim( uint256 _projectId, uint256 _contractId, address _contractAddress, string memory _metaData)
              const contractId = props.rowProps.projectContracts[selectContractIdx].contractId.toString();
              const contractAddress = props.rowProps.projectContracts[selectContractIdx].contractAddr;
              const metaData = JSON.stringify({
                title: claimTitle,
                handle: claimerHandle,
                details: claimDetails
              });
              const result = props.txtra.tx(props.txtra.writeContracts.ClaimsRegistry.registerClaim(props.rowProps.id, contractId, contractAddress, metaData), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Make Claim!
          </Button>
        </Box>
      </Modal>
    </>
  );
}
