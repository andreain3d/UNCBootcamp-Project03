//as a constructor
var Deck = require("./deck");
const { sum, sumBy, isEqual, cloneDeep } = require("lodash");

function Table(
  buyIn = 200,
  bigBlind = 12,
  smallBlind = 6,
  autoIncrementBlinds = false,
  limit = true
) {
  this.buyIn = buyIn;
  this.bigBlind = bigBlind;
  this.smallBlind = smallBlind;
  this.autoIncrementBlinds = autoIncrementBlinds;
  this.limit = limit;
  this.players = [];
  this.pot = [0];
  this.deck = new Deck();
  this.flop = [];
  this.turn;
  this.river;
  this.dealerIndex = 0;
  this.round = 0;
  this.currentBet = 0;
  this.position = 0;
  this.betsIn = false;
  this.foldedPlayers = 0;
  this.allInPlayers = 0;

  this.rotate = () => {
    this.players.push(this.players.shift());
  };

  this.restoreOrder = () => {
    this.players.sort((a, b) => a.position - b.position);
  };

  this.checkBets = () => {
    //loop through the players array and compare each players bet to the current bet value.
    //If a player has folded, increment the folds variable and continue
    //If all players have bets in or have folded and at least two players remain in the hand,
    //update the betsIn and the round values and return.
    //If all but one player has folded, update the betsIn and round values and return
    var count = 0;
    var folds = 0;
    var allIns = 0;
    var nulls = 0;
    this.players.forEach(player => {
      if (player === null) {
        nulls++;
        return;
      }
      if (player.didFold) {
        return folds++;
      }
      if (player.isAllIn) {
        allIns++;
      }
      if (
        player.didBet &&
        (player.bets[this.round] === this.currentBet || player.isAllIn)
      ) {
        return count++;
      }
      if (player.bets[this.round] < this.currentBet) {
        player.didBet = false;
      }
    });
    this.allInPlayers = allIns;
    this.foldedPlayers = folds;
    if (count + folds + nulls === this.players.length) {
      this.betsIn = true;
      //reset the betting position to the small blind
      if (this.players.length === 2) {
        this.position = this.dealerIndex;
        if (this.position === this.players.length) {
          this.position = 0;
        }
      } else {
        this.position = this.dealerIndex + 1;
        if (this.position === this.players.length) {
          this.position = 0;
        }
      }
    } else {
      this.shift();
    }
  };

  this.checkBetState = () => {
    var count = 0;
    var folds = 0;
    var allIns = 0;
    var nulls = 0;
    this.players.forEach(player => {
      // console.log(...player.bets);
      // console.log(player.didBet);
      if (player === null) {
        nulls++;
        return;
      }
      if (player.didFold) {
        return folds++;
      }
      if (player.isAllIn) {
        allIns++;
      }
      if (
        player.didBet &&
        (player.bets[this.round] === this.currentBet || player.isAllIn)
      ) {
        return count++;
      }
      if (player.bets[this.round] < this.currentBet) {
        player.didBet = false;
      }
    });
    this.allInPlayers = allIns;
    this.foldedPlayers - folds;
    if (count + folds + nulls === this.players.length) {
      this.betsIn = true;
    }
    if (this.allInPlayers + nulls >= this.players.length - 1) {
      this.betsIn = true;
    }
    return;
  };

  this.shift = () => {
    // console.log("shifting...");
    this.position++;
    if (this.position === this.players.length) {
      this.position = 0;
    }
    if (this.players[this.position] === null) {
      return;
    }
    if (
      this.players[this.position].didFold ||
      this.players[this.position].isAllIn
    ) {
      this.shift();
    }
  };

  this.collect = bet => {
    this.pot[0] += bet;
  };

  this.addPlayer = (player, pos) => {
    if (player.cash < this.buyIn) {
      // console.log("you don't have enough chips to join this table");
      return -1;
    }
    player.cash -= this.buyIn;
    player.chips = this.buyIn;
    if (pos) {
      player.position = pos;
      this.players[pos] = player;
    } else {
      player.position = this.players.length;
      this.players.push(player);
    }
    return player.position;
  };

  this.payOut = (player, value) => {
    player.chips(value);
  };

  this.deal = (iter = 10) => {
    this.deck.shuffle(iter);
    for (var i = 0; i < 2; i++) {
      this.players.forEach(player => {
        var card = this.deck.draw();
        if (!player.bot) {
          card.flip();
        }
        player.cards.push(card);
      });
    }
  };

  this.doFlop = () => {
    //burn a card
    this.deck.draw();
    for (var i = 0; i < 3; i++) {
      var card = this.deck.draw();
      card.flip();
      this.flop.push(card);
    }
    return this.flop;
  };

  this.doTurn = () => {
    //burn a card
    this.deck.draw();
    this.turn = this.deck.draw();
    this.turn.flip();
    return this.turn;
  };

  this.doRiver = () => {
    //burn a card
    this.deck.draw();
    this.river = this.deck.draw();
    this.river.flip();
    return this.river;
  };

  this.findBestHand = () => {
    var hands = [];
    //this method will throw an error if cards have not been dealt and the turn, flop, and river methods have not run.
    //loop over every player and make the best possible hand
    this.players.forEach((player, index) => {
      if (player.didFold || player === null) {
        return;
      }
      var cards = [...player.cards, ...this.flop, this.turn, this.river];
      console.log(cards);
      // console.log(
      //   `FINDBESTHAND CARDS ARRAY FOR ${player.name} IN POSITION ${index}: `,
      //   cards.length
      // );
      // cards.push.apply(cards, player.cards);
      // cards.push.apply(cards, this.flop);
      // cards.push(this.turn);
      // cards.push(this.river);
      //sort the cards sequentially, smallest to largest
      cards.sort((a, b) => a.value - b.value);
      var hand = bestHand(cards);
      hand.player = player.name;
      hand.playerIndex = index;
      var otherValue = 0;
      hand.otherCards.forEach(card => {
        otherValue += card.value;
      });
      hand.totalValue = hand.value + otherValue;
      hands.push(hand);
    });
    hands.sort((a, b) => {
      if (a.index !== b.index) {
        return b.index - a.index;
      }
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      for (var i = 0; i < a.otherCards.length; i++) {
        if (a.otherCards[i].value !== b.otherCards[i].value) {
          return b.otherCards[i].value - a.otherCards[i].value;
        }
      }
      return 0;
    });
    //determine hand rankings
    var rank = 1;
    hands[0].rank = rank;
    for (var i = 1; i < hands.length; i++) {
      if (
        hands[i].index === hands[i - 1].index &&
        hands[i].totalValue === hands[i - 1].totalValue
      ) {
        hands[i].rank = rank;
      } else {
        rank++;
        hands[i].rank = rank;
      }
    }
    return hands;
  };
}

const bestHand = cards => {
  var straight = [];
  var flush = [];
  var groupings = 0;
  var groupsize = [];
  var groups = [];
  //find the largest straight
  var justPushed = false;
  for (var i = 0; i < 6; i++) {
    if (cards[i].value === cards[i + 1].value - 1) {
      straight.push(cards[i]);
      justPushed = true;
    } else {
      if (justPushed) {
        straight.push(cards[i]);
        justPushed = false;
      }
      if (straight.length < 5) {
        straight = [];
      }
    }
    if (i === 5 && justPushed) {
      straight.push(cards[6]);
    }
  }
  if (straight.length >= 5) {
    while (straight.length > 5) {
      straight.shift();
    }
  } else {
    straight = [];
  }
  //count up cards of the same suit
  //suitCount is an array that stores the number of cards that have each suit and
  var suits = ["diamond", "heart", "club", "spade"];
  var suitCount = [0, 0, 0, 0];
  cards.forEach(card => {
    var suit = card.suit;
    suitCount[suits.indexOf(suit)]++;
  });
  //look for a flush
  for (var i = 0; i < suitCount.length; i++) {
    if (suitCount[i] >= 5) {
      cards.forEach(card => {
        if (card.suit === suits[i]) {
          flush.push(card);
        }
      });
    }
  }
  while (flush.length > 5) {
    flush.shift();
  }

  //look for groupings (pairs, 3ofakind, 4ofakind, full house)
  var clone = cloneDeep(cards);
  cards.forEach(card => {
    var group = clone.filter(val => val.value === card.value);
    if (group.length > 1) {
      groupsize.push(group.length);
      groups.push(group);
      groupings++;
    }
    clone = clone.filter(val => val.value !== card.value);
  });

  //figure out the wining hand
  var hand = {
    cards: [],
    otherCards: [],
    value: 0,
    name: ""
  };
  //begin checking the possible hands top down
  //check for royal flush
  if (
    straight.length === 5 &&
    flush.length === 5 &&
    isEqual(straight, flush) &&
    sumBy(flush, "value") === 60
  ) {
    hand.cards = flush;
    hand.value = 60;
    hand.name = "Royal Flush";
    hand.index = 9;
    return hand;
  }

  //check for straight flush
  if (straight.length === 5 && isEqual(straight, flush)) {
    hand.cards = flush;
    hand.value = sumBy(flush, "value");
    hand.name = "Straight Flush";
    hand.index = 8;
    return hand;
  }

  //check for 4 of a kind
  if (groupsize.includes(4)) {
    //find the highest card not in the group
    var cardstokeep = groups.filter(val => val.length === 4);
    hand.cards = cardstokeep[0];
    var groupvalue = hand.cards[0].value;
    hand.otherCards = cards.filter(val => val.value !== groupvalue).pop();
    hand.value = sumBy(hand.cards, "value");
    hand.name = "4 of a Kind";
    hand.index = 7;
    return hand;
  }

  //check for full house
  if (groupsize.includes(3) && groupings >= 2) {
    //examine the case where the player has two groups of 3 cards
    if (sum(groupsize) === 6) {
      //groupsize = [3,3]
      var group1 = groups[0];
      var group2 = groups[1];
      if (group1[0].value > group2[0].value) {
        group2.shift();
        hand.cards = group1.concat(group2);
      } else {
        group1.shift();
        hand.cards = group2.concat(group1);
      }
    } else if (sum(groupsize) === 7) {
      //groupsize = [3,2,2] or some permutation
      var cardstokeep = groups.filter(val => val.length === 3);
      hand.cards.push.apply(hand.cards, cardstokeep[0]);
      var twos = groups.filter(val => val.length === 2);
      var group2 = twos[0];
      var group3 = twos[1];
      if (group2[0].value > group3[0].value) {
        hand.cards.push.apply(hand.cards, group2);
      } else {
        hand.cards.push.apply(hand.cards, group3);
      }
    } else {
      //groupsize = [3,2] or [2,3]
      hand.cards.push.apply(hand.cards, groups[0]);
      hand.cards.push.apply(hand.cards, groups[1]);
    }

    hand.value = sumBy(hand.cards, "value");
    hand.name = "Full House";
    hand.index = 6;
    return hand;
  }

  //check for flush
  if (flush.length === 5) {
    hand.cards = flush;
    hand.value = sumBy(flush, "value");
    hand.name = "Flush";
    hand.index = 5;
    return hand;
  }

  //check for straight
  if (straight.length === 5) {
    hand.cards = straight;
    hand.value = sumBy(straight, "value");
    hand.name = "Straight";
    hand.index = 4;
    return hand;
  }

  //check for 3 of a kind
  if (groupsize.includes(3)) {
    hand.cards.push.apply(hand.cards, groups[0]);
    var othercards = cards.filter(val => val.value !== hand.cards[0].value);
    while (hand.otherCards.length < 2) {
      hand.otherCards.push(othercards.pop());
    }
    hand.value = sumBy(hand.cards, "value");
    hand.name = "3 of a Kind";
    hand.index = 3;
    return hand;
  }

  //check for 2 pair
  if (groupings >= 2) {
    if (sum(groupsize, "value") === 6) {
      //groupsize = [2,2,2]
      var cluster = [];
      cluster.push.apply(cluster, groups[0]);
      cluster.push.apply(cluster, groups[1]);
      cluster.push.apply(cluster, groups[2]);
      cluster.sort((a, b) => a.value - b.value);
      while (hand.cards.length < 4) {
        hand.cards.push(cluster.pop());
      }
      var othercards = cards.filter(
        val =>
          val.value !== hand.cards[0].value && val.value !== hand.cards[2].value
      );
      othercards.sort((a, b) => a.value - b.value);
      hand.otherCards.push(othercards.pop());
      hand.value = sumBy(hand.cards, "value");
      hand.name = "2 Pair";
      hand.index = 2;
      return hand;
    } else {
      hand.cards.push.apply(hand.cards, groups[0]);
      hand.cards.push.apply(hand.cards, groups[1]);
      var othercards = cards.filter(
        val =>
          val.value !== hand.cards[0].value && val.value !== hand.cards[2].value
      );
      othercards.sort((a, b) => a.value - b.value);
      hand.otherCards.push(othercards.pop());
      hand.value = sumBy(hand.cards, "value");
      hand.name = "2 Pair";
      hand.index = 2;
      return hand;
    }
  }

  //check for pair
  if (groupings === 1) {
    hand.cards = groups[0];
    var othercards = cards.filter(val => val.value !== hand.cards[0].value);
    othercards.sort((a, b) => a.value - b.value);

    while (hand.otherCards.length < 3) {
      hand.otherCards.push(othercards.pop());
    }
    hand.name = "Pair";
    hand.value = sumBy(hand.cards, "value");
    hand.index = 1;
    return hand;
  }

  //otherwise, get the high card
  hand.cards.push(cards.pop());
  hand.otherCards = cards.splice(2, 4);
  hand.name = "High Card";
  hand.value = hand.cards[0].value;
  hand.index = 0;
  return hand;
};

module.exports = Table;
