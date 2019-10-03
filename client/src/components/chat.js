import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography } from "@material-ui/core";

const styles = {
  grow: {
    flexGrow: 1,
    height: "35vh",
    marginTop: 5
  }
};

class Chat extends Component {
  render(props) {
    const classes = this.props.classes;
    return (
      <Paper className={classes.grow}>
        <Typography variant="h6">Chat</Typography>
      </Paper>
    );
  }
}

export default withStyles(styles)(Chat);
