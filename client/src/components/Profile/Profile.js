import React from "react";
import { Button, Grid } from "@material-ui/core";
import { useAuth0 } from "../../react-auth0-wrapper";

const Profile = () => {
  const { loading, user } = useAuth0();

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
          <h2>{user.name}</h2>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <p>{user.email}</p>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <Button variant="contained" color="secondary" href="/">
            Back
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Profile;
