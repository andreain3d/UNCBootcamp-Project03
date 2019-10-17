const db = require("../models");
var Table = require("../classes/table");
var Player = require("../classes/player");
var Deck = require("../classes/deck");
var io;
const { cloneDeep } = require("lodash");

var serverTable;
var que = [];
var gameInProgress = false;
var flopOut = false;
var turnOut = false;
var riverOut = false;
var payoutCalled = false;

module.exports = {
  init: () => {
    if (io && Object.keys(io).length > 0) {
      return;
    }
    io = require("../server");
  },
  // These routes will operate on a virtual table that lives on the server.

  //addPlayer is a route that will create a new player and add them to the virtual table. This route is
  //accessed via post with req.body containing name and cash keys.
  addPlayer: async (req, res) => {
    console.log("*****ADD PLAYER CALLED FROM API*****");
    var obj = await addPlayer(req.body);
    res.json(obj);
  },

  //leaveTable will automatically cause a player to fold their current hand and flag the player for removal at the end of the hand
  leaveTable: async (req, res) => {
    console.log("*****LEAVE TABLE CALLED FROM API*****");
    await leaveTable(req.body.name, req.body.id);
    res.send();
  },

  handleDisconnect: async id => {
    console.log("*****HANDLE DISCONNECT CALLED FROM SOCKET*****");
    await leaveTable(undefined, id);
  },

  leaveQue: (req, res) => {
    console.log("*****LEAVE QUE CALLED FROM API*****");
    que = que.filter(player => player.name !== req.params.name);
    io.emit("LEAVEQUE", { name: req.params.name, que });
    res.send();
  },

  //To get a players card, do a get request to "/player/:position/cards". This route expects the player position on req.params.position
  getPlayerCards: (req, res) => {
    console.log("*****GET PLAYER CARDS CALLED FROM API*****");
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
    console.log("PLACE BET CALLED FROM API*****");
    await placeBet(pos, amt);

    res.send();
  }
};

let fold = pos => {
  console.log("========== FOLD FUNCTION ==========");
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
    console.log(">>>>>>>>calling next(4,true)<<<<<<<<<<<");
    next(4, true);
    console.log("========== END FOLD FUNCTION ==========");
    return;
  }

  const { position, players, currentBet, round, betsIn } = serverTable;
  if (betsIn) {
    io.emit("PLACEBET", {
      players: fetchPlayers(),
      pot: serverTable.pot[0]
    });
    console.log(`>>>>>>>>calling next(${serverTable.round + 1})<<<<<<<<<<<`);
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
  console.log("========== END FOLD FUNCTION ==========");
};

let call = (amount, pos) => {
  console.log("========== CALL FUNCTION ==========");

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
    console.log(`>>>>>>>>calling next(${serverTable.round + 1})<<<<<<<<<<<`);
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
  console.log("========== END CALL FUNCTION ==========");
};

let bet = (amount, pos) => {
  console.log("========== BET FUNCTION ==========");
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
    console.log(`>>>>>>>>calling next(${serverTable.round + 1})<<<<<<<<<<<`);
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
  console.log("========== END BET FUNCTION ==========");
};

let raise = (amount, pos) => {
  console.log("========== RAISE FUNCTION ==========");

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
  console.log("========== END RAISE FUNCTION ==========");
};

let check = pos => {
  console.log("========== CHECK FUNCTION ==========");
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
    console.log(`>>>>>>>>calling next(${serverTable.round + 1})<<<<<<<<<<<`);
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
  console.log("========== END CHECK FUNCTION ==========");
};

let allIn = pos => {
  console.log("========== ALL IN FUNCTION ==========");
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
    console.log(`>>>>>>>>calling next(${serverTable.round + 1})<<<<<<<<<<<`);
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
  console.log("========== END ALL IN FUNCTION ==========");
};

let fetchPlayers = () => {
  var playerInfo = cloneDeep(serverTable.players);
  playerInfo.forEach(player => {
    if (player === null) return;
    player.cards = undefined;
  });
  return playerInfo;
};

let next = async (round, force = false) => {
  console.log("========== NEXT FUNCTION ==========");
  var count = 0;
  serverTable.players.forEach(player => {
    if (player === null) {
      count++;
    }
  });
  if (serverTable.players.length - count === 1) {
    round = 4;
    force = true;
  }
  if (count === serverTable.players.length) {
    serverTable = undefined;
    return new Promise(resolve => resolve());
  }

  let deckActions = ["deal", "flop", "turn", "river", "payout"];
  switch (deckActions[round]) {
    case "deal":
      console.log(">>>>>>>>calling dealCards()<<<<<<<<<<<");
      await dealCards();
      break;
    case "flop":
      if (!flopOut) {
        console.log(">>>>>>>>calling doFlop()<<<<<<<<<<<");
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
        console.log(">>>>>>>>calling doTurn()<<<<<<<<<<<");
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
        console.log(">>>>>>>>calling doRiver()<<<<<<<<<<<");
        await doRiver();
        riverOut = true;
        io.emit("RECEIVE_MESSAGE", {
          style: "#1a643f",
          message: `The River has been dealt`
        });
      }

      break;
    case "payout":
      console.log(`>>>>>>>>calling payout(${force})<<<<<<<<<<<`);
      payout(force);
      io.emit("RECEIVE_MESSAGE", {
        style: "#1a643f",
        message: `The hand is over`
      });
      break;
    default:
      console.log("NEXT DEFAULT REACHED");
  }
  console.log("========== END NEXT FUNCTION ==========");
  return new Promise(resolve => resolve());
};

let placeBet = async (pos, amt) => {
  console.log("========== PLACE BET FUNCTION ==========");
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
  var parAmount = currentBet - players[position].bets[round];

  if (amount === players[position].chips) {
    console.log(`>>>>>>>>calling allIn(${position})<<<<<<<<<<<`);
    allIn(position);
  } else if (amount < 0) {
    console.log(`>>>>>>>>calling fold(${position})<<<<<<<<<<<`);
    fold(position);
  } else if (amount === 0 && parAmount === 0) {
    console.log(`>>>>>>>>calling check(${position})<<<<<<<<<<<`);
    check(position);
  } else if (amount === parAmount) {
    console.log(`>>>>>>>>calling call(${amount}, ${position})<<<<<<<<<<<`);
    call(amount, position);
  } else if (amount > parAmount && parAmount === 0) {
    console.log(`>>>>>>>>calling bet(${amount}, ${position})<<<<<<<<<<<`);
    bet(amount, position);
  } else if (amount > parAmount) {
    console.log(`>>>>>>>>calling raise(${amount}, ${position})<<<<<<<<<<<`);
    raise(amount, position);
  }
  console.log("========== END PLACE BET FUNCTION ==========");
  return new Promise(resolve => resolve());
};

let prime = async obj => {
  console.log("========== PRIME FUNCTION ==========");
  turnOut = false;
  riverOut = false;
  flopOut = false;
  gameInProgress = false;
  payoutCalled = false;
  //check to see that the table exists
  if (!serverTable) {
    if (que.length < 2) {
      console.log("*** too few in the que ***");
      return;
    }
    if (obj) {
      serverTable = new Table(...obj);
    } else {
      serverTable = new Table();
    }

    while (que.length > 0) {
      if (serverTable.players.length === 8) {
        break;
      }
      serverTable.addPlayer(que.shift());
    }
    //update the UI
    io.emit("PRIME", {
      players: fetchPlayers(),
      dealerIndex: serverTable.dealerIndex,
      pot: serverTable.pot[0],
      flop: serverTable.flop,
      turn: serverTable.turn,
      river: serverTable.river,
      bigBlind: serverTable.bigBlind
    });
    await timer(500);
    //send the message
    io.emit("RECEIVE_MESSAGE", {
      style: "#1a643f",
      message: `Starting the next hand...`
    });

    //call next to collect blinds and deal the cards
    console.log(">>>>>>>>calling next(0) at 455<<<<<<<<<<<");
    next(0);
    return new Promise(resolve => resolve());
  } else {
    //the table exists and may contain null players
    //handle the null players first by replacing them with players from the que.
    //map the players array for empty seats (null)
    var emptySeats = [];
    serverTable.players.forEach((player, index) => {
      if (player === null) {
        emptySeats.push(index);
        return;
      }
      if (player.chips === 0) {
        //send them back to the lobby
        leaveTable(player.name);
        emptySeats.push(index);
        return;
      }
    });
    for (var i = 0; i < emptySeats.length; i++) {
      if (que.length === 0) break;
      serverTable.addPlayer(que.shift(), i);
    }

    //now servertable seats have been filled or the que has been emptied or both
    //remove any unfilled seats
    serverTable.players = serverTable.players.filter(player => player !== null);
    console.log(serverTable.players);
    //add any remaining players from the que

    while (que.length > 0) {
      if (serverTable.players.length === 8) {
        break;
      }
      serverTable.addPlayer(que.shift());
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
      console.log("***** 1 player at table *****");
      console.log("========== END PRIME FUNCTION ==========");
      return new Promise(resolve => resolve());
    }
    if (serverTable.players.length === 0) {
      serverTable = undefined;
      io.emit("RECEIVE_MESSAGE", {
        style: "#FF0000",
        message: "Resetting the table and waiting for players..."
      });
      console.log("***** 0 players at table *****");
      console.log("========== END PRIME FUNCTION ==========");
      return new Promise(resolve => resolve());
    }
    //now the que is empty and or the table is full
    //reset values on the table

    serverTable.round = 0;
    serverTable.currentBet = 0;
    serverTable.deck = new Deck();
    serverTable.flop = [];
    serverTable.turn = undefined;
    serverTable.river = undefined;
    serverTable.foldedPlayers = 0;
    serverTable.pot = [0];
    serverTable.betsIn = false;
    //update the player position and data
    serverTable.players.forEach((player, index) => {
      player.position = index;
      player.bets = [0];
      player.didFold = false;
      player.isAllIn = false;
      player.cards = [];
      player.didBet = false;
    });
  }

  //loop over the server table capacity and switch out any null players with incoming players from the que, or append new players to the table
  //we use a button rule where the dealer button alwaus moves to the next player even if they are a new player. Blinds adjust accordingly.
  serverTable.dealerIndex++;
  if (serverTable.dealerIndex === serverTable.players.length) {
    serverTable.dealerIndex = 0;
  } else if (serverTable.dealerIndex > serverTable.players.length) {
    serverTable.dealerIndex =
      serverTable.dealerIndex - serverTable.players.length;
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
  console.log(">>>>>>>>calling next(0) at 564<<<<<<<<<<<");
  next(0);
  console.log("========== END PRIME FUNCTION ==========");
  return new Promise(resolve => {
    resolve();
  });
};

let addPlayer = async obj => {
  console.log("========== ADD PLAYER FUNCTION ==========");
  return new Promise(resolve => {
    const { name, cash, img, id, email } = obj;

    var player = new Player(name, parseInt(cash), img, id, email);

    //check to see if the player name exists on the table
    var isAtTable = false;
    var tableIndex = -1;
    if (serverTable) {
      serverTable.players.forEach((p, index) => {
        if (p === null) {
          return;
        }
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
      console.log("***** player is already at table *****");
      console.log("========== END ADD PLAYER FUNCTION ==========");
      return resolve({ que });
    }
    //check to see if a player is in the que
    var inQueue = false;
    var quePos;
    que.forEach((p, index) => {
      if (p.name === player.name) {
        inQueue = true;
        quePos = index;
      }
    });
    if (!inQueue) {
      quePos = que.length;
      que.push(player);
    }
    io.emit("ADDPLAYER", {
      quePos,
      player,
      que
    });
    if (serverTable && serverTable.players.length > 0 && !gameInProgress) {
      console.log(">>>>>>>>>>calling prime() at 636<<<<<<<<<<");
      prime();
      console.log("***** player waiting at the table *****");
      console.log("========== END ADD PLAYER FUNCTION ==========");
      return resolve({ quePos, que });
    }
    if (que.length > 1 && !gameInProgress) {
      console.log(">>>>>>>>>>calling prime() at 643<<<<<<<<<<");
      prime();
      console.log("***** enough players in the que to start a game *****");
      console.log("========== END ADD PLAYER FUNCTION ==========");
      return resolve({ quePos, que });
    }
    console.log("========== END ADD PLAYER FUNCTION ==========");
    resolve({ quePos, que });
  });
};

let dealCards = async () => {
  await timer(2000);
  console.log("========== DEAL CARDS FUNCTION ==========");
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

    console.log("========== END DEAL CARDS FUNCTION ==========");
    resolve();
  });
};

let doFlop = async () => {
  await timer(2000);
  console.log("========== DO FLOP FUNCTION ==========");
  return new Promise(resolve => {
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
    console.log("========== END DO FLOP FUNCTION ==========");
    resolve();
  });
};

let doTurn = async () => {
  await timer(2000);
  console.log("========== DO TURN FUNCTION ==========");
  return new Promise(resolve => {
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
    console.log("========== END DO TURN FUNCTION ==========");
    resolve();
  });
};

let doRiver = async () => {
  await timer(2000);
  console.log("========== DO RIVER FUNCTION ==========");
  return new Promise(resolve => {
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
    console.log("========== END DO RIVER FUNCTION ==========");
    resolve();
  });
};

let payout = async (force = false) => {
  await timer(2000);
  console.log("========== PAYOUT FUNCTION ==========");
  if (payoutCalled) {
    console.log("*** payout has already been called ***");
    console.log("========== END PAYOUT FUNCTION ==========");
    return;
  }
  payoutCalled = true;
  return new Promise(resolve => {
    var count = 0;
    serverTable.players.forEach(player => {
      if (player === null) {
        count++;
      }
    });
    if (count === serverTable.players.length) {
      serverTable = undefined;
      console.log("*** null table ***");
      console.log("========== END PAYOUT FUNCTION ==========");
      return resolve();
    }
    if (force) {
      //all but one player has folded
      var payouts = [];
      for (var i = 0; i < serverTable.players.length; i++) {
        payouts.push(0);
      }
      serverTable.players.forEach((player, index) => {
        if (player === null) {
          return;
        }
        if (!player.didFold) {
          payouts[index] = serverTable.pot[0];
          player.chips += serverTable.pot[0];
          serverTable.pot[0] = 0;
        }
      });
      io.emit("PAYOUT", {
        players: fetchPlayers(),
        payouts,
        hands,
        pot: serverTable.pot[0]
      });
      console.log(">>>>>>>>>>calling prime() at 863<<<<<<<<<<");
      prime();

      console.log("========== END PAYOUT FUNCTION ==========");
      return resolve();
    } else {
      var hands = serverTable.findBestHand();

      //calculate the max payout for each player
      for (var i = 0; i < serverTable.players.length; i++) {
        var currentPlayer = serverTable.players[i];
        if (currentPlayer === null) {
          continue;
        }
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
            if (player === null) {
              return;
            }
            payout += player.bets[j];
          });
        }
        //a player's last bet could be an allIn bet
        serverTable.players.forEach(player => {
          if (player === null) {
            return;
          }
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
        currentRank.sort((a, b) => {
          serverTable.players[a.playerIndex].payout -
            serverTable.players[b.playerIndex].payout;
        });
        while (currentRank.length > 0) {
          var n = currentRank.length;
          var lowestPayout = currentRank.shift();
          var sidePot = serverTable.players[lowestPayout.playerIndex].payout;
          pot -= sidePot;
          serverTable.players.forEach(player => {
            if (player === null) {
              return;
            }
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
      console.log(payouts);
      payouts.forEach((value, index) => {
        if (serverTable.players[index] === null) {
          return;
        }
        serverTable.players[index].chips += value;
      });
      io.emit("PAYOUT", {
        players: fetchPlayers(),
        payouts,
        hands,
        pot
      });
      console.log(">>>>>>>>>>calling prime() at 963<<<<<<<<<<");
      prime();
      console.log("========== END PAYOUT FUNCTION ==========");
      return resolve();
    }
  });
};

let timer = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

let leaveTable = async (name, id) => {
  if (!serverTable) {
    return;
  }
  console.log("========== LEAVE TABLE FUNCTION ==========");
  if (name) {
    for (var i = 0; i < serverTable.players.length; i++) {
      let player = cloneDeep(serverTable.players[i]);

      if (player.name === name) {
        if (serverTable.players.length > 1) {
          placeBet(i, -1);
        }
        serverTable.players[i] = null;

        await db.User.findOneAndUpdate(
          { email: player.email },
          {
            cash: player.cash + player.chips
          }
        );
        io.emit("LEAVETABLE", player);

        //perform a check on serverTable to count null players
        var count = 0;
        serverTable.players.forEach(player => {
          if (player === null) {
            count++;
          }
        });
        if (count === serverTable.players.length) {
          serverTable = undefined;
          io.emit("RECEIVE_MESSAGE", {
            message: `The table has been reset`,
            style: "#FF0000"
          });
        }
      }
    }
    console.log("========== END LEAVE TABLE FUNCTION ==========");
    return new Promise(resolve => resolve());
  }
  if (id && id !== null && serverTable) {
    for (var i = 0; i < serverTable.players.length; i++) {
      var player = cloneDeep(serverTable.players[i]);
      if(player === null) continue;
      if (player.id === id) {
        if (serverTable.players.length > 1) {
          placeBet(i, -1);
        }
        serverTable.players[i] = null;
        db.User.findOneAndUpdate(
          { email: player.email },
          {
            cash: player.cash + player.chips
          }
        )
          .then(res => {
            io.emit("LEAVETABLE", player);

            //perform a check on serverTable to count null players
            var count = 0;
            serverTable.players.forEach(player => {
              if (player === null) {
                count++;
              }
            });
            if (count === serverTable.players.length) {
              serverTable = undefined;
              io.emit("RECEIVE_MESSAGE", {
                message: `The table has been reset`,
                style: "#FF0000"
              });
            }
            console.log("========== END LEAVE TABLE FUNCTION ==========");
            return new Promise(resolve => resolve());
          })
          .catch(err => {
            io.emit("ERROR", err);
            console.log(err);
          });
      }
    }
  }
};
