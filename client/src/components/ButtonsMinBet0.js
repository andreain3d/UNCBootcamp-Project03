// WE ONLY NEED THIS IF WE DON'T WANT THE MULTIPLE TERNARIES IN OPTIONS.JS

import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

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

const ButtonsMinBet0 = ({ position, actionTo }) => {
  const classes = this.props.classes;
  return (
    <div>
      <Button
        disabled={position !== actionTo}
        color="primary"
        variant="contained"
        className={classes.button}
        onClick={() => this.BETTING(-1)}
      >
        Fold
      </Button>
      <Button
        disabled={position !== actionTo}
        color="primary"
        variant="contained"
        className={classes.button}
        onClick={() => this.BETTING(0)}
      >
        Check
      </Button>
      <Button
        disabled={position !== actionTo}
        color="primary"
        variant="contained"
        className={classes.button}
        onClick={() => this.BETTING(0)}
      >
        Bet
      </Button>
    </div>
  );
};

export default ButtonsMinBet0;
