import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Button, Paper, Typography } from "@material-ui/core";
import PlayerCard from "./playerCard";
import Axios from "axios";

const styles = {
  grow: {
    flexGrow: 1,
    height: "35vh",
    bottom: 0,
    marginTop: 5
  },
  button: {
    margin: 5
  }
};

class Options extends Component {
  constructor(props) {
    super(props);

    this.FLASHCALL = event => {
      event.preventDefault();
      Axios.get("api/table");
    };
  }

  render(props) {
    const classes = this.props.classes;
    return (
      <Paper className={classes.grow}>
        <Typography variant="h6">Your Hand</Typography>
        <Grid container justify="center">
          <PlayerCard />
          <PlayerCard />
        </Grid>
        <Grid container justify="center">
          <Button color="primary" variant="contained" className={classes.button} onClick={this.FLASHCALL}>
            Fold
          </Button>
          <Button color="primary" variant="contained" className={classes.button}>
            call
          </Button>
          <Button color="primary" variant="contained" className={classes.button}>
            raise
          </Button>
        </Grid>
        <Grid container justify="center">
          <input type="range" min="1" max="100" className={classes.slider} id="myRange" />
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Options);
