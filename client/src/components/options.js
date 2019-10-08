import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Button, Paper, Typography } from "@material-ui/core";
import PlayerCard from "./playerCard";
import axios from "axios";

const styles = {
  grow: {
    flexGrow: 1,
    height: "35vh",
    bottom: 0,
    marginTop: 5,
    background: "#1C2022"
  },
  button: {
    margin: 5
  },
  header: {
    color: "#fff"
  },
  inner: {
    margin: 5,
    padding: 10,
    background: "#D5D5D5"
  }
};

class Options extends Component {
  constructor(props) {
    super(props);

    this.BETTING = bet => {
      axios.get(`api/table/bet/${props.position}/${bet}`).then(res => {
        console.log(res);
      });
    };

    this.DEAL = event => {
      event.preventDefault();
      axios.get("api/table/deal");
    };

    this.FLOP = event => {
      event.preventDefault();
      axios.get("api/table/flop");
    };

    this.TURN = event => {
      event.preventDefault();
      axios.get("api/table/turn");
    };

    this.RIVER = event => {
      event.preventDefault();
      axios.get("api/table/river");
    };
  }

  render(props) {
    const classes = this.props.classes;
    const { cards, socket, position, actionTo, minBet, bigBlind, availableChips } = this.props;

    return (
      <Paper className={classes.grow}>
        <Typography variant="h6" align="center" className={classes.header}>
          Your Hand
        </Typography>
        <Paper className={classes.inner}>
          <Grid container justify="center">
            <PlayerCard src={cards.length > 0 ? cards[0].frontImage : ""} />
            <PlayerCard src={cards.length > 0 ? cards[1].frontImage : ""} />
          </Grid>
          <Grid container justify="center">
            <Button
              disabled={position !== actionTo}
              color="primary"
              variant="contained"
              className={classes.button}
              onClick={() => this.BETTING(-1)}
            >
              Fold
            </Button>
            {minBet === 0 ? (
              <Button
                disabled={position !== actionTo}
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => this.BETTING(0)}
              >
                check
              </Button>
            ) : null}
            {minBet === 0 ? (
              <Button
                disabled={position !== actionTo}
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => this.BETTING(0)}
              >
                Bet
              </Button>
            ) : null}

            {minBet > 0 ? (
              <Button
                disabled={position !== actionTo}
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => this.BETTING({ minBet })}
              >
                Call
              </Button>
            ) : null}

            {minBet > 0 ? (
              <Button
                disabled={position !== actionTo}
                color="primary"
                variant="contained"
                className={classes.button}
                onClick={() => this.BETTING(0)}
              >
                raise
              </Button>
            ) : null}
          </Grid>
          <Grid container justify="center">
            <input type="range" min={bigBlind} max={availableChips} className={classes.slider} id="myRange" />
            <Typography variant="h6">$0.00</Typography>
          </Grid>
        </Paper>
      </Paper>
    );
  }
}

export default withStyles(styles)(Options);
