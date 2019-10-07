import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "../react-auth0-wrapper";
import API from "../utils/API";

const LobbyView = ({ setName, socketId }) => {
  const { user, isAuthenticated, loginWithPopup, logout } = useAuth0();
  const joinGame = () => {
    API.getUser(user.email).then(res => {
      setName(res.data.username);
      API.createPlayer({
        name: res.data.username,
        cash: res.data.cash,
        img: res.data.image,
        socketId
      }).then(res => console.log(res));
    });
  };

  return (
    <Fragment>
      <Grid container direction="row" justify="center" alignItems="center">
        {!isAuthenticated && <Button onClick={() => loginWithPopup({})}>Log in</Button>}

        {isAuthenticated && (
          <Button onClick={joinGame}>
            <Link to="/table">Join Game</Link>
          </Button>
        )}
        {isAuthenticated && (
          <Button>
            <Link to="/profile">Profile</Link>
          </Button>
        )}

        {isAuthenticated && <Button onClick={() => logout()}>Log out</Button>}
      </Grid>
    </Fragment>
  );
};

export default LobbyView;
