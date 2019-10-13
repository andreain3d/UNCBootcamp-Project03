import React from "react";
import { Link } from "react-router-dom";
import { Button, Grid } from "@material-ui/core";
import { useAuth0 } from "../../react-auth0-wrapper";
import API from "../../utils/API";

const buttonStyle = {
  marginBottom: 25
};

const Profile = () => {
  const { loading, user } = useAuth0();

  const addCash = () => {
    API.getUser(user.email).then(res => {
      API.updateUser(res.data.email, {
        cash: res.data.cash + 1000
      });
    });
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={12}>
        <Grid container justify="center">
          <img src={user.picture} alt="Profile" />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <h2>{user.nickname}</h2>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <p>{user.email}</p>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <Button
            variant="contained"
            color="primary"
            style={buttonStyle}
            onClick={addCash}
          >
            Add $1000 to Account
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <Link to="/">
            <Button variant="contained" color="secondary">
              Back
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Profile;
