const db = require("../models");
var Table = require("../classes/table");
var Player = require("../classes/player");
var Deck = require("../classes/deck");
var io;
const { cloneDeep } = require("lodash");

var serverTable;
var que = [];
var deque = [];
var gameInProgress = false;
var flopOut = false;
var turnOut = false;
var riverOut = false;

module.exports = {
  init: () => {
    if (io && Object.keys(io).length > 0) {
      return;
    }
    io = require("../server");
  },
  // These routes will operate on a virtual table that lives on the server.

  //flash is a route that returns the entire table object, or null if init has not been performed
  flash: (req, res) => {
    if (!serverTable) {
      serverTable = new Table();
    }
    io.emit("FLASH", serverTable);
    res.send();
  },

  // init is a route that will initiate or reset the virtual table. This route is accessed via get or post
  // get will init with defualt values. post will allow for custom values.
  prime: async (req, res) => {
    await prime(req.body);
    res.send();
  },

  //addPlayer is a route that will create a new player and add them to the virtual table. This route is
  //accessed via post with req.body containing name and cash keys.
  addPlayer: async (req, res) => {
    var obj = await addPlayer(req.body);
    res.json(obj);
  },

  //leaveTable will automatically cause a player to fold their current hand and flag the player for removal at the end of the hand
  leaveTable: (req, res) => {
    console.log("Leave Table Server")
    var name = req.params.name;
    var socketId = req.body.id;
    if (name) {
      console.log("Name Block")
      deque.push(req.params.name);
      serverTable.players.forEach((player, index) => {
        if (player.name === req.params.name) {
          console.log("player leaving: ", player);
          db.User.findOneAndUpdate(
            { email: player.email },
            {
              cash: player.cash + player.chips
            }
          ).catch(err => console.log(err));
          io.emit("LEAVETABLE", player);
          placeBet(index, -1);
        }
      });
      return res.send();
    }
    if (socketId && serverTable) {
      console.log("socket block")
      var name = "";
      serverTable.players.forEach((player, index) => {
        if (player.id === socketId) {
          name = player.name;
          deque.push(name);
          db.User.findOneAndUpdate(
            { email: player.email },
            {
              cash: player.cash + player.chips
            }
          ).catch(err => console.log(err));
          io.emit("LEAVETABLE", player);
          placeBet(index, -1);
        }
      });
      return res.send();
    }
    console.log("Error Block")
    return res.send();
  },

  leaveQue: (req, res) => {
    que = que.filter(player => player.name !== req.params.name);
    io.emit("LEAVEQUE", { name: req.params.name, que });
    res.send();
  },

  //To get a players card, do a get request to "/player/:position/cards". This route expects the player position on req.params.position
  getPlayerCards: (req, res) => {
    if (parseInt(req.params.position) < 0) {
      io.emit("ERROR", {
        err: "a player not on the table attempted to retreive their cards",
        req: req.params.position
      });
      return res.send();
    }
    var playerCards = serverTable.players[parseInt(req.params.position)].cards;
    res.json({ playerCards });
  },

  //placeBet adds player money to the pool and updates the player object stored in the players array.
  //this route expects the player.position value on req.params.position and the player bet amount on req.params.amount
  // amounts can be -1 (or any value less than 0 -> this is a fold), 0 (this is a check), amount (any number greater than 0 -> this is a bet or raise)
  placeBet: async (req, res) => {
    const { position: pos, amount: amt } = req.params;

    await placeBet(pos, amt);

    res.send();
  }
};

let fold = pos => {
  serverTable.players[parseInt(pos)].didFold = true;
  serverTable.checkBets();
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[parseInt(pos)].name} folds`,
    style: "#373c77"
  });
  
  if (serverTable.foldedPlayers === serverTable.players.length - 1) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    next(4, true);
    return;
  }

  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });

    next(serverTable.round + 1);
  } else {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[position].bets[round],
      currentBet,
      position,
      pot: serverTable.pot[0]
    });
  }
};

let call = (amount, pos) => {
  serverTable.players[pos].bet(amount, serverTable.round);
  serverTable.collect(amount);
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[pos].name} calls $${amount}`,
    style: "#373c77"
  });
  serverTable.checkBets();
  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    next(serverTable.round + 1);
  } else {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[position].bets[round],
      currentBet,
      position,
      pot: serverTable.pot[0]
    });
  }
};

let bet = (amount, pos) => {
  serverTable.players[pos].bet(amount, serverTable.round);
  serverTable.collect(amount);
  serverTable.currentBet = serverTable.players[pos].bets[serverTable.round];
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[pos].name} bets $${amount}`,
    style: "#373c77"
  });
  serverTable.checkBets();
  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    next(serverTable.round + 1);
  } else {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[position].bets[round],
      currentBet,
      position,
      pot: serverTable.pot[0]
    });
  }
};

let raise = (amount, pos) => {
  serverTable.players[pos].bet(amount, serverTable.round);
  serverTable.collect(amount);
  serverTable.currentBet = serverTable.players[pos].bets[serverTable.round];
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[pos].name} raises the bet to $${serverTable.currentBet}`,
    style: "#373c77"
  });
  serverTable.checkBets();
  serverTable.players[pos].didBet = true;
  const { position, players, currentBet, round } = serverTable;
  io.emit("PLACEBET", {
    players: fetchPlayers(),
    minBet: currentBet - players[position].bets[round],
    currentBet,
    position,
    pot: serverTable.pot[0]
  });
};

let check = pos => {
  serverTable.players[pos].didBet = true;
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[pos].name} checks`,
    style: "#373c77"
  });
  serverTable.checkBets();
  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    next(serverTable.round + 1);
  } else {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[position].bets[round],
      currentBet,
      position,
      pot: serverTable.pot[0]
    });
  }
};

let allIn = pos => {
  var amount = serverTable.players[pos].bet(
    serverTable.players[pos].chips,
    serverTable.round
  );
  serverTable.collect(amount);
  //check the amount against the current bet
  if (amount > serverTable.currentBet) {
    serverTable.currentBet = serverTable.players[pos].bets[serverTable.round];
  }
  io.emit("RECEIVE_MESSAGE", {
    message: `${serverTable.players[pos].name} goes all in!`,
    style: "#373c77"
  });
  serverTable.checkBets();
  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    next(serverTable.round + 1);
  } else {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[position].bets[round],
      currentBet,
      position,
      pot: serverTable.pot[0]
    });
  }
};

let fetchPlayers = () => {
  var playerInfo = cloneDeep(serverTable.players);
  playerInfo.forEach(player => {
    player.cards = undefined;
  });
  return playerInfo;
};

let next = async (round, force = false) => {
  await timer(2000);
  let deckActions = ["deal", "flop", "turn", "river", "payout"];
  switch (deckActions[round]) {
    case "deal":
      await dealCards();
      break;
    case "flop":
      if (!flopOut) {
        await doFlop();
        flopOut = true;
        io.emit("RECEIVE_MESSAGE", {
          style: "#1a643f",
          message: `The Flop has been dealt`
        });
      }
      break;
    case "turn":
      if (!turnOut) {
        await doTurn();
        turnOut = true;
        io.emit("RECEIVE_MESSAGE", {
          style: "#1a643f",
          message: `The Turn has been dealt`
        });
      }
      break;
    case "river":
      if (!riverOut) {
        await doRiver();
        riverOut = true;
        io.emit("RECEIVE_MESSAGE", {
          style: "#1a643f",
          message: `The River has been dealt`
        });
      }

      break;
    case "payout":
      await payout(force);
      io.emit("RECEIVE_MESSAGE", {
        style: "#1a643f",
        message: `The hand is over`
      });
      await prime();
      break;
    default:
      console.log("NEXT DEFAULT REACHED");
  }
  return new Promise(resolve => resolve());
};

let placeBet = async (pos, amt) => {
  const {
    position: tablePos,
    round,
    currentBet,
    players,
    betsIn,
    pot
  } = serverTable;
  let position = parseInt(pos);
  let amount = parseInt(amt);
  if (position < 0) {
    //check to see if all bets are in
    serverTable.checkBetState();
    if (serverTable.betsIn) {
      await next(serverTable.round + 1);
      return new Promise(resolve => resolve());
    }
    if (serverTable.foldedPlayers === serverTable.players.length - 1) {
      next(4, true);
      return new Promise(resolve => resolve());
    }
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      minBet: currentBet - players[tablePos].bets[round],
      currentBet,
      position: tablePos,
      pot: pot[0]
    });
    return new Promise(resolve => resolve());
  }
  if (betsIn) {
    io.emit("ERROR", {
      err: "All bets are in for the current round."
    });
    return new Promise(resolve => resolve());
  }
  var parAmount = currentBet - players[position].bets[round];
  if (amount === players[position].chips) {
    allIn(position);
  } else if (amount < 0) {
    fold(position);
  } else if (amount === 0 && parAmount === 0) {
    check(position);
  } else if (parAmount > amount) {
    //the player bet is too small. throw err
    io.emit("ERROR", {
      err: `Your bet of ${amount} is too low. The action (the minimum to bet) is ${parAmount}`
    });
    return res.send();
  } else if (amount === parAmount) {
    //the player calls
    call(amount, position);
  } else if (amount > parAmount && parAmount === 0) {
    //this is a bet (because parAmount is 0)
    bet(amount, position);
  } else if (amount > parAmount) {
    //or a raise (because parAmount > 0 and amount > parAmount)
    raise(amount, position);
  }
  new Promise(resolve => resolve());
};

let prime = async obj => {
  //check to see that the table exists
  if (!serverTable) {
    //if an object is passed, create a custom table, otherwise create a default table
    if (obj) {
      const { buyIn, bigBlind, smallBlind, autoIncrementBlinds, limit } = obj;
      serverTable = new Table(
        buyIn,
        bigBlind,
        smallBlind,
        autoIncrementBlinds,
        limit
      );
    } else {
      serverTable = new Table();
    }
  } else {
    //the table exists. reset the table for the next round.
    turnOut = false;
    riverOut = false;
    flopOut = false;
    gameInProgress = false;
    serverTable.round = 0;
    serverTable.currentBet = 0;
    serverTable.deck = new Deck();
    serverTable.flop = [];
    serverTable.turn = undefined;
    serverTable.river = undefined;
    serverTable.foldedPlayers = 0;
    serverTable.pot = [0];
    serverTable.betsIn = false;
    serverTable.players.forEach((player, index) => {
      if (player.chips === 0) {
        deque.push(player.name);
      }
      player.position = index;
      player.bets = [0];
      player.didFold = false;
      player.isAllIn = false;
      player.cards = [];
      player.didBet = false;
    });
  }
  deque.forEach(name => {
    serverTable.players.forEach((player, index) => {
      if (player.name === name) {
        if (que.length > 0) {
          serverTable.addPlayer(que.shift(), index);
        } else {
          serverTable.players = serverTable.players.filter(
            value => value.name !== name
          );
        }
      }
      io.emit("LEAVETABLE", { name, player });
    });
  });
  deque = [];
  while (que.length > 0) {
    if (serverTable.players.length === 8) {
      break;
    }
    var player = que.shift();
    serverTable.addPlayer(player);
  }
  serverTable.dealerIndex++;
  if (serverTable.dealerIndex === serverTable.players.length) {
    serverTable.dealerIndex = 0;
  } else if (serverTable.dealerIndex > serverTable.players.length) {
    serverTable.dealerIndex =
      serverTable.dealerIndex - serverTable.players.length;
  }
  if (serverTable.players.length === 1) {
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: "Waiting for another player to join..."
    });
    io.emit("PRIME", {
      players: fetchPlayers(),
      dealerIndex: serverTable.dealerIndex,
      pot: serverTable.pot[0],
      flop: serverTable.flop,
      turn: serverTable.turn,
      river: serverTable.river,
      bigBlind: serverTable.bigBlind
    });
    return new Promise(resolve => resolve());
  }
  if (serverTable.players.length === 0) {
    serverTable = undefined;
    return new Promise(resolve => resolve());
  }

  io.emit("RECEIVE_MESSAGE", {
    style: "#1a643f",
    message: `Starting the next hand...`
  });

  io.emit("PRIME", {
    players: fetchPlayers(),
    dealerIndex: serverTable.dealerIndex,
    pot: serverTable.pot[0],

    flop: serverTable.flop,
    turn: serverTable.turn,
    river: serverTable.river,

    bigBlind: serverTable.bigBlind
  });
  gameInProgress = true;
  next(0);
  return new Promise(resolve => {
    resolve();
  });
};

let addPlayer = async obj => {
  return new Promise(resolve => {
    const { name, cash, img, id, email } = obj;
    var player = new Player(name, parseInt(cash), img, id, email);
    //check to see if the player name exists on the table
    var isAtTable = false;
    var tableIndex = -1;
    if (serverTable) {
      serverTable.players.forEach((p, index) => {
        if (player.name === p.name) {
          isAtTable = true;
          tableIndex = index;
        }
      });
    }
    if (isAtTable) {
      serverTable.players[tableIndex].id = player.id;
      io.emit("PRIME", {
        players: fetchPlayers(),
        dealerIndex: serverTable.dealerIndex,
        pot: serverTable.pot[0]
      });
      return resolve({ que });
    }
    //check to see if a player is in the que
    var inQueue = false;
    var quePos;
    que.forEach((p,index) => {
      if (p.name === player.name){
        inQueue = true;
        quePos = index;
      }
    })
    if(!inQueue){
      quePos = que.length;
      que.push(player);
    }
    io.emit("ADDPLAYER", {
      quePos,
      player,
      que
    });
    if (serverTable && serverTable.players.length > 0 && !gameInProgress) {
      console.log("THIS BLOCK");
      prime();
      return resolve({ quePos, que });
    }
    if (que.length > 1 && !gameInProgress) {
      prime();
      return resolve({ quePos, que });
    }

    resolve({ quePos, que });
  });
};

let dealCards = async () => {
  return new Promise(resolve => {
    if (serverTable.deck.cards.length < 52) {
      io.emit("ERROR", {
        err: "Cards have already been dealt!",
        next:
          "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
      });
      return resolve();
    }
    //make sure there is at least one player at the table
    if (serverTable.players.length === 0) {
      io.emit("ERROR", {
        err:
          "You need to add at least one player to the table before you deal!",
        next: "GET '/api/table/join'",
        expecting: { name: "player name", chips: 200 }
      });
      return resolve();
    }
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: `Collecting the blinds...`
    });
    //collect the blinds from players in the small blind and big blind position.
    var nextPlayer;
    var small = serverTable.dealerIndex + 1;
    if (small >= serverTable.players.length) {
      small = 0;
    }
    if (serverTable.players.length === 2) {
      small = serverTable.dealerIndex;
    }

    var big = small + 1;
    if (big === serverTable.players.length) {
      big = 0;
    }
    io.emit("ERROR", {
      big,
      small
    });
    if (serverTable.players.length === 2) {
      //the dealer is also the small blind
      serverTable.players[small].chips -= serverTable.smallBlind;
      serverTable.players[small].bets[0] += serverTable.smallBlind;
      serverTable.players[big].chips -= serverTable.bigBlind;
      serverTable.players[big].bets[0] += serverTable.bigBlind;
      serverTable.collect(serverTable.smallBlind + serverTable.bigBlind);
      nextPlayer = serverTable.players[small].name;
    } else {
      //there are more than 2 players
      serverTable.players[small].chips -= serverTable.smallBlind;
      serverTable.players[small].bets[0] += serverTable.smallBlind;
      serverTable.players[big].chips -= serverTable.bigBlind;
      serverTable.players[big].bets[0] += serverTable.bigBlind;
      serverTable.collect(serverTable.smallBlind + serverTable.bigBlind);
      var nxt = big + 1;
      if (nxt === serverTable.players.length) {
        nxt = 0;
      }
      nextPlayer = serverTable.players[nxt].name;
    }

    serverTable.currentBet = serverTable.bigBlind;
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: `$${serverTable.smallBlind} from ${serverTable.players[small].name}, $${serverTable.bigBlind} from ${serverTable.players[big].name}`
    });
    //rotate past the dealer.
    var amount = serverTable.dealerIndex + 1;
    for (var i = 0; i < amount; i++) {
      serverTable.rotate();
    }
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: `Dealing cards...`
    });
    serverTable.deal();
    serverTable.restoreOrder();

    //set the stage for betting by setting the table.position value to the player after big blind
    var after = big + 1;
    if (after === serverTable.players.length) {
      after = 0;
    }
    serverTable.position = after;
    io.emit("DEALCARDS", {
      players: fetchPlayers()
    });
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: `Bet is $${serverTable.currentBet} to ${nextPlayer}`
    });
    resolve();
  });
};

let doFlop = async () => {
  return new Promise(resolve => {
    if (serverTable.flop.length === 3) {
      io.emit("ERROR", {
        err: "** The flop has already been dealt",
        next:
          "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/turn'"
      });
      return resolve();
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
    io.emit("DOFLOP", {
      flop
    });
    resolve();
  });
};

let doTurn = async () => {
  return new Promise(resolve => {
    if (serverTable.flop.length < 3) {
      io.emit("ERROR", {
        err: "** The flop has not been dealt",
        next:
          "GET '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/flop'"
      });
      return resolve();
    }
    if (serverTable.turn) {
      io.emit("ERROR", {
        err: "** The turn has already been dealt",
        next:
          "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/river'"
      });
      return resolve();
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
    io.emit("DOTURN", {
      turn
    });
    resolve();
  });
};

let doRiver = async () => {
  return new Promise(resolve => {
    if (!serverTable.turn) {
      io.emit("ERROR", {
        err: "** The turn has not been dealt",
        next:
          "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/turn'"
      });
      return resolve();
    }
    if (serverTable.river) {
      io.emit("ERROR", {
        err: "** The river has already been dealt",
        next:
          "GET '/api/table/cards' OR '/api/player/<position>/cards' OR '/api/table/bet/<amount>' OR '/api/table/hands'"
      });
      return resolve();
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
    io.emit("DORIVER", {
      river
    });
    resolve();
  });
};

let payout = async (force = false) => {
  return new Promise(resolve => {
    if (force) {
      //all but one player has folded
      var payouts = [];
      var hands = [];
      for (var i = 0; i < serverTable.players.length; i++) {
        payouts.push(0);
      }
      serverTable.players.forEach((player, index) => {
        if (!player.didFold) {
          payouts[index] = serverTable.pot[0];
          player.chips += serverTable.pot[0];
          serverTable.pot[0] = 0;
          hands.push({
            cards: player.cards,
            otherCards: [],
            value: 0,
            name: player.name
          });
        }
      });

      io.emit("PAYOUT", {
        players: fetchPlayers(),
        payouts,
        hands,
        pot: serverTable.pot[0]
      });
      prime();
      return resolve();
    }
    var hands = serverTable.findBestHand();

    //calculate the max payout for each player
    for (var i = 0; i < serverTable.players.length; i++) {
      var currentPlayer = serverTable.players[i];
      var payout = 0;
      var count = 0;
      currentPlayer.bets.forEach((bet, index) => {
        if (bet === 0) return;
        count = index;
      });
      var lastBet = currentPlayer.bets[count];
      //sum up all but the last bet
      for (var j = 0; j < count; j++) {
        serverTable.players.forEach(player => {
          payout += player.bets[j];
        });
      }
      //a player's last bet could be an allIn bet
      serverTable.players.forEach(player => {
        var plb = player.bets[count];
        if (plb > lastBet) {
          payout += lastBet;
        } else {
          payout += plb;
        }
      });
      currentPlayer.payout = payout;
    }
    var pot = serverTable.pot[0];
    var payouts = [];
    for (var i = 0; i < serverTable.players.length; i++) {
      payouts.push(0);
    }
    //ranks is an array of arrays of similaraly ranked hands
    var ranks = [];
    for (var i = 1; i < hands[hands.length - 1].rank + 1; i++) {
      var clone = cloneDeep(hands);
      ranks.push(clone.filter(hand => hand.rank === i));
    }
    for (var i = 0; i < ranks.length; i++) {
      var currentRank = ranks[i];
      currentRank.sort(
        (a, b) =>
          serverTable.players[a.playerIndex].payout -
          serverTable.players[b.playerIndex].payout
      );
      while (currentRank.length > 0) {
        var n = currentRank.length;
        var lowestPayout = currentRank.shift();
        var sidePot = serverTable.players[lowestPayout.playerIndex].payout;
        pot -= sidePot;
        serverTable.players.forEach(player => {
          player.payout -= sidePot;
          if (player.payout < 0) {
            player.payout = 0;
          }
        });
        payouts[lowestPayout.playerIndex] += Math.round(sidePot / n);
        currentRank.forEach(rank => {
          payouts[rank.playerIndex] += Math.round(sidePot / n);
        });
      }
      if (pot <= 0) {
        break;
      }
    }

    payouts.forEach((value, index) => {
      serverTable.players[index].chips += value;
    });
    io.emit("PAYOUT", {
      players: fetchPlayers(),
      payouts,
      hands,
      pot
    });
    resolve();
  });
};

let timer = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};
