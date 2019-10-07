import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { amber } from "@material-ui/core/colors";
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
  },
  background: {
    backgroundImage: "radial-gradient(#1a643f, #1a643f, black)"
  }
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
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
  render(props) {
    const classes = this.props.classes;

    const { dealer, pot, socket, primeTable, nextDeckAction, nextBetAction, flop, turn, river, playerCards, players, position } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <Grid container className={classes.background}>
          <Navbar />
          <Table
            dealer={dealer}
            pot={pot}
            players={players}
            socket={socket}
            nextBetAction={nextBetAction}
            nextDeckAction={nextDeckAction}
            primeTable={primeTable}
            flop={flop}
            turn={turn}
            river={river}
            position={position}
          />
          <Grid container className={classes.grow}>
            <Grid item xs={12} md={6}>
              <Options socket={socket} cards={playerCards} position={position} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Chat socket={socket} />
            </Grid>
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(TableView);
