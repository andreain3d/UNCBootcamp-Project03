import React, { Component, Fragment } from "react";
import {
  Paper,
  Typography,
  withStyles,
  Grid,
  Divider
} from "@material-ui/core";

const styles = {
  cards: {
    height: 100,
    width: 70,
    margin: 5
  },
  grid: {
    margin: 10
  }
};

class PlayerHand extends Component {
  render() {
    const classes = this.props.classes;

    return (
      <Fragment>
        <Typography variant="h6">
          {this.props.rank}. {this.props.username}
        </Typography>
        <Grid container justify="center" className={classes.grid}>
          {this.props.cards.map(card => (
            <Paper
              style={{
                backgroundImage: `url(${card.frontImage})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
              }}
              className={classes.cards}
            />
          ))}
          {this.props.otherCards.map(card => (
            <Paper
              style={{
                backgroundImage: `url(${card.frontImage})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
              }}
              className={classes.cards}
            />
          ))}
        </Grid>
        {this.props.rank === "1" ? <Typography>WINNER!</Typography> : ""}
        <Divider />
      </Fragment>
    );
  }
}

export default withStyles(styles)(PlayerHand);
