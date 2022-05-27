/* eslint-disable prettier/prettier */
import { Button } from "@mui/material";
import { useState } from "react";
import FormModalRegister from "./FormModalRegister";

export default function RegisterProject({
  props,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant="contained"
        className="bg-blue-500 text-white hover:bg-blue-400 my-20"
        onClick={handleOpen}
      >
        Register A Project
      </Button>
      <FormModalRegister
        open={open}
        handleClose={handleClose}
        registerProject={true}
        tx={tx}
        writeContracts={writeContracts}
      />
    </>
  );
}
