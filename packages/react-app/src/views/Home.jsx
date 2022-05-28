/* eslint-disable prettier/prettier */
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import img from "./../img/chainlink.svg";
import logo from "./../img/0xShield.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import FormModalRegister from "../components/FormModalRegister";

export default function Home({
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
      <AppBar className="shadow-none gradient-bg py-4 z-10">
        <Toolbar>
          <img src={logo}  width={50} height={50} />
          <Typography
            variant="h4"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: "flex",
              letterSpacing: "0",
              textDecoration: "none",
              fontSize: { xs: "1.2rem", md: "3.5rem" },
              fontWeight: "bold",
              color: "#eee",
            }}
          >
          { '{ 0xAudition }' }
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Hero Section */}
      <div className="w-full h-[100%]">        
        <Container className="w-[80%] h-full mt-20 max-w-screen-lg">                     
          <img src={`${img}`} alt="chainlink" className="w-full"/>    
          <Container className="mt-8 lg:mt-16">
            <Typography className="pt-8 font-bold text-blue-900 text-2xl md:text-3xl lg:text-5xl text-gradient">Total Prizes locked</Typography>
            <Typography className="pt-8 font-medium text-xl md:text-2xl lg:text-4xl">7,777,777 AUDN</Typography>
          </Container>  
          <Container className="mt-8 lg:mt-16">
            <Typography className="pt-8 font-bold text-blue-900 text-2xl md:text-3xl lg:text-5xl text-gradient">Total Prizes/amount earned</Typography>
            <Typography className="pt-8 font-medium text-xl md:text-2xl lg:text-4xl">250,000 AUDN</Typography> 
          </Container>
        </Container>        
      </div>
      <footer className="my-20 flex justify-center gap-4">
        <Button
          variant="outlined"
          onClick={handleOpen}
        >
          Register A Project
        </Button>
        <FormModalRegister
          open={open}
          handleClose={handleClose}
          registerProject={true}
          address={address}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
        />
        <Link to="/projects">
            <Button variant="contained" className="bg-blue-500">Find Bounties</Button>
        </Link>
      </footer>
     
    </>
  );
}
