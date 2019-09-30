import crypto from "crypto";
import moment from "moment";

export default class Player {
  constructor(name, cash, bot = false) {
    this.name = name;
    this.chips = 0;
    this.cash = cash;
    this.cards = [];
    this.bets = [0];
    this.didFold = false;
    this.didBet = false;
    this.isAllIn = false;
    this.position = 0;
    this.bot = bot;
    this.bestPossibleHand = 0;
    this.id = crypto.pbkdf2Sync(name, moment().toString(), 100000, 16, "sha512").toString("hex");
  }

  bet(chipValue, index) {
    if (chipValue < 0) {
      console.log(this.name + " folds.");
      this.didFold = true;
      return 0;
    }
    if (chipValue === 0) {
      console.log(this.name + " checks.");
      this.didBet = true;
      return 0;
    }
    if (chipValue >= this.chips) {
      var amount = this.chips;
      this.bets[index] += amount;
      this.isAllIn = true;
      this.didBet = true;
      this.chips = 0;
      console.log(this.name + " goes all in!");
      return amount;
    }
    this.bets[index] += chipValue;
    this.chips -= chipValue;
    this.didBet = true;
    console.log(this.name + " bets " + chipValue + ".");
    return chipValue;
  }
}
