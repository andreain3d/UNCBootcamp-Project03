import React, { Component, Fragment } from "react";
import { Link, Redirect } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { Auth0Context } from "../react-auth0-wrapper";
import API from "../utils/API";

class LobbyView extends Component {
  static contextType = Auth0Context;

  constructor(props) {
    super(props);
    this.state = {
      currentPos: 999999,
      queueLength: 999999,
      joined: false
    };
    this.socket = this.props.socket;
    this.socket.on("PRIME", () => {
      if (this.state.currentPos <= 8) {
        return (window.location.href = "http://localhost:3000/table");
      }
    });
  }

  joinGame = event => {
    event.preventDefault();
    const { user } = this.context;
    API.getUser(user.email).then(res => {
      this.props.setName(res.data.username);
      API.createPlayer({
        name: res.data.username,
        cash: res.data.cash,
        img: res.data.image,
        socketId: this.props.socketId
      }).then(() => {
        this.socket = this.props.socket;
        this.socket.on("ADDPLAYER", data => {
          console.log("RECEIVING MESSAGE SOCKET");
          if (!this.state.joined) {
            this.setState({
              currentPos: data.quePos + 1,
              queueLength: data.que.length,
              joined: true
            });
          } else {
            this.setState({ queueLength: data.que.length });
          }
        });
      });
    });
  };

  render() {
    const { isAuthenticated, loginWithPopup, logout } = this.context;

    return (
      <Fragment>
        <Grid container direction="row" justify="center" alignItems="center">
          {!isAuthenticated && (
            <Button onClick={() => loginWithPopup({})}>Log in</Button>
          )}

          {isAuthenticated &&
            (this.state.joined ? (
              <Button disabled onClick={this.joinGame}>
                Join Game
              </Button>
            ) : (
              <Button onClick={this.joinGame}>Join Game</Button>
            ))}
          {isAuthenticated && (
            <Button>
              <Link to="/profile">Profile</Link>
            </Button>
          )}

          {isAuthenticated && <Button onClick={() => logout()}>Log out</Button>}
        </Grid>
        <Grid container direction="row" justify="center" alignItems="center">
          {this.state.joined && (
            <h3>
              Current Queue Position: {this.state.currentPos} out of{" "}
              {this.state.queueLength}
            </h3>
          )}
        </Grid>
      </Fragment>
    );
  }
}

export default LobbyView;
