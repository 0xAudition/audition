import { useState } from "react";
import { Button } from "@mui/material";
import FormModalClaims from "./FormModalClaims";

export default function CreateClaims() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button className="bg-blue-500 text-white hover:bg-blue-400" onClick={handleOpen}>
        Claims
      </Button>
      <FormModalClaims open={open} handleClose={handleClose} createClaims={true} name="Submit" />
    </>
  );
}
