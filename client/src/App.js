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
      turn: {},
      river: {},
      hands: [],
      handAction: 0,
      position: 0,
      name: "",
      index: 0
    };
    //socket should be defined at the top level and passed through to the chat, table, and options components
    this.socket = io.connect();

    this.socket.on("ADDPLAYER", data => {
      console.log(data);
    });

    this.socket.on("PRIME", data => {
      var players = data.players;
      players.forEach(player => {
        if (player.name === this.state.name) {
          this.setState({ position: player.position });
        }
      });
      this.setState({ playerInfo: data.players, handAction: 0 });
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
      const { players: playerInfo, currentBet, minBet, position: actionTo } = data;
      //playerInfo just updates the player info in the array. I removed any reference to player cards.
      //currentBet is the amount of the current bet for the round
      //minBet is the amount a player needs to bet in order to "call"
      //if minBet === 0, the buttons should read check, bet, fold
      //else the buttons should read call, raise, fold
      //actionTo is the position value of the next player to bet. At the start of a round of betting, this value will be that of the small blind
      this.setState({ playerInfo, currentBet, minBet, actionTo });
      //if actionTo === this.state.position
      // Start the timer, activate the buttons in options
      console.log(data);
      //at the end of a round of betting, the data received in this listener only contains the playerInfo. All other values will be undefined
      //This implies that currentBet, minBet, and actionTo will only be on the state variable during betting
      //If these values are used to render data, conditional rendering should be used
    });

    this.socket.on("NEXT", data => {
      const { round } = data;
      //round is the NEXT deck action and this listener is only triggered after a round of betting ends.
      //for example, after the deal there is a round of betting. When that round of betting concludes, this
      //listener will receive a value of round = 1;
      let deckActions = ["deal", "flop", "turn", "river", "payout"];
      axios.get("/api/table/" + deckActions[round]);
      //Each of the deck actions fire a listener (DOFLOP, DOTURN, DORIVER)
      //and the subsequent betting rounds are triggered from within the socket listeners
    });

    this.socket.on("LEAVETABLE", data => {
      console.log(data);
      //compare data.name to this.state.name
      //if the same, send to lobby and save data
    });

    this.socket.on("LEAVEQUE", data => {
      console.log(data);
      //compare data.name to this.state.name
      //if same, re-activate join table button
    });
  }

  primeTable = async () => {
    //resets the table UI
    this.setState({ playerCards: [], playerInfo: [], flop: [], turn: {}, river: {}, hands: [], handAction: 0 });
    //build some dummy players
    for (var i = 0; i < 4; i++) {
      await axios.post("/api/table/join", {
        name: `Player_${this.state.index}`,
        cash: 300
      });
      this.state.index++;
    }
    //send the call to the api to prime the table
    await axios.get("/api/table/prime");
  };

  nextDeckAction = () => {
    if (this.state.handAction > 4) {
      console.log("HAND OVER");
      //in here we can call payout
      return;
    }
    let deckActions = ["deal", "flop", "turn", "river", "hands"];
    axios.get("/api/table/" + deckActions[this.state.handAction]).then(res => {
      this.setState({ handAction: this.state.handAction + 1 });
    });
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
              players={this.state.playerInfo}
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
            <LobbyView socket={this.socket} setName={this.setName} />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
