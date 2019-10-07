import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import Player from "./player";
import TableCard from "./tableCard";
import Token from "./token";
import HandDialog from "./hands";

const styles = {
  item: {
    height: "15vh"
  },
  button: {
    margin: 5
  },
  cardContainer: {
    height: 120
  },
  potChips: {
    height: "100px"
  }
};

class Table extends Component {
  getToken = (dealer, position, players) => {
    var small, big;
    if (players.length === 2) {
      small = dealer;
      big = dealer + 1;
      if (big === players.length) {
        big = 0;
      }
    } else {
      small = dealer + 1;
      if (small === players.length) {
        small = 0;
      }
      big = small + 1;
      if (big === players.length) {
        big = 0;
      }
    }
    if (position === dealer) {
      return "D";
    }
    if (position === small) {
      return "SB";
    }
    if (position === big) {
      return "BB";
    }
    return "x";
  };

  didFold = (players, position) => {
    return players[position].didFold ? { opacity: "0.5" } : {};
  };

  render(props) {
    const classes = this.props.classes;
    const { dealer, pot, players, primeTable, nextDeckAction, nextBetAction, flop, turn, river, position } = this.props;
    return (
      <Grid container>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            {players[0] ? <Player playerInfo={players[0]} position={position} style={players[0].didFold ? { opacity: "0.5" } : {}} /> : null}
            <Grid item xs={12}>
              <Grid container justify="center">
                <Token type={this.getToken(dealer, 0, players)} />
                <Token type="x" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            {players[1] ? <Player playerInfo={players[1]} position={position} style={players[1].didFold ? { opacity: "0.5" } : {}} /> : null}
            <Grid item xs={12}>
              <Grid container justify="center">
                <Token type={this.getToken(dealer, 1, players)} />
                <Token type="C" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="flex-end">
            <Button color="inherit" variant="contained" onClick={primeTable} className={classes.button}>
              Prime Table
            </Button>
            <Button color="inherit" variant="contained" onClick={nextDeckAction} className={classes.button}>
              Next Deck Action
            </Button>
            <Button color="inherit" variant="contained" onClick={nextBetAction} className={classes.button}>
              Next Bet Action
            </Button>
            <HandDialog />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={3}>
            <Grid container className={classes.item}>
              <Grid item xs={11}>
                {players[7] ? <Player playerInfo={players[7]} position={position} style={players[7].didFold ? { opacity: "0.5" } : {}} /> : null}
              </Grid>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 7, players)} />
                <Token type="C" />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={11}>
                {players[6] ? <Player playerInfo={players[6]} position={position} style={players[6].didFold ? { opacity: "0.5" } : {}} /> : null}
              </Grid>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 6, players)} />
                <Token type="C" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container height={1} className={classes.cardContainer} justify="center" alignItems="center">
              <TableCard src={flop.length > 0 ? flop[0].frontImage : ""} />
              <TableCard src={flop.length > 0 ? flop[1].frontImage : ""} />
              <TableCard src={flop.length > 0 ? flop[2].frontImage : ""} />
              <TableCard src={Object.keys(turn).length > 0 ? turn.frontImage : ""} />
              <TableCard src={Object.keys(river).length > 0 ? river.frontImage : ""} />
            </Grid>
            <Grid container justify="center" alignItems="center">
              <img className={classes.potChips} alt="Total Pot" src="./assets/img/potChips.png" />
              <Typography variant="h6">{`$${pot}`}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container className={classes.item}>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 2, players)} />
                <Token type="C" />
              </Grid>
              <Grid item xs={11}>
                {players[2] ? <Player playerInfo={players[2]} position={position} style={players[2].didFold ? { opacity: "0.5" } : {}} /> : null}
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 3, players)} />
                <Token type="x" />
              </Grid>
              <Grid item xs={11}>
                {players[3] ? <Player playerInfo={players[3]} position={position} style={players[3].didFold ? { opacity: "0.5" } : {}} /> : null}

                <Grid item xs={12}></Grid>
              </Grid>
              <Grid container>
                <Grid item xs={12}></Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3} />
          <Grid item xs={3}>
            <Grid container justify="center" alignItems="center" className={classes.item}>
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Token type={this.getToken(dealer, 5, players)} />
                  <Token type="x" />
                </Grid>
              </Grid>
              {players[5] ? <Player playerInfo={players[5]} position={position} style={players[5].didFold ? { opacity: "0.5" } : {}} /> : null}
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify="center" alignItems="center" className={classes.item}>
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Token type={this.getToken(dealer, 4, players)} />
                  <Token type="x" />
                </Grid>
              </Grid>
              {players[4] ? <Player playerInfo={players[4]} position={position} style={players[4].didFold ? { opacity: "0.5" } : {}} /> : null}
            </Grid>
          </Grid>
          <Grid item xs={3} />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Table);
