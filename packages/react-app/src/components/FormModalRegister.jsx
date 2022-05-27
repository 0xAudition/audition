/* eslint-disable prettier/prettier */
import { Modal, Button, Box, TextField } from "@mui/material";
import { useState } from "react";
import {
  useContractReader,
} from "eth-hooks";


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
  // const [address, setAddress] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [contractVerified, setContractVerified] = useState(false);
  const [contractName, setContractName] = useState("");


  const checkDigitCount = async (e) => {
    e.preventDefault();
    setContractAddress(e.target.value);
    let addr = e.target.value;
    console.log({addr});
    if(addr && addr.length == 42) {
      // get contract details
      let url = `https://api-rinkeby.etherscan.io/api?module=contract&action=getsourcecode&address=${addr}&apikey=BC8WVS441425IDXZI1ZUDGT7XTCQAUYJGW`;
      
      let response = await fetch(url, {
        crossDomain:true,
      });
      let contractInfo =  await response.json();
      if(contractInfo.status == '1') {
        setContractVerified(true);
        if(contractInfo.result && contractInfo.result.length > 0) {
          setContractName(contractInfo.result[0].ContractName);
        }
      }
    }
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
            onChange={e => {
              setProjectName(e.target.value);
            }}
          />
          <TextField
            id="outlined-description-input"
            className="w-3/4"
            label="Project Description"
            type="text"
            variant="outlined"
            onChange={e => {
              setProjectDesc(e.target.value);
            }}
          />
          {contractAddress.length > 25 ? (
            <TextField
              id="outlined-contractAddress-input"
              className="w-3/4"
              label="Contract Address"
              type="text"
              variant="outlined"
              value={contractAddress}
              onChange={checkDigitCount}
            />
          ) : (
            <TextField
              color="secondary"
              helperText="Please ensure the contract address is correct before submission"
              id="outlined-contractAddress-input"
              className="w-3/4"
              label="Contract Address"
              value={contractAddress}
              onChange={checkDigitCount}
            />
          )}
          {/* read only section - THIS NEEDS CONNECTION TO THE NAME OF THE CONTRACT & CONTRACT SOURCE */}

          <TextField
            id="contractName-verified"
            label="Contract Validated"
            className="w-3/4"
            value={contractVerified}
            InputProps={{
              readOnly: true,
            }}
            variant="standard"
          />

          <TextField
            id="contractName-read-only-input"
            label="Contract Name"
            className="w-3/4"
            value={contractName}
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
          <Button variant="outlined"
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              // ProjectRegistry.registerProject("TombFork", "tombfork.io", "Boardroom", "ipfs://forkboardroom", "0xBd696eA529180b32e8c67F1888ed51Ac071cb56F");
              // TODO Contract Source
              console.log(props)
              const result = props.tx(props.writeContracts.ProjectRegistry.registerProject(projectName, projectDesc, contractName, '', contractAddress), update => {
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
            Register Project!
          </Button>

        </Box>
      </Modal>
    </>
  );
}
