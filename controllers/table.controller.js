const db = require("../models");
import Table from "../classes/table";
import Player from "../classes/player";

var serverTable;

module.exports = {
  // These routes will operate on a virtual table that lives on the server.

  //flash is a route that returns the entire table object, or null if init has not been performed
  flash: (req, res) => {
    res.json(serverTable || null);
  },
  // init is a route that will initiate or reset the virtual table. This route is accessed via get or post
  // get will init with defualt values. post will allow for custom values.
  init: (req, res) => {
    if (req.body) {
      const { buyIn, bigBlind, smallBlind, autoIncrementBlinds, limit } = req.body;
      serverTable = new Table(buyIn, bigBlind, smallBlind, autoIncrementBlinds, limit);
    } else {
      serverTable = new Table();
    }

    res.json({ message: "Table is set up and ready for players", next: "POST '/api/table/join'", expecting: { name: "player name", cash: 200 } });
  },

  //addPlayer is a route that will create a new player and add them to the virtual table. This route is
  //accessed via post with req.body containing name and cash keys.
  addPlayer: (req, res) => {
    const { name, cash } = req.body;
    var player = new Player(name, cash);
    var position = serverTable.addPlayer(player);
    res.json({
      message: `${player.name}, welcome to api casino! You've been added to the virtual table at position ${position} with ${player.chips} chips.`,
      position: position,
      next: "GET '/api/table/deal'"
    });
  },

  //placeBet adds player money to the pool and updates the player object stored in the players array.
  //this route expects the player.position value on req.params.position and the player bet amount on req.params.amount
  // amounts can be -1 (or any value less than 0 -> this is a fold), 0 (this is a check), amount (any number greater than 0 -> this is a bet or raise)
  placeBet: (req, res) => {
    const { position, amount } = req.params;
    var betAmount = serverTable.limit && parseInt(amount) > serverTable.bigBlind ? serverTable.bigBlind : parseInt(amount);
    var bet = serverTable.players[parseInt(position)].bet(betAmount);
    serverTable.collect(bet);
    res.json({
      message: "You have placed a bet for " + betAmount + " .",
      betAmount,
      remainingChips: serverTable.players[parseInt(position)].chips,
      potTotal: serverTable.pot[0]
    });
  },

  //dealCards will update the player object for each player stored in the players array. Because player cards are private,
  //this route will not return any data.
  dealCards: (req, res) => {
    if (serverTable.players.length === 0) {
      return res.json({
        message: "You need to add at least one player to the table before you deal!",
        next: "GET '/api/table/join'",
        expecting: { name: "player name", chips: 200 }
      });
    }
    if (serverTable.deck.cards.length < 52) {
      return res.json({
        err: "Cards have already been dealt!",
        next: "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
      });
    }

    serverTable.deal();
    res.json({
      message: "Cards have been dealt!",
      next: "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
    });
  },

  //To get a players card, do a get request to "/player/:position/cards". This route expects the player position on req.params.position
  getPlayerCards: (req, res) => {
    var playerCards = serverTable.players[parseInt(req.params.position)].cards;
    res.json({ playerCards });
  },

  //doFlop will burn a card from the deck and then return the next three cards. These cards are store in the flop key of the table object
  doFlop: (req, res) => {
    if (serverTable.flop.length === 3) {
      return res.json({
        err: "The flop has already been dealt",
        next: "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/turn'"
      });
    }
    var flop = serverTable.doFlop();
    res.json({ flop });
  },

  //doTurn will burn a card from the deck and return a single card. This card is stored in the turn key of the table object.
  doTurn: (req, res) => {
    if (serverTable.flop.length < 3) {
      return res.json({
        err: "The flop has not been dealt",
        next: "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
      });
    }
    if (serverTable.turn) {
      return res.json({
        err: "The turn has already been dealt",
        next: "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/river'"
      });
    }
    var turn = serverTable.doTurn();
    res.json({ turn });
  },

  //doRiver will burn a card from the deck and return a single card. This card is stored in the river key of the table object.
  doRiver: (req, res) => {
    if (!serverTable.turn) {
      return res.json({
        err: "The turn has not been dealt",
        next: "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/turn'"
      });
    }
    if (serverTable.river) {
      return res.json({
        err: "The river has already been dealt",
        next: "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/hands'"
      });
    }
    var river = serverTable.doRiver();
    res.json({ river });
  },

  //getTableCards will return all cards from the flop, turn, and river keys of the table object
  getTableCards: (req, res) => {
    var tableCards = [];
    serverTable.flop.forEach(card => {
      tableCards.push(card);
    });
    if (serverTable.turn) {
      tableCards.push(serverTable.turn);
    }
    if (serverTable.river) {
      tableCards.push(serverTable.river);
    }
    res.json({ tableCards });
  },

  //calculateHands uses the findBestHands method on the table object to determine the hand rankings. The entire hands array is returned.
  calculateHands: (req, res) => {
    var hands = serverTable.findBestHand();
    res.json({ hands });
  }
};
