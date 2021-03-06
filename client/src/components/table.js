import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import Player from "./player";
import TableCard from "./tableCard";
import Token from "./token";

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

  chipsToken = bets => {
    if (bets > 0) {
      return "C";
    } else return "x";
  };

  didFold = (players, position) => {
    return players[position].didFold ? { opacity: "0.5" } : {};
  };

  render(props) {
    const classes = this.props.classes;
    const { dealer, pot, players, nextBetAction, flop, turn, river, actionTo, round } = this.props;

    return (
      <Grid container>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            {players[0] ? <Player playerInfo={players[0]} actionTo={actionTo} /> : null}
            <Grid item xs={12}>
              <Grid container justify="center">
                <Token type={this.getToken(dealer, 0, players)} />
                {players[0] ? <Token type={this.chipsToken(players[0].bets[round])} /> : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            {players[1] ? <Player playerInfo={players[1]} actionTo={actionTo} /> : null}
            <Grid item xs={12}>
              <Grid container justify="center">
                <Token type={this.getToken(dealer, 1, players)} />
                {players[1] ? <Token type={this.chipsToken(players[1].bets[round])} /> : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="flex-end">
            <Button color="inherit" variant="contained" onClick={nextBetAction} className={classes.button}>
              Next Bet Action
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={3}>
            <Grid container className={classes.item}>
              <Grid item xs={11}>
                {players[7] ? <Player playerInfo={players[7]} actionTo={actionTo} /> : null}
              </Grid>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 7, players)} />
                {players[7] ? <Token type={this.chipsToken(players[7].bets[round])} /> : null}
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={11}>
                {players[6] ? <Player playerInfo={players[6]} actionTo={actionTo} /> : null}
              </Grid>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 6, players)} />
                {players[6] ? <Token type={this.chipsToken(players[6].bets[round])} /> : null}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container height={1} className={classes.cardContainer} justify="center" alignItems="center">
              <TableCard src={flop.length > 0 ? flop[0].frontImage : ""} />
              <TableCard src={flop.length > 0 ? flop[1].frontImage : ""} />
              <TableCard src={flop.length > 0 ? flop[2].frontImage : ""} />
              <TableCard src={turn ? turn.frontImage : ""} />
              <TableCard src={river ? river.frontImage : ""} />
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
                {players[2] ? <Token type={this.chipsToken(players[2].bets[round])} /> : null}
              </Grid>
              <Grid item xs={11}>
                {players[2] ? <Player playerInfo={players[2]} actionTo={actionTo} /> : null}
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={1}>
                <Token type={this.getToken(dealer, 3, players)} />
                {players[3] ? <Token type={this.chipsToken(players[3].bets[round])} /> : null}
              </Grid>
              <Grid item xs={11}>
                {players[3] ? <Player playerInfo={players[3]} actionTo={actionTo} /> : null}

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
                  {players[5] ? <Token type={this.chipsToken(players[5].bets[round])} /> : null}
                </Grid>
              </Grid>
              {players[5] ? <Player playerInfo={players[5]} actionTo={actionTo} /> : null}
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify="center" alignItems="center" className={classes.item}>
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Token type={this.getToken(dealer, 4, players)} />
                  {players[4] ? <Token type={this.chipsToken(players[4].bets[round])} /> : null}
                </Grid>
              </Grid>
              {players[4] ? <Player playerInfo={players[4]} actionTo={actionTo} /> : null}
            </Grid>
          </Grid>
          <Grid item xs={3} />
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Table);
