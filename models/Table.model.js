var mongoose = require("mongoose");

const Table = mongoose.model(
  "Table",
  new mongoose.Schema({
    buyIn: {
      type: Number,
      required: true
    },
    bigBlind: {
      type: Number,
      default: 20
    },
    smallBlind: {
      type: Number,
      default: 10
    },
    autoIncrementBlinds: {
      type: Boolean,
      default: false
    },
    limit: { type: Boolean, default: true },
    players: [Object],
    kitty: Number,
    dealerIndex: {
      type: Number,
      default: 0
    },
    round: {
      type: Number,
      default: 0
    },
    currentBet: {
      type: Number,
      default: 0
    },
    betsIn: {
      type: Boolean,
      default: false
    }
  })
);

module.exports = Table;
