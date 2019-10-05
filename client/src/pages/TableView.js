import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Table from "../components/table";
import Navbar from "../components/navbar";
import Chat from "../components/chat";
import Options from "../components/options";
import io from "socket.io-client";
import axios from "axios";

const styles = {
  grow: {
    flexGrow: 1,
    bottom: 0
  }
};

class TableView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playerCards: [],
      flop: [],
      turn: {},
      river: {},
      hands: [],
      action: 0
    };
    //socket should be defined at the top level and passed through to the chat, table, and options components
    this.socket = io.connect();

    this.socket.on("ADDPLAYER", data => {
      console.log(data);
    });

    this.socket.on("PRIME", data => {
      console.log(data);
    });

    this.socket.on("DEALCARDS", data => {
      console.log(data);
      axios.get("/api/player/0/cards").then(res => {
        console.log(res.data.playerCards);
        this.setState({ playerCards: res.data.playerCards });
      });
    });

    this.socket.on("DOFLOP", data => {
      console.log(data);
      this.setState({ flop: data.flop });
    });

    this.socket.on("DOTURN", data => {
      console.log(data);
      this.setState({ turn: data.turn });
    });

    this.socket.on("DORIVER", data => {
      console.log(data);
      this.setState({ river: data.river });
    });

    this.socket.on("CALCULATEHANDS", data => {
      console.log(data);
      this.setState({ hands: data.hands });
    });
  }
  primeTable = async () => {
    for (var i = 0; i < 4; i++) {
      await axios.post("/api/table/join", {
        name: `Player_${i}`,
        cash: 300
      });
    }
    await axios.get("/api/table/prime");
  };

  nextDeckAction = () => {
    if (this.state.action > 4) {
      console.log("HAND OVER");
      return;
    }
    let deckActions = ["deal", "flop", "turn", "river", "hands"];
    axios.get("/api/table/" + deckActions[this.state.action]).then(res => {
      this.setState({ action: this.state.action + 1 });
    });
  };
  render() {
    const classes = this.props.classes;
    return (
      <Fragment>
        <Navbar />
        <Table
          socket={this.socket}
          nextDeckAction={this.nextDeckAction}
          primeTable={this.primeTable}
          flop={this.state.flop}
          turn={this.state.turn}
          river={this.state.river}
        />
        <Grid container className={classes.grow}>
          <Grid item xs={12} md={6}>
            <Options socket={this.socket} cards={this.state.playerCards} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Chat socket={this.socket} />
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default withStyles(styles)(TableView);
