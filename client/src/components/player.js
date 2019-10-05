import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Avatar, Grid, Paper } from "@material-ui/core";

const styles = {
  paper: {
    padding: 10,
    borderRadius: "5vh",
    flexGrow: 1,
    margin: 5
  },
  avatar: {
    border: "3px solid #424242"
  }
};

class Player extends Component {
  render(props) {
    const classes = this.props.classes;
    return (
      <Fragment>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item xs={4}>
              <Avatar
                className={classes.avatar}
                alt="Player Avatar"
                src="https://placehold.it/200"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="body1">Username</Typography>
              <Typography variant="subtitle1">$0.00</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Player);
