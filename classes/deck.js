//as a constructor
var Card = require("./card");
const cardData = [
  {
    suit: "spade",
    value: 14,
    art: "/assets/img/AS.png"
  },
  {
    suit: "spade",
    value: 13,
    art: "/assets/img/KS.png"
  },
  {
    suit: "spade",
    value: 12,
    art: "/assets/img/QS.png"
  },
  {
    suit: "spade",
    value: 11,
    art: "/assets/img/JS.png"
  },
  {
    suit: "spade",
    value: 10,
    art: "/assets/img/10S.png"
  },
  {
    suit: "spade",
    value: 9,
    art: "/assets/img/9S.png"
  },
  {
    suit: "spade",
    value: 8,
    art: "/assets/img/8S.png"
  },
  {
    suit: "spade",
    value: 7,
    art: "/assets/img/7S.png"
  },
  {
    suit: "spade",
    value: 6,
    art: "/assets/img/6S.png"
  },
  {
    suit: "spade",
    value: 5,
    art: "/assets/img/5S.png"
  },
  {
    suit: "spade",
    value: 4,
    art: "/assets/img/4S.png"
  },
  {
    suit: "spade",
    value: 3,
    art: "/assets/img/3S.png"
  },
  {
    suit: "spade",
    value: 2,
    art: "/assets/img/2S.png"
  },
  {
    suit: "club",
    value: 14,
    art: "/assets/img/AC.png"
  },
  {
    suit: "club",
    value: 13,
    art: "/assets/img/KC.png"
  },
  {
    suit: "club",
    value: 12,
    art: "/assets/img/QC.png"
  },
  {
    suit: "club",
    value: 11,
    art: "/assets/img/JC.png"
  },
  {
    suit: "club",
    value: 10,
    art: "/assets/img/10C.png"
  },
  {
    suit: "club",
    value: 9,
    art: "/assets/img/9C.png"
  },
  {
    suit: "club",
    value: 8,
    art: "/assets/img/8C.png"
  },
  {
    suit: "club",
    value: 7,
    art: "/assets/img/7C.png"
  },
  {
    suit: "club",
    value: 6,
    art: "/assets/img/6C.png"
  },
  {
    suit: "club",
    value: 5,
    art: "/assets/img/5C.png"
  },
  {
    suit: "club",
    value: 4,
    art: "/assets/img/4C.png"
  },
  {
    suit: "club",
    value: 3,
    art: "/assets/img/3C.png"
  },
  {
    suit: "club",
    value: 2,
    art: "/assets/img/2C.png"
  },
  {
    suit: "diamond",
    value: 14,
    art: "/assets/img/AD.png"
  },
  {
    suit: "diamond",
    value: 13,
    art: "/assets/img/KD.png"
  },
  {
    suit: "diamond",
    value: 12,
    art: "/assets/img/QD.png"
  },
  {
    suit: "diamond",
    value: 11,
    art: "/assets/img/JD.png"
  },
  {
    suit: "diamond",
    value: 10,
    art: "/assets/img/10D.png"
  },
  {
    suit: "diamond",
    value: 9,
    art: "/assets/img/9D.png"
  },
  {
    suit: "diamond",
    value: 8,
    art: "/assets/img/8D.png"
  },
  {
    suit: "diamond",
    value: 7,
    art: "/assets/img/7D.png"
  },
  {
    suit: "diamond",
    value: 6,
    art: "/assets/img/6D.png"
  },
  {
    suit: "diamond",
    value: 5,
    art: "/assets/img/5D.png"
  },
  {
    suit: "diamond",
    value: 4,
    art: "/assets/img/4D.png"
  },
  {
    suit: "diamond",
    value: 3,
    art: "/assets/img/3D.png"
  },
  {
    suit: "diamond",
    value: 2,
    art: "/assets/img/2D.png"
  },
  {
    suit: "heart",
    value: 14,
    art: "/assets/img/AH.png"
  },
  {
    suit: "heart",
    value: 13,
    art: "/assets/img/KH.png"
  },
  {
    suit: "heart",
    value: 12,
    art: "/assets/img/QH.png"
  },
  {
    suit: "heart",
    value: 11,
    art: "/assets/img/JH.png"
  },
  {
    suit: "heart",
    value: 10,
    art: "/assets/img/10H.png"
  },
  {
    suit: "heart",
    value: 9,
    art: "/assets/img/9H.png"
  },
  {
    suit: "heart",
    value: 8,
    art: "/assets/img/8H.png"
  },
  {
    suit: "heart",
    value: 7,
    art: "/assets/img/7H.png"
  },
  {
    suit: "heart",
    value: 6,
    art: "/assets/img/6H.png"
  },
  {
    suit: "heart",
    value: 5,
    art: "/assets/img/5H.png"
  },
  {
    suit: "heart",
    value: 4,
    art: "/assets/img/4H.png"
  },
  {
    suit: "heart",
    value: 3,
    art: "/assets/img/3H.png"
  },
  {
    suit: "heart",
    value: 2,
    art: "/assets/img/2H.png"
  }
];

function Deck() {
  this.cards = [];

  cardData.forEach(card =>
    this.cards.push(new Card(card.value, card.suit, card.art))
  );

  this.shuffle = (iter = 1) => {
    for (var i = 0; i < iter; i++) {
      this.cards.sort((a, b) => Math.random() <= 0.5);
    }
  };

  this.draw = () => {
    if (this.cards.length === 0) {
      throw new Error("Empty Deck!");
    }
    return this.cards.shift();
  };

  this.discard = card => {
    this.cards.push(card);
  };

  this.print = () => {
    this.cards.forEach(card => {
      // console.log(card.print());
    });
  };
}

module.exports = Deck;
