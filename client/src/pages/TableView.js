import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { amber } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import Table from "../components/table";
import Navbar from "../components/navbar";
import Chat from "../components/chat";
import Options from "../components/options";
import EndDialog from "../components/endDialog";
import { Auth0Context } from "../react-auth0-wrapper";

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
    secondary: amber
  }
});

class TableView extends Component {
  static contextType = Auth0Context;
  render(props) {
    const classes = this.props.classes;
    const { user } = this.context;

    const {
      leaveTable,
      dealer,
      pot,
      socket,
      nextBetAction,
      flop,
      turn,
      river,
      playerCards,
      players,
      position,
      actionTo,
      minBet,
      bigBlind,
      hands,
      currentBet,
      playerLeaveTable,
      message,
      allMessages,
      addMessage,
      sendMessage,
      handleInputChange,
      round
    } = this.props;

    if (playerLeaveTable || !user) {
      return <Redirect to="/" />;
    }

    return (
      <MuiThemeProvider theme={theme}>
        <Grid container className={classes.background}>
          <Navbar
            return="true"
            logout="true"
            name={this.props.name}
            cash={this.props.cash}
            leaveTable={leaveTable}
          />
          <Table
            actionTo={actionTo}
            dealer={dealer}
            pot={pot}
            players={players}
            socket={socket}
            nextBetAction={nextBetAction}
            flop={flop}
            turn={turn}
            river={river}
            position={position}
            round={round}
          />
          {hands && hands.length > 0 ? <EndDialog socket={socket} hands={hands} /> : ""}
          <Grid container className={classes.grow}>
            <Grid item xs={12} md={6}>
              <Options
                socket={socket}
                cards={playerCards}
                position={position}
                actionTo={actionTo}
                minBet={minBet}
                bigBlind={bigBlind}
                availableChips={players[position] ? players[position].chips : 0}
                currentBet={currentBet}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Chat
                message={message}
                allMessages={allMessages}
                addMessage={addMessage}
                sendMessage={sendMessage}
                handleInputChange={handleInputChange}
                position={position}
              />
            </Grid>
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(TableView);
