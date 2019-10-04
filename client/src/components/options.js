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

    // this.BETTING = event => {
    //   event.preventDefault();
    //   Axios.get("api/table/bet/0/0").then(res => {
    //     console.log(res);
    //   });
    // };

    this.DEAL = event => {
      event.preventDefault();
      Axios.get("api/table/deal").then(res => {
        console.log(res);
      });
    };

    this.FLOP = event => {
      event.preventDefault();
      Axios.get("api/table/flop").then(res => {
        console.log(res);
      });
    };

    this.TURN = event => {
      event.preventDefault();
      Axios.get("api/table/turn").then(res => {
        console.log(res);
      });
    };

    this.RIVER = event => {
      event.preventDefault();
      Axios.get("api/table/river").then(res => {
        console.log(res);
      });
    };
  }

  render(props) {
    const classes = this.props.classes;
    const { cards } = this.props;
    return (
      <Paper className={classes.grow}>
        <Typography variant="h6">Your Hand</Typography>
        <Grid container justify="center">
          <PlayerCard src={cards.length > 0 ? cards[0].frontImage : ""} />
          <PlayerCard src={cards.length > 0 ? cards[1].frontImage : ""} />
        </Grid>
        <Grid container justify="center">
          {/* <Button color="primary" variant="contained" className={classes.button} onClick={this.BETTING}>
            Fold
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.BETTING}>
            check
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.BETTING}>
            call
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.BETTING}>
            raise
          </Button> */}

          {/* TEST BUTTONS FOR GAME PLAY*/}

          <Button color="primary" variant="contained" className={classes.button} onClick={this.DEAL}>
            Deal
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.FLOP}>
            Flop
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.TURN}>
            Turn
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={this.RIVER}>
            River
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
