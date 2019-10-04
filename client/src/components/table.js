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
  render(props) {
    const classes = this.props.classes;
    return (
      <Grid container>
        <Grid item xs={3} />
        <Grid item xs={3}>
          <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.item}
          >
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.item}
          >
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid container justify="flex-end">
            <Button
              color="primary"
              variant="contained"
              className={classes.button}
            >
              Rules
            </Button>
            <Button
              color="primary"
              variant="contained"
              className={classes.button}
            >
              Hands
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
            <Grid
              container
              height={1}
              className={classes.cardContainer}
              justify="center"
              alignItems="center"
            >
              <TableCard />
              <TableCard />
              <TableCard />
              <TableCard />
              <TableCard />
            </Grid>
            <Grid
              container
              height={1}
              className={classes.cardContainer}
              justify="center"
              alignItems="center"
            >
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
          <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.item}
          >
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3}>
          <Grid
            container
            justify="center"
            alignItems="center"
            className={classes.item}
          >
            <Player />
          </Grid>
        </Grid>
        <Grid item xs={3} />
      </Grid>
    );
  }
}

export default withStyles(styles)(Table);
