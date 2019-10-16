import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Auth0Context } from "../react-auth0-wrapper";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import { ExitToApp, MeetingRoom, AccountBox } from "@material-ui/icons";
import API from "../utils/API";

const styles = {
  grow: {
    flexGrow: 1
  },
  button: { marginLeft: 5 },
  logo: {
    height: "50px",
    filter: "invert(1)"
  },
  userInfo: { marginRight: 25 }
};

class Navbar extends Component {
  static contextType = Auth0Context;

  render() {
    const { logout, user } = this.context;
    const classes = this.props.classes;
    const { leaveTable } = this.props;

    if (!user) {
      return <Redirect to="/" />;
    }

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
          {user ? (
            <Typography
              variant="h6"
              color="inherit"
              className={classes.userInfo}
            >
              {this.props.name} : ${this.props.cash}
            </Typography>
          ) : (
            ""
          )}
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
            <Link to="/profile">
              <Button
                color="secondary"
                variant="contained"
                className={classes.button}
              >
                <AccountBox />
                Your Profile
              </Button>
            </Link>
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
