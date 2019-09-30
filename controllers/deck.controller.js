const db = require("../models");
import Deck from "../classes/deck";
/**
 * The table model contains the following keys and value types
 * buyIn: Number,  =>The minimum of player cash required to join the table
 * bigBlind: Number, =>The big blind value (defaults to 20 and is not required)
 * smallBlind: Number, =>The small blind value (defaults to 10 and is not required)
 * autoIncrementBlinds: Boolean, =>Affects weather the blinds will automatially increase. Currently defaults to false. More logic required to fully implement
 * limit: Boolean, =>Determines limits on betting (defaults to true and is not required)
 * players: [Object], =>USE THE addPlayer() OR addMultiplePlayers() METHODS TO ADD PLAYERS TO THE TABLE
 * kitty: Number, =>Not required and will be updated through the bet() method.
 * dealerIndex: Number, =>Not required, defaults to 0
 * round: Number, =>Not required, defaults to 0
 * currentBet: Number, =>Not required, is set to the value of bigBlind at the start of gameplay
 * betsIn: Boolean, =>Defaults to false, DO NOT MODIFY MANUALLY. This value is used to track betting logic
 */
var serverDeck = new Deck();
serverDeck.shuffle(10);
module.exports = {
  serveUpDeck: (req, res) => {
    let deck = new Deck();
    res.json(deck);
  },

  serveUpShuffledDeck: (req, res) => {
    let deck = new Deck();
    deck.shuffle(10);
    res.json(deck);
  },

  serveUpRandomCard: (req, res) => {
    serverDeck.shuffle(1);
    res.json({
      card: serverDeck.draw(),
      left: serverDeck.cards.length
    });
  },

  serveUpMultipleCards: (req, res) => {
    var cards = [];
    var n = parseInt(req.params.n);
    for (var i = 0; i < n; i++) {
      cards.push(serverDeck.draw());
    }
    res.json({ cards, left: serverDeck.length });
  },

  newServerDeck: (req, res) => {
    serverDeck = new Deck();
    serverDeck.shuffle();
    res.status(200).send("new deck made and shuffled");
  }
};
