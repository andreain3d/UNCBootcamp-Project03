import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import Player from "./player";
import TableCard from "./tableCard";

const styles = {
  item: {
    height: "15vh"
  },
  button: {
    margin: 5
  },
  cardContainer: {
    height: 120
  }
};

class Table extends Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    const classes = this.props.classes;
    const { primeTable, nextDeckAction, flop, turn, river } = this.props;
    return (
      <Grid container>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="flex-end">
            <Button color="primary" variant="contained" onClick={primeTable} className={classes.button}>
              Prime Table
            </Button>
            <Button color="primary" variant="contained" onClick={nextDeckAction} className={classes.button}>
              Next Deck Action
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={3}>
            <Grid container className={classes.item}>
              <Grid item xs={12}>
                <Player />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <Player />
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
            <Grid container height={1} className={classes.cardContainer} justify="center" alignItems="center">
              <Typography variant="h6">Pot Value</Typography>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container className={classes.item}>
              <Grid item xs={12}>
                <Player />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <Player />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="center" alignItems="center" className={classes.item}>
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3} />
      </Grid>
    );
  }
}

export default withStyles(styles)(Table);
