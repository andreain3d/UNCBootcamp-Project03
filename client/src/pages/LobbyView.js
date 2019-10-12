import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import { Grid, Button, withStyles, Typography, Paper } from "@material-ui/core";
import { amber } from "@material-ui/core/colors";
import { Auth0Context } from "../react-auth0-wrapper";
import { AddCircle, VpnKey } from "@material-ui/icons";
import API from "../utils/API";
import Navbar from "../components/navbar";
import Chat from "../components/chat";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

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
  container: {
    height: "60vh",
    flexGrow: 1,
    padding: 5
  },
  button: {
    height: "15vh",
    width: "30vh",
    borderRadius: "15vh"
  },
  welcome: {
    textShadow: "1px 1px 3px #FFFFFF"
  },
  footer: {
    background: "#1c2022",
    flexGrow: 1,
    height: "10vh"
  }
};

class LobbyView extends Component {
  static contextType = Auth0Context;

  constructor(props) {
    super(props);
    this.state = {
      currentPos: 999999,
      queueLength: 999999,
      joined: false,
      prime: false
    };
    this.socket = this.props.socket;
    this.socket.on("ADDPLAYER", data => {
      if (this.state.joined) {
        this.setState({ queueLength: data.que.length });
      }
    });
    this.socket.on("PRIME", () => {
      if (this.props.position >= 0) {
        this.setState({ prime: true });
      }
    });
    this.socket.on("LEAVEQUE", data => {
      const { user } = this.context;
      if (this.state.joined) {
        var pos = data.que
          .map(player => {
            return player.name;
          })
          .indexOf(user.nickname);
        this.setState({
          currentPos: pos + 1,
          queueLength: data.que.length
        });
      }
    });
  }

  joinGame = event => {
    event.preventDefault();
    const { user } = this.context;
    this.socket = this.props.socket;
    API.getUser(user.email).then(res => {
      this.props.setName(res.data.username);
      API.createPlayer({
        name: res.data.username,
        cash: res.data.cash,
        img: res.data.image,
        socketId: this.props.socketId
      }).then(res => {
        this.setState({
          currentPos: res.data.quePos + 1,
          queueLength: res.data.que.length,
          joined: true
        });
      });
    });
  };

  leaveQueue = event => {
    event.preventDefault();
    const { user } = this.context;
    API.leaveQueue(user.nickname).then(() => {
      this.setState({
        currentPos: 999999,
        queueLength: 999999,
        joined: false
      });
    });
  };

  render() {
    const {
      isAuthenticated,
      loginWithPopup,
      logout,
      loading,
      user
    } = this.context;
    const classes = this.props.classes;
    const { socket } = this.props;

    if (this.state.prime) {
      return <Redirect to="/table" />;
    }

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <MuiThemeProvider theme={theme}>
        {!isAuthenticated && (
          <Fragment>
            <Navbar />
            <Grid
              container
              alignItems="flex-end"
              className={classes.background}
            >
              <Grid
                className={classes.landingContainer}
                container
                alignItems="center"
                justify="center"
              >
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.button}
                  onClick={() => loginWithPopup({})}
                >
                  <Typography variant="h5">
                    <VpnKey />
                    Log In
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.footer} />
              </Grid>
            </Grid>
          </Fragment>
        )}

        {isAuthenticated && (
          <Fragment>
            <Navbar profile="true" logout="true" />
            <Grid
              className={classes.background}
              container
              alignItems="flex-end"
              justify="center"
            >
              <Grid item xs={12}>
                <Grid
                  container
                  className={classes.container}
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <Typography
                      className={classes.welcome}
                      align="center"
                      variant="h4"
                    >
                      <strong>Welcome to the Lobby!</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container justify="center">
                      {this.state.joined ? (
                        <Button
                          disabled
                          onClick={this.joinGame}
                          className={classes.button}
                          color="secondary"
                          variant="contained"
                        >
                          <Typography variant="h5">
                            <AddCircle />
                            Join Table
                          </Typography>
                        </Button>
                      ) : (
                        <Button
                          onClick={this.joinGame}
                          className={classes.button}
                          color="secondary"
                          variant="contained"
                        >
                          <Typography variant="h5">
                            <AddCircle />
                            Join Table
                          </Typography>
                        </Button>
                      )}

                      {this.state.joined && (
                        <Fragment>
                          <Grid item xs={12}>
                            <Typography align="center" variant="h6">
                              <strong>
                                Current Queue Position: {this.state.currentPos}{" "}
                                out of {this.state.queueLength}
                              </strong>
                            </Typography>
                          </Grid>
                          <Button
                            onClick={this.leaveQueue}
                            color="secondary"
                            variant="contained"
                          >
                            Leave Queue
                          </Button>
                        </Fragment>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                {/* <Paper className={classes.footer} /> */}
                <Chat socket={socket} username={user.nickname} />
              </Grid>
            </Grid>
          </Fragment>
        )}
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(LobbyView);
