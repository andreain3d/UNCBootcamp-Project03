import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Table from "./components/table";
import Navbar from "./components/navbar";
import Chat from "./components/Chat/";
import Options from "./components/options";

const styles = {
  grow: {
    flexGrow: 1,
    bottom: 0
  }
};

class App extends Component {
  render() {
    const classes = this.props.classes;
    return (
      <Fragment>
        <Navbar />
        <Table />
        <Grid container className={classes.grow}>
          <Grid item xs={12} md={6}>
            <Options />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chat />
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles)(App);
