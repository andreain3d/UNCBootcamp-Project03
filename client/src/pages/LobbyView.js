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
    const { isAuthenticated, loginWithPopup, logout } = this.context;

    if (this.state.prime) {
      return <Redirect to="/table" />;
    }

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
            <div>
              <h3>
                Current Queue Position: {this.state.currentPos} out of{" "}
                {this.state.queueLength}
              </h3>
              <Button onClick={this.leaveQueue}>Leave Queue</Button>
            </div>
          )}
        </Grid>
      </Fragment>
    );
  }
}

export default LobbyView;
