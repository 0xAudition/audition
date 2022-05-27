/* eslint-disable prettier/prettier */
import { AppBar, Toolbar, Typography, Container } from "@mui/material";
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
      <h2>debug: {projectCount ? projectCount.toString() : '...'} projects live</h2>
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
