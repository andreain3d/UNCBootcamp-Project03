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

    this.BETTING = bet => {
      Axios.get(`api/table/bet/${props.position}/${bet}`).then(res => {
        console.log(res);
      });
    };

    this.DEAL = event => {
      event.preventDefault();
      Axios.get("api/table/deal");
    };

    this.FLOP = event => {
      event.preventDefault();
      Axios.get("api/table/flop");
    };

    this.TURN = event => {
      event.preventDefault();
      Axios.get("api/table/turn");
    };

    this.RIVER = event => {
      event.preventDefault();
      Axios.get("api/table/river");
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
          <Button color="primary" variant="contained" className={classes.button} onClick={() => this.BETTING(-1)}>
            Fold
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={() => this.BETTING(0)}>
            check
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={() => this.BETTING(0)}>
            call
          </Button>
          <Button color="primary" variant="contained" className={classes.button} onClick={() => this.BETTING(0)}>
            raise
          </Button>

          {/* TEST BUTTONS FOR GAME PLAY*/}

          {/* <Button color="primary" variant="contained" className={classes.button} onClick={this.DEAL}>
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
          </Button> */}
        </Grid>
        <Grid container justify="center">
          <input type="range" min="1" max="100" className={classes.slider} id="myRange" />
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Options);
