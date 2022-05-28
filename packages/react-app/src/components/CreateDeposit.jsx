/* eslint-disable prettier/prettier */
import { useState } from "react";
import { Button } from "@mui/material";
import FormModalDeposit from "./FormModalDeposit";

export default function CreateDeposit(props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  // eslint-disable-next-line prettier/prettier
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        className="bg-blue-500 text-white hover:bg-blue-400 w-52"
        onClick={handleOpen}
      >
        Deposit
      </Button>
      <FormModalDeposit
        open={open}
        handleClose={handleClose}
        createClaims={true}
        name="Submit"
        rowProps={props.rowProps.row}
        txtra={props.rowProps.txtra}
      />
    </>
  );
}
