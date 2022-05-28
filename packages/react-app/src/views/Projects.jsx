/* eslint-disable prettier/prettier */
import { AppBar, Toolbar, Typography, Container } from "@mui/material";
import logo from "./../img/0xShield.png";
import CollapsibleTable from "../components/CollapsibleTable";
import RegisterProject from "../components/RegisterProject";
import {
  useContractReader,
} from "eth-hooks";


function Projects(props) {
  const projectCount = useContractReader(props.readContracts, "ProjectRegistry", "getProjectCount");

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
      {/* collapsible table section */}
      <Container maxWidth="md" className="h-[100vh] mt-48">
        <Typography variant="h3" className="font-bold text-gradient mb-8 project">
          Projects
        </Typography>
        <CollapsibleTable props={props} projectCount={projectCount} className="mb-20 shadow-md" />
        <RegisterProject {...props}/>
      </Container>
    </>
  );
}

export default Projects;
