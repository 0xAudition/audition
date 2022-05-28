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

export default function FormModalDeposit(props) {
  const [selectContractIdx, setSelectContractIdx] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  // enum DepositType {DEFAULT, INSURANCE, BOUNTY}
  const [depositType, setDepositType] = useState(0);
  const [condition, setCondition] = useState(0);

  const regContract = props.rowProps.registerContract;
  console.log(props);
  if (!regContract) return null;

  /*
  const handleSelectChange = (e) => {
    setSelectContractIdx(e.target.value);
  };
  */

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
            label={"Deposit Amount"}
            type="text"
            variant="outlined"
            onChange={e => {
              // TODO convert to number and make sure it is
              setDepositAmount(e.target.value);
            }}
          />
          <TextField
            id="outlined-submitter-input"
            className="w-3/4"
            label="Deposit Type"
            type="text"
            variant="outlined"
            placeholder="0, 1, 2"
            onChange={e => {
              // TODO validate 0, 1, or 2
              setDepositType(e.target.value);
            }}
          />
          <TextField
            id="outlined-submitter-input"
            className="w-3/4"
            label="Condition on Using Deposit"
            type="text"
            variant="outlined"
            placeholder="integer payout multiplier for insurance, severity from 0 to 2 for bounties"
            onChange={e => {
              // TODO validate 0, 1, or 2
              setCondition(e.target.value);
            }}
          />
          {/* read only section */}
          <TextField
            id="projectID-read-only-input"
            label="Project ID"
            className="w-3/4"
            value={props.rowProps.id}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = props.txtra.tx(props.txtra.writeContracts.AudnToken.approve(props.txtra.writeContracts.ProjectRegistry.address, ethers.utils.parseEther(depositAmount)), update => {
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
            Approve {depositAmount} AUDN
          </Button>
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              // function setDeposit(uint256 _projectId, uint256 _amount, DepositType _type)
              //const contractId = props.rowProps.projectContracts[selectContractIdx].contractId.toString();
              const amount = depositAmount; // XXX should be ethers.utils.parseEther(depositAmount)
              const result = props.txtra.tx(props.txtra.writeContracts.ProjectRegistry.setDeposit(props.rowProps.id, parseFloat(depositAmount), parseInt(depositType), parseInt(condition)), update => {
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
            Make Deposit!
          </Button>
        </Box>
      </Modal>
    </>
  );
}
