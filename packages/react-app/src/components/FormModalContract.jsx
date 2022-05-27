/* eslint-disable prettier/prettier */
import { Modal, Box, TextField, Button } from "@mui/material";
import { useState } from "react";
const { ethers } = require("ethers");

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
  console.log(props);
  const [contractAddress, setContractAddress] = useState("");
  const [name, setName] = useState("");
  const [sourceUri, setSourceUri] = useState("");

  const checkContractAddressDigit = (e) => {
    e.preventDefault();
    setContractAddress(e.target.value);
  };

  const handleName = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleSourceUri = (e) => {
    e.preventDefault();
    setSourceUri(e.target.value);
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
              placeholder={'0x426892cd1aA9228357bE4BB232918E146482806F'}
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
          <TextField
            className="w-3/4"
            label="Source URI"
            type="text"
            value={sourceUri}
            variant="outlined"
            onChange={handleSourceUri}
          />
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = props.props.txtra.tx(props.props.txtra.writeContracts.AudnToken.approve(props.props.txtra.writeContracts.ProjectRegistry.address, ethers.utils.parseEther('20')), update => {
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
            Approve 20 AUDN
          </Button>
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              // function registerContract(uint256 _projectId, string memory _contractName, string memory _contractSourceUri, address _contractAddress)
              const projectId = props.props.row.id;
              const result = props.props.txtra.tx(props.props.txtra.writeContracts.ProjectRegistry.registerContract(projectId, name, sourceUri, contractAddress), update => {
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
            Add Contract!
          </Button>

        </Box>
      </Modal>
    </>
  );
}
