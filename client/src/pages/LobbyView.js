import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "../react-auth0-wrapper";

const LobbyView = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <Fragment>
      <Grid container direction="row" justify="center" alignItems="center">
        {!isAuthenticated && (
          <Button onClick={() => loginWithRedirect({})}>Log in</Button>
        )}

        {isAuthenticated && (
          <Button>
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
