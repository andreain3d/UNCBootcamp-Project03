import React, { Component } from "react";
import { Grid, withStyles, Paper } from "@material-ui/core";
import { amber } from "@material-ui/core/colors";
import Navbar from "../components/navbar";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Profile from "../components/Profile";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: "#1C2022"
    },
    secondary: amber
  }
});

const styles = {
  landingContainer: {
    height: "70vh"
  },
  background: {
    margin: 0,
    height: "95vh",
    backgroundImage: "url('/assets/img/lobbybg.png')",
    backgroundRepeat: "repeat"
  },
  footer: {
    background: "#1c2022",
    flexGrow: 1,
    height: "10vh"
  },
  paper: {
    padding: 20
  }
};

class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      cash: 0
    };
  }

  setUserObj = (username, cash) => {
    this.setState({ username, cash });
  };

  render() {
    const classes = this.props.classes;
    const { email } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        {console.log(this.state)}
        <Navbar
          logout="true"
          username={this.state.username}
          cash={this.state.cash}
        />
        <Grid container alignItems="flex-end" className={classes.background}>
          <Grid
            className={classes.landingContainer}
            container
            alignItems="center"
            justify="center"
          >
            <Paper className={classes.paper}>
              <Profile
                toggleEdit={this.toggleEdit}
                email={email}
                setUserObj={this.setUserObj}
              />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.footer} />
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(ProfileView);
