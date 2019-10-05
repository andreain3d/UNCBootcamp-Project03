import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import PrivateRoute from "./components/PrivateRoute";
import LobbyView from "./pages/LobbyView";
import TableView from "./pages/TableView";
import ProfileView from "./pages/ProfileView";
import io from "socket.io-client";
import axios from "axios";

class App extends Component {
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
    return (
      <BrowserRouter>
        <Switch>
          <PrivateRoute path="/table">
            <TableView
              socket={this.socket}
              nextDeckAction={this.nextDeckAction}
              primeTable={this.primeTable}
              flop={this.state.flop}
              turn={this.state.turn}
              river={this.state.river}
              playerCards={this.state.playerCards}
            />
          </PrivateRoute>
          <PrivateRoute path="/profile">
            <ProfileView />
          </PrivateRoute>
          <Route path="/">
            <LobbyView socket={this.socket} />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
