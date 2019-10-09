import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Avatar, Grid, Paper } from "@material-ui/core";

const styles = {
  paper: {
    padding: 10,
    borderRadius: "5vh",
    flexGrow: 1,
    margin: 5
  },
  avatar: {
    border: "3px solid #424242"
  },
  active: {
    border: "3px solid #00ff00",
    padding: 10,
    borderRadius: "5vh",
    flexGrow: 1,
    margin: 5
  },
  folded: {
    opacity: 0.5,
    padding: 10,
    borderRadius: "5vh",
    flexGrow: 1,
    margin: 5
  },
  allIn: {
    border: "3px solid #ff6600",
    padding: 10,
    borderRadius: "5vh",
    flexGrow: 1,
    margin: 5
  }
};

class Player extends Component {
  getStyle = (playerInfo, actionTo, classes) => {
    if (playerInfo.didFold) {
      return classes.folded;
    }
    if (playerInfo.isAllIn) {
      return classes.allIn;
    }
    if (playerInfo.position === actionTo) {
      return classes.active;
    }
    return classes.paper;
  };

  render() {
    const classes = this.props.classes;
    const { playerInfo, actionTo } = this.props;
    return (
      <Fragment>
        <Paper className={this.getStyle(playerInfo, actionTo, classes)}>
          <Grid container>
            <Grid item xs={4}>
              <Avatar className={classes.avatar} alt="Player Avatar" src={playerInfo.img ? playerInfo.img : "https://placehold.it/200"} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="body1">{playerInfo.name}</Typography>
              <Typography variant="subtitle1">{playerInfo.chips}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Player);
