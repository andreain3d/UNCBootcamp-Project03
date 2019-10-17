//as a constructor

function Player(name, cash, img, id, email) {
  this.name = name;
  this.chips = 0;
  this.cash = cash;
  this.cards = [];
  this.bets = [0];
  this.didFold = false;
  this.didBet = false;
  this.isAllIn = false;
  this.allInRound = 0;
  this.position = 0;
  this.img = img;
  this.id = id;
  this.email = email;

  this.bet = (chipValue, index) => {
    console.log("PLAYER BET: ", chipValue);
    if (chipValue >= this.chips) {
      var amount = this.chips;
      this.bets[index] += amount;
      this.isAllIn = true;
      this.didBet = true;
      this.chips = 0;
      console.log("AFTER: ", this.chips);
      return amount;
    }
    this.bets[index] += chipValue;
    this.chips -= chipValue;
    this.didBet = true;
    console.log("AFTER: ", this.chips);
    return chipValue;
  };
}

module.exports = Player;
