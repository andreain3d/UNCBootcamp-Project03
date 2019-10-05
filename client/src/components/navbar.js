import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { ExitToApp, MeetingRoom } from "@material-ui/icons";

const styles = {
  grow: {
    flexGrow: 1
  },
  button: { marginLeft: 5 },
  logo: {
    height: "50px",
    filter: "invert(1)"
  }
};

class Navbar extends Component {
  render(props) {
    const classes = this.props.classes;
    return (
      <AppBar position="static" className={classes.grow}>
        <Toolbar>
          <img
            className={classes.logo}
            alt="Poker Logo"
            src="./assets/img/logo.png"
          />
          <Typography variant="h6" color="inherit" className={classes.grow}>
            Poker
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            className={classes.button}
          >
            <MeetingRoom />
            Return to Lobby
          </Button>
          <Button
            color="secondary"
            variant="contained"
            className={classes.button}
          >
            <ExitToApp />
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(Navbar);
