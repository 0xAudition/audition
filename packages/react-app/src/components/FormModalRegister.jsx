import { Modal, Button, Box, TextField } from "@mui/material";
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

export default function FormModalRegister(props) {
  const [address, setAddress] = useState("");

  const checkDigitCount = e => {
    e.preventDefault();
    setAddress(e.target.value);
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
          {/* Register Project Form */}
          <TextField
            id="outlined-projectName-input"
            className="w-3/4"
            label={"Project Name"}
            type="text"
            variant="outlined"
          />
          <TextField
            id="outlined-description-input"
            className="w-3/4"
            label="Project Description"
            type="text"
            variant="outlined"
          />
          {address.length > 25 ? (
            <TextField
              id="outlined-contractAddress-input"
              className="w-3/4"
              label="Contract Address"
              type="text"
              variant="outlined"
              value={address}
              onChange={checkDigitCount}
            />
          ) : (
            <TextField
              color="secondary"
              helperText="Please ensure the contract address is correct before submission"
              id="outlined-contractAddress-input"
              className="w-3/4"
              label="Contract Address"
              value={address}
              onChange={checkDigitCount}
            />
          )}
          <TextField
            id="outlined-projectName-input"
            className="w-3/4"
            label="Project Name"
            type="text"
            variant="outlined"
          />
          {/* read only section - THIS NEEDS CONNECTION TO THE NAME OF THE CONTRACT & CONTRACT SOURCE */}
          <TextField
            id="contractName-read-only-input"
            label="Contract Name"
            className="w-3/4"
            value={"Name of the contract"}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <TextField
            id="contractURI-standard-read-only-input"
            label="Contract Source ?"
            className="w-3/4"
            value={"x0x00x00"}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <Button variant="outlined">Register</Button>
        </Box>
      </Modal>
    </>
  );
}
