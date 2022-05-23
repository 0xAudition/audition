import { AppBar, Toolbar, Typography, Container } from "@mui/material";
import React from "react";
import CollapsibleTable from "../components/CollapsibleTable";

function Home(props) {
  return (
    <>
      <AppBar className="shadow-none gradient-bg py-4 z-0">
        <Toolbar>
          <Typography
            variant="h4"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: "flex",
              letterSpacing: "0.3rem",
              textDecoration: "none",
              fontSize: { xs: "1.2rem", md: "2rem" },
              color: "#fff",
            }}
          >
            Audition
          </Typography>
        </Toolbar>
      </AppBar>
      {/* collapsible table section */}
      <Container maxWidth="md" className="h-[100vh] mt-48">
        <Typography variant="h3" className="font-bold text-gradient mb-8 project">
          Projects
        </Typography>
        <CollapsibleTable className="mb-20 shadow-md" />
      </Container>
    </>
  );
}

export default Home;
