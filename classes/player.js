export default class Player {
  constructor(name, cash, img) {
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
    this.img = ""; //change to img?
  }

  bet(chipValue, index) {
    if (chipValue >= this.chips) {
      var amount = this.chips;
      this.bets[index] += amount;
      this.isAllIn = true;
      this.didBet = true;
      this.chips = 0;
      return amount;
    }
    this.bets[index] += chipValue;
    this.chips -= chipValue;
    this.didBet = true;
    return chipValue;
  }
}
