/* eslint-disable prettier/prettier */
import { useState } from "react";
import FormModalContract from "./FormModalContract";
import { Container, Button } from "@mui/material";

export default function RegisterContract(props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container className="flex h-20 justify-end items-center ctaButtons">
      <Button
        className="bg-blue-700 text-white hover:bg-blue-400 w-52"
        onClick={handleOpen}
      >
        Register Contract
      </Button>
      <FormModalContract
        open={open}
        handleOpen={handleOpen}
        handleClose={handleClose}
        props={props.rowProps}
      />
    </Container>
  );
}
