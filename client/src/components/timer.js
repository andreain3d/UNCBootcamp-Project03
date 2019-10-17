import React, { Component, Fragment } from "react";
import {
  withStyles,
  Grid,
  LinearProgress,
  Typography
} from "@material-ui/core";
import axios from "axios";

const styles = {
  root: {
    flexGrow: 1
  },
  timerContainer: {
    height: "32px"
  }
};

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      completed: 100,
      timeLeft: 45
    };

    this.BETTING = bet => {
      axios.get(`api/table/bet/${props.position}/${bet}`);
    };
  }

  componentDidMount() {
    this.timer = setInterval(this.progress, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  progress = () => {
    const { completed, timeLeft } = this.state;
    if (completed === 0) {
      this.setState({ timeLeft: 0 });
      this.props.setAutoFolds(this.props.autoFolds + 1);
      this.BETTING(-1);
    } else {
      const diff = 2.3;
      this.setState({
        completed: Math.max(completed - diff, 0),
        timeLeft: timeLeft - 1
      });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Grid item xs={6}>
          <div className={classes.root}>
            <LinearProgress
              color="secondary"
              variant="determinate"
              value={this.state.completed}
            />
          </div>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h6">{this.state.timeLeft}</Typography>
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles)(Timer);
