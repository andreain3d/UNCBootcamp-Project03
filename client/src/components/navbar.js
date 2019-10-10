import React, { Component } from "react";
import { Auth0Context } from "../react-auth0-wrapper";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { ExitToApp, MeetingRoom, AccountBox } from "@material-ui/icons";

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
  static contextType = Auth0Context;
  render(props) {
    const { logout } = this.context;
    const classes = this.props.classes;
    const { leaveTable } = this.props;
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
          {this.props.return ? (
            <Button
              color="secondary"
              variant="contained"
              className={classes.button}
              onClick={leaveTable}
            >
              <MeetingRoom />
              Return to Lobby
            </Button>
          ) : (
            ""
          )}
          {this.props.profile ? (
            <Button
              color="secondary"
              variant="contained"
              className={classes.button}
              href="/profile"
            >
              <AccountBox />
              Your Profile
            </Button>
          ) : (
            ""
          )}
          {this.props.logout ? (
            <Button
              color="secondary"
              variant="contained"
              className={classes.button}
              onClick={() => logout()}
            >
              <ExitToApp />
              Logout
            </Button>
          ) : (
            ""
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(Navbar);
