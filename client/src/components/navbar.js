import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";

const styles = {
  grow: {
    flexGrow: 1
  }
};

class Navbar extends Component {
  render(props) {
    const classes = this.props.classes;
    return (
      <AppBar position="static" className={classes.grow}>
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            Poker
          </Typography>
          <Button
            color="inherit"
            variant="contained"
            className={classes.button}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles)(Navbar);
