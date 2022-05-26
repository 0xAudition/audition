import { Modal, Button, Box, TextField, FormControl, MenuItem, Select, InputLabel } from "@mui/material";
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
  const [claimerAddress, setClaimerAddress] = useState("");
  const [selectContract, setSelectContract] = useState("");

  const checkClaimerAddressDigitCount = e => {
    e.preventDefault();
    setClaimerAddress(e.target.value);
  };

  const handleSelectChange = e => {
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
          {/* THIS NEEDS TO BE CONNECTED TO THE WALLET!!!!!!!!!!!!!!!!! */}
          {claimerAddress.length > 25 ? (
            <TextField
              id="outlined-claimerAddress-input"
              className="w-3/4"
              label="Claimer Address"
              type="text"
              variant="outlined"
              value={claimerAddress}
              onChange={checkClaimerAddressDigitCount}
            />
          ) : (
            <TextField
              color="secondary"
              helperText="Please ensure your address is correct before submission"
              id="outlined-claimerAddress-input"
              className="w-3/4"
              label="Claimer Address"
              value={claimerAddress}
              onChange={checkClaimerAddressDigitCount}
            />
          )}

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
            <InputLabel id="demo-simple-select-label">Contract Address</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Contract Address - select"
              onChange={handleSelectChange}
            >
              <MenuItem value={"sdfadfadgadkzzxdassdadfzdf14654"}>{"sdfadfadgadkzzxdassdadfzdf14654"}</MenuItem>
              <MenuItem>{selectContract}</MenuItem>
              <MenuItem>{selectContract}</MenuItem>
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
          <Button variant="outlined">Submit Claim</Button>
        </Box>
      </Modal>
    </>
  );
}
