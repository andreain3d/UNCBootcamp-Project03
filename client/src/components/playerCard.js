import React, { Component, Fragment } from "react";
import { Paper } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  paper: {
    height: 100,
    width: 70,
    margin: 5
  }
};

class PlayerCard extends Component {
  render() {
    const classes = this.props.classes;
    return (
      <Fragment>
        <Paper className={classes.paper} />
        <Paper />
        <Paper />
        <Paper />
        <Paper />
      </Fragment>
    );
  }
}

export default withStyles(styles)(PlayerCard);
