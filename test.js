import Table from "./classes/table";
import Player from "./classes/player";
import Deck from "./classes/deck";
import { cloneDeep } from "lodash";

var serverTable = new Table();
var deck = new Deck();
for (var i = 0; i < 4; i++) {
  serverTable.addPlayer(new Player(`Player_${i}`, 200, "/img"));
}

serverTable.players[0].cards.push(deck.cards[46]);
serverTable.players[0].cards.push(deck.cards[32]);
serverTable.players[1].cards.push(deck.cards[33]);
serverTable.players[1].cards.push(deck.cards[45]);
serverTable.players[2].cards.push(deck.cards[6]);
serverTable.players[2].cards.push(deck.cards[20]);
serverTable.players[3].cards.push(deck.cards[7]);
serverTable.players[3].cards.push(deck.cards[19]);

serverTable.flop.push(deck.cards[25]);
serverTable.flop.push(deck.cards[43]);
serverTable.flop.push(deck.cards[47]);

serverTable.turn = deck.cards[0];
serverTable.river = deck.cards[14];

serverTable.players[0].bets = [20, 40, 40, 40];
var pot = 140;
serverTable.players[1].bets = [20, 30, 0, 0];
pot += 50;
serverTable.players[2].bets = [20, 40, 20, 0];
pot += 80;
serverTable.players[3].bets = [20, 40, 40, 20];
pot += 120;
serverTable.pot[0] = pot;
//begin testing

console.log(payouts);
