/* eslint-disable prettier/prettier */
import { Modal, Box, TextField, Button } from "@mui/material";
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

export default function FormModalContract(props) {
  const [contractAddress, setContractAddress] = useState("");
  const [name, setName] = useState("");

  const checkContractAddressDigit = (e) => {
    e.preventDefault();
    setContractAddress(e.target.value);
  };

  const handleName = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          {/* THIS NEEDS TO BE CONNECTED TO THE WALLET!!!!!!!!!!!!!!!!! */}
          {contractAddress.length > 25 ? (
            <TextField
              className="w-3/4"
              label="Contract Address"
              type="text"
              variant="outlined"
              value={contractAddress}
              onChange={checkContractAddressDigit}
            />
          ) : (
            <TextField
              color="secondary"
              helperText="Please ensure your address is correct before submission"
              className="w-3/4"
              label="Contract Address"
              value={contractAddress}
              onChange={checkContractAddressDigit}
            />
          )}
          <TextField
            className="w-3/4"
            label="Name"
            type="text"
            value={name}
            variant="outlined"
            onChange={handleName}
          />
          {/* THE BUTTON NEEDS TO BE CONNECTED TO THE "CONTRACTS" TABLE UNDER "PROJECTS". REFER TO "RegisterContract.jsx" under COMPONENTS */}
          <Button onClick={handleSubmit}>Submit</Button>
        </Box>
      </Modal>
    </>
  );
}
