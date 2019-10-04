export default class Card {
  constructor(value, suit, frontImage) {
    this.value = value;
    this.faceUp = false;
    this.location = "deck";
    this.backImage = "/assets/img/gray_back.png";
    this.suit = suit;
    this.frontImage = frontImage;

    switch (this.value) {
      case 11:
        this.displayValue = "Jack";
        break;
      case 12:
        this.displayValue = "Queen";
        break;
      case 13:
        this.displayValue = "King";
        break;
      case 14:
        this.displayValue = "Ace";
        break;
      default:
        this.displayValue = value.toString();
    }
    this.description = this.displayValue + " of " + this.suit + "s";
  }

  flip() {
    this.faceUp = !this.faceUp;
    return this.faceUp ? this.frontImage : this.backImage;
  }

  print() {
    return this.displayValue;
  }
}
