import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Table from "../components/table";
import Navbar from "../components/navbar";
import Chat from "../components/chat";
import Options from "../components/options";

import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";


const styles = {
  grow: {
    flexGrow: 1,
    bottom: 0
  }
};


const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1C2022"
    },
    secondary: amber,
    tertiary: {
      main: "#c62828"
    }
  }
});


class TableView extends Component {
  constructor(props) {
    super(props);
  }

  render(props) {
    const classes = this.props.classes;

    const {
      socket,
      primeTable,
      nextDeckAction,
      flop,
      turn,
      river,
      playerCards,
      players
    } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <Navbar />
        <Table
          players={players}
          socket={socket}
          nextDeckAction={nextDeckAction}
          primeTable={primeTable}
          flop={flop}
          turn={turn}
          river={river}
        />

        <Grid container className={classes.grow}>
          <Grid item xs={12} md={6}>
            <Options socket={socket} cards={playerCards} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chat socket={socket} />
          </Grid>
        </Grid>

      </MuiThemeProvider>

    );
  }
}

export default withStyles(styles)(TableView);
