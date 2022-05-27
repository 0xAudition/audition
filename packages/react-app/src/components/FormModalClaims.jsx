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
  const [selectContract, setSelectContract] = useState("");
  const regContract = props.rowProps.registerContract;
  console.log(props);
  if (!regContract) return null;

  const handleSelectChange = (e) => {
    setSelectContract(e.target.value);
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
          />
          <TextField
            id="outlined-submitter-input"
            className="w-3/4"
            label="Claimer Name / Handle"
            type="text"
            variant="outlined"
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
              label="Contract Reference - select"
              onChange={handleSelectChange}
            >
              <MenuItem value={regContract?.[0].address}>
                {/* THIS LINKS TO THE CONTRACT REF NUMBER. THIS NEEDS REFACTORING & PROPER LINKING */}
                {regContract?.[0].address.slice(0, 5) +
                  "-" +
                  regContract?.[0].name}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Text to be encrypted  - SOMEONE NEEDS TO ENCRYPT THE TEXTS ON SUBMIT*/}
          <TextField
            id="outlined-claimDetails-input"
            className="w-3/4"
            label="Claim Details"
            type="text"
            variant="outlined"
            multiline
          />
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              // function registerClaim( uint256 _projectId, uint256 _contractId, address _contractAddress, string memory _metaData)
              let __contractId = 1; // TODO
              let __contractAddress = '0xBd696eA529180b32e8c67F1888ed51Ac071cb56F';
              let metaData = 'claim X reason Y extra Z';
              const result = props.txtra.tx(props.txtra.writeContracts.ClaimsRegistry.registerClaim(props.rowProps.id, __contractId, __contractAddress, metaData), update => {
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
