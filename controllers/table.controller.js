const db = require("../models");
import Table from "../classes/table";
import Player from "../classes/player";

var serverTable;
var que = [];

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
    if (!serverTable) {
      return res.json({
        err: "The table has not been set up.",
        next: "/api/table/init"
      });
    }

    const { name, cash } = req.body;
    var player = new Player(name, parseInt(cash));
    if (serverTable.deck.cards.length < 52) {
      var quePosition = que.length;
      que.push(player);
      return res.json({
        message: "There is a hand in progress. You will be added to the table after the current hand ends.",
        quePosition
      });
    }
    var position = serverTable.addPlayer(player);
    if (position < 0) {
      return res.json({
        message: `${player.name}, welcome to api casino! You don't have enough chips to join this table. Your cash (${player.cash}) < the buy in (${serverTable.buyIn})`,
        position: position,
        next: "GET '/api/table/join'",
        expecting: {
          name: "player name",
          cash: serverTable.buyIn
        }
      });
    }
    res.json({
      message: `${player.name}, welcome to api casino! You've been added to the virtual table at position ${position} with ${player.chips} chips.`,
      position: position,
      next: "GET '/api/table/deal'"
    });
  },

  //dealCards will update the player object for each player stored in the players array. Because player cards are private,
  //this route will not return any data.
  dealCards: (req, res) => {
    //check the deck to ensure that cards have not yet been dealt.
    if (serverTable.deck.cards.length < 52) {
      return res.json({
        err: "Cards have already been dealt!",
        next: "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
      });
    }
    //make sure there is at least one player at the table
    if (serverTable.players.length === 0) {
      return res.json({
        err: "You need to add at least one player to the table before you deal!",
        next: "GET '/api/table/join'",
        expecting: { name: "player name", chips: 200 }
      });
    }
    //If only one player, make a bot.
    if (serverTable.players.length === 1) {
      serverTable.addPlayer(new Player("Bot", serverTable.buyIn, true));
    }
    //collect the blinds from players in position 1 and 2 (or position 0 and 1 for a 2 player game).
    if (serverTable.players.length === 2) {
      //the dealer is also the small blind
      serverTable.players[0].chips -= serverTable.smallBlind;
      serverTable.players[0].bets[0] += serverTable.smallBlind;
      serverTable.players[1].chips -= serverTable.bigBlind;
      serverTable.players[1].bets[0] += serverTable.bigBlind;
      serverTable.collect(serverTable.smallBlind + serverTable.bigBlind);
    } else {
      //there are more than 2 players
      serverTable.players[1].chips -= serverTable.smallBlind;
      serverTable.players[1].bets[0] += serverTable.smallBlind;
      serverTable.players[2].chips -= serverTable.bigBlind;
      serverTable.players[2].bets[0] += serverTable.bigBlind;
      serverTable.collect(serverTable.smallBlind + serverTable.bigBlind);
    }
    serverTable.currentBet = serverTable.bigBlind;
    //the player in position 0 is the dealer. rotate past this player before starting the deal.
    serverTable.rotate();
    serverTable.deal();
    serverTable.restoreOrder();
    //set the stage for betting by setting the table.position value to the player after big blind
    if (serverTable.players.length > 3) {
      serverTable.position = 3;
    }
    const { position, players, currentBet, round } = serverTable;
    let playerBet = players[position].bets[round];
    res.json({
      message: "Cards have been dealt! If you are in a betting mood, follow the next key in the betObj",
      next: "GET '/api/player/<position>/cards' OR '/api/table/flop'",
      betObj: {
        next: "/api/table/bet/<position>/<amount>",
        nextPlayer: players[position].name,
        nextBetPosition: serverTable.position,
        action: currentBet - playerBet,
        currentBet,
        playerBet,
        position
      }
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
    //increment the round, toggle betsIn, reset the currentBet value, and reset the didBet value for each player
    serverTable.betsIn = false;
    serverTable.currentBet = 0;
    serverTable.round++;
    serverTable.players.forEach(player => {
      player.didBet = false;
      player.bets.push(0);
    });
    const { position, currentBet, players, round } = serverTable;
    res.json({
      flop,
      message: "The flop has been dealt! If you are in a betting mood, follow the next key in the betObj",
      next: "GET '/api/player/<position>/cards' OR '/api/table/turn'",
      betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
      }
    });
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
    //increment the round, toggle betsIn, reset the currentBet value, and reset the didBet value for each player
    serverTable.betsIn = false;
    serverTable.currentBet = 0;
    serverTable.round++;
    serverTable.players.forEach(player => {
      player.didBet = false;
      player.bets.push(0);
    });
    const { position, currentBet, players, round } = serverTable;
    res.json({
      turn,
      message: "The turn has been dealt! If you are in a betting mood, follow the next key in the betObj",
      next: "GET '/api/player/<position>/cards' OR '/api/table/river'",
      betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
      }
    });
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
    //increment the round, toggle betsIn, reset the currentBet value, and reset the didBet value for each player
    serverTable.betsIn = false;
    serverTable.currentBet = 0;
    serverTable.round++;
    serverTable.players.forEach(player => {
      player.didBet = false;
      player.bets.push(0);
    });
    const { position, currentBet, players, round } = serverTable;
    res.json({
      river,
      message: "The river has been dealt! If you are in a betting mood, follow the next key in the betObj",
      next: "GET '/api/player/<position>/cards' OR '/api/table/hands'",
      betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
      }
    });
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
  },

  //placeBet adds player money to the pool and updates the player object stored in the players array.
  //this route expects the player.position value on req.params.position and the player bet amount on req.params.amount
  // amounts can be -1 (or any value less than 0 -> this is a fold), 0 (this is a check), amount (any number greater than 0 -> this is a bet or raise)
  placeBet: (req, res) => {
    const { position: pos, amount: amt } = req.params;
    const { position: tablePos, round, currentBet, players, betsIn, next } = serverTable;
    let position = parseInt(pos);
    let amount = parseInt(amt);
    if (betsIn) {
      return res.json({
        err: "All bets are in for the current round.",
        next: `/api/table/${next[round]}`
      });
    }
    if (position !== tablePos) {
      return res.json({
        err: `It's not your turn to bet. Betting is on the player at position ${tablePos} and the currentBet is ${currentBet}`,
        betObj: {
          betObj: {
            next: "/api/table/bet/<position>/<amount>",
            nextPlayer: players[tablePos].name,
            nextBetPosition: tablePos,
            action: currentBet - players[position].bets[round],
            currentBet,
            playerBet: players[position].bets[round],
            position: tablePos
          }
        }
      });
    }
    //check the bet amount against the current bet.
    //the table expects a bet that will, at minimum, bring the player to par with the current total bet.
    var parAmount = currentBet - players[position].bets[round];
    console.log("PARAMOUNT", parAmount);
    var betObj;
    if (amount < 0) {
      betObj = fold(position);
    } else if (amount === 0 && parAmount === 0) {
      betObj = check(position);
    } else if (parAmount > amount) {
      //the player bet is too small. throw err
      return res.json({
        err: `Your bet of ${amount} is too low. The action (the minimum to bet) is ${parAmount}`,
        betObj: {
          next: "/api/table/bet/<position>/<amount>",
          nextPlayer: players[tablePos].name,
          nextBetPosition: tablePos,
          action: currentBet - players[position].bets[round],
          currentBet,
          playerBet: players[position].bets[round],
          position: tablePos
        }
      });
    } else if (amount === parAmount) {
      //the player calls
      betObj = call(amount, position);
    } else if (amount > parAmount && parAmount === 0) {
      //this is a bet (because parAmount is 0)
      betObj = bet(amount, position);
    } else if (amount > parAmount) {
      //or a raise (because parAmount > 0 and amount > parAmount)
      betObj = raise(amount, position);
    } else {
      console.log("FALLOUT", amount, position);
    }

    res.json({
      message: "You have placed a bet for " + amount + " chips.",
      remainingChips: serverTable.players[position].chips,
      potTotal: serverTable.pot[0],
      betObj
    });
  }
};

//private method for handling bets
let fold = pos => {
  console.log("FOLD METHOD");
  serverTable.players[parseInt(pos)].didFold = true;
  serverTable.foldedPlayers++;
  var remainingChips = serverTable.players[parseInt(pos)].chips;
  serverTable.checkBets();
  if (serverTable.betsIn && serverTable.foldedPlayers === serverTable.players.length - 1) {
    serverTable.round = 5;
    return {
      playerAction: "fold",
      remainingChips,
      message: "all players have folded",
      next: `/api/table/${serverTable.next[serverTable.round]}`
    };
  }
  const { next, position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    return {
      playerAction: "fold",
      remainingChips,
      message: "all bets are in",
      next: `/api/table/${next[round + 1]}`
    };
  } else {
    return {
      playerAction: "fold",
      remainingChips,
      next: `/api/table/bet/${position}/<amount>`,
      nextPlayer: players[position].name,
      nextBetPosition: position,
      action: currentBet - players[position].bets[round],
      currentBet: currentBet,
      playerBet: players[position].bets[round],
      position: position
    };
  }
};

let call = (amount, pos) => {
  console.log("CALL METHOD");
  serverTable.players[pos].bet(amount, serverTable.round);
  var remainingChips = serverTable.players[pos].chips;
  serverTable.collect(amount);
  serverTable.checkBets();
  const { next, position, players, currentBet, round } = serverTable;
  if (serverTable.betsIn) {
    return {
      playerAction: "call",
      remainingChips,
      message: "all bets are in",
      next: `/api/table/${next[round + 1]}`
    };
  } else {
    return {
      playerAction: "call",
      remainingChips,
      next: `/api/table/bet/${position}/<amount>`,
      nextPlayer: players[position].name,
      nextBetPosition: position,
      action: currentBet - players[position].bets[round],
      currentBet: currentBet,
      playerBet: players[position].bets[round],
      position: position
    };
  }
};

let bet = (amount, pos) => {
  console.log("BET METHOD");
  serverTable.players[pos].bet(amount, serverTable.round);
  var remainingChips = serverTable.players[pos].chips;
  serverTable.collect(amount);
  serverTable.currentBet = amount;
  serverTable.checkBets();
  const { next, position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    return {
      playerAction: "bet",
      remainingChips,
      message: "all bets are in",
      next: `/api/table/${next[round + 1]}`
    };
  } else {
    return {
      playerAction: "bet",
      remainingChips,
      next: `/api/table/bet/${position}/<amount>`,
      nextPlayer: players[position].name,
      nextBetPosition: position,
      action: currentBet - players[position].bets[round],
      currentBet: currentBet,
      playerBet: players[position].bets[round],
      position: position
    };
  }
};

let raise = (amount, pos) => {
  console.log("RAISE METHOD");
  serverTable.players[pos].bet(amount, serverTable.round);
  var remainingChips = serverTable.players[pos].chips;
  serverTable.collect(amount);
  serverTable.currentBet = amount;
  serverTable.checkBets();
  const { position, players, currentBet, round } = serverTable;
  return {
    playerAction: "raise",
    remainingChips,
    next: `/api/table/bet/${position}/<amount>`,
    nextPlayer: players[position].name,
    nextBetPosition: position,
    action: currentBet - players[position].bets[round],
    currentBet: currentBet,
    playerBet: players[position].bets[round],
    position: position
  };
};

let check = pos => {
  console.log("CHECK METHOD");
  serverTable.players[pos].didBet = true;
  var remainingChips = serverTable.players[pos].chips;
  serverTable.checkBets();
  const { next, position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    return {
      playerAction: "check",
      remainingChips,
      message: "all bets are in",
      next: `/api/table/${next[round + 1]}`
    };
  } else {
    return {
      playerAction: "check",
      remainingChips,
      next: `/api/table/bet/${position}/<amount>`,
      nextPlayer: players[position].name,
      nextBetPosition: position,
      action: currentBet - players[position].bets[round],
      currentBet: currentBet,
      playerBet: players[position].bets[round],
      position: position
    };
  }
};
