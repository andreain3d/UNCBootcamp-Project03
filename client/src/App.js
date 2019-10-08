import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
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
      playerInfo: [],
      flop: [],
      hands: [],
      pot: 0,
      handAction: 0,
      position: 0,
      name: "",
      index: 0,
      dealerIndex: 0,
      socketId: ""
    };
    //socket should be defined at the top level and passed through to the chat, table, and options components
    this.socket = io.connect();
    this.socket.on("connect", () => {
      this.setState({ socketId: this.socket.id });
      //update the user object
    });
    this.socket.on("ADDPLAYER", data => {
      const { que, quePos } = data;
      console.log(que, quePos);
    });

    this.socket.on("PRIME", data => {
      console.log("PRIME");
      var players = data.players;
      players.forEach(player => {
        if (player.name === this.state.name) {
          this.setState({ position: player.position });
        }
      });
      const { players: playerInfo, dealerIndex, flop, turn, river } = data;
      this.setState({ playerInfo, handAction: 0, dealerIndex, flop, turn, river });
    });

    this.socket.on("DEALCARDS", data => {
      axios.get(`/api/player/${this.state.position}/cards`).then(res => {
        this.setState({ playerCards: res.data.playerCards });
        //a call to the bet route to return player and betting data
        //this call triggers the betting actions on the front end
        axios.get("/api/table/bet/-1/0");
      });
    });

    this.socket.on("DOFLOP", data => {
      this.setState({ flop: data.flop });
      //a call to the bet route to return player and betting data
      //this call triggers the betting actions on the front end
      axios.get("/api/table/bet/-1/0");
    });

    this.socket.on("DOTURN", data => {
      this.setState({ turn: data.turn });
      //a call to the bet route to return player and betting data
      //this call triggers the betting actions on the front end
      axios.get("/api/table/bet/-1/0");
    });

    this.socket.on("DORIVER", data => {
      this.setState({ river: data.river });
      //a call to the bet route to return player and betting data
      //this call triggers the betting actions on the front end
      axios.get("/api/table/bet/-1/0");
    });

    this.socket.on("CALCULATEHANDS", data => {
      this.setState({ hands: data.hands });
    });

    this.socket.on("PLACEBET", data => {
      const { players: playerInfo, currentBet, minBet, position: actionTo, pot } = data;
      //playerInfo just updates the player info in the array. I removed any reference to player cards.
      //currentBet is the amount of the current bet for the round
      //minBet is the amount a player needs to bet in order to "call"
      //if minBet === 0, the buttons should read check, bet, fold
      //else the buttons should read call, raise, fold
      //actionTo is the position value of the next player to bet. At the start of a round of betting, this value will be that of the small blind
      this.setState({ playerInfo, currentBet, minBet, actionTo, pot });
      //if actionTo === this.state.position
      // Start the timer, activate the buttons in options
      console.log("Next bet is " + minBet + " to the player at position " + actionTo);
      //at the end of a round of betting, the data received in this listener only contains the playerInfo. All other values will be undefined
      //This implies that currentBet, minBet, and actionTo will only be on the state variable during betting
      //If these values are used to render data, conditional rendering should be used
    });

    this.socket.on("LEAVETABLE", data => {
      console.log(data);
      //compare data.name to this.state.name
      //if the same, send to lobby and save data
      if (data.name === this.state.name) {
        window.location.href = "/";
      }
    });

    this.socket.on("LEAVEQUE", data => {
      console.log(data);
      //compare data.name to this.state.name
      //if same, re-activate join table button
    });

    this.socket.on("PAYOUT", data => {
      const { players: playerInfo, pot, hands, payouts } = data;
      this.setState({ playerInfo, pot });
      console.log(hands);
      console.log(payouts);
    });

    this.socket.on("ERROR", data => {
      console.log("=============ERROR=============");
      console.log(data);
      console.log("==============END==============");
    });
  }

  nextBetAction = () => {
    if (this.state.actionTo === undefined) {
      return;
    }
    axios.get(`/api/table/bet/${this.state.actionTo}/${this.state.minBet}`);
  };

  leaveTable = () => {
    console.log("LEAVE");
    axios.get("/api/table/leave/" + this.state.name);
  };

  setName = name => {
    this.setState({ name: name });
  };

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <PrivateRoute path="/table">
            <TableView
              actionTo={this.state.actionTo}
              leaveTable={this.leaveTable}
              pot={this.state.pot}
              nextBetAction={this.nextBetAction}
              players={this.state.playerInfo}
              socket={this.socket}
              flop={this.state.flop}
              turn={this.state.turn}
              river={this.state.river}
              playerCards={this.state.playerCards}
              position={this.state.position}
              dealer={this.state.dealerIndex}
            />
          </PrivateRoute>
          <PrivateRoute path="/profile">
            <ProfileView />
          </PrivateRoute>
          <Route path="/">
            <LobbyView socket={this.socket} setName={this.setName} socketId={this.state.socketId} />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
