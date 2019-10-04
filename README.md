# UNCBootcamp-Project03

# Poker

# Socket.io Poker

The poker api has been upgraded to send data through `socket.io`. The socket events are named after each of the methods on the `table.controller` exports object, which map to each of the api routes. When an pit route is hit, the route will send data through the `io.emit("EVENTNAME", data)` function.

### Event Names and Their Data

1. FLASH
   - #### Route: `/api/table`
   - #### Data

```js
{
    buyIn: 200,
    bigBlind: 12,
    smallBlind: 6,
    autoIncrementBlinds: false,
    limit: true,
    players: [],
    pot: [0],
    deck: {
        cards: [...],
    },
    flop: [],
    dealerIndex: 0,
    round: 0,
    currentBet: 0,
    position: 0,
    betsIn: false
}
```

2. PRIME
   - #### Route: `/api/table/prime`
   - #### Data

```js
{
    message: "Table is set up and primed for the next hand",
    next: "POST '/api/table/deal'",
    rejected: [] //an array of players that don't have enough cash to join the table
}
```

3. ADDPLAYER
   - #### Route: `/api/table/join`
   - #### Data

```js
{
    message: `${player.name}, welcome to api casino! You've been added to the que for the table in position ${quePos}. Players are added to the table at the start of a hand in FIFO order as seats become available.`,
    quePos: INT //the player's position in the que
    next: "GET '/api/table/init'"
}
```

4. DEALCARDS
   - #### Route: `/api/table/deal`
   - #### Data

```js
{
    message: "Cards have been dealt! If you are in a betting mood, follow the next key in the betObj",
    next: "GET '/api/player/<position>/cards' OR '/api/table/flop'",
    players: serverTable.players,
    betObj: {
        next: "/api/table/bet/<position>/<amount>",
        nextPlayer: players[position].name,
        nextBetPosition: serverTable.position,
        action: currentBet - playerBet,
        currentBet,
        playerBet,
        position
      }
}
```

5. DOFLOP
   - #### Route: `/api/table/flop`
   - #### Data

```js
{
    flop,
      message: "The flop has been dealt! If you are in a betting mood, follow the next key in the betObj",
      next: "GET '/api/player/<position>/cards' OR '/api/table/turn'",
      betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
}
```

6. DOTURN
   - #### Route: `/api/table/turn`
   - #### Data

```js
{
    turn,
    message: "The turn has been dealt! If you are in a betting mood, follow the next key in the betObj",
    next: "GET '/api/player/<position>/cards' OR '/api/table/river'",
    betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
      }
}
```

7. DORIVER
   - #### Route: `/api/table/river`
   - #### Data

```js
{
    river,
    message: "The river has been dealt! If you are in a betting mood, follow the next key in the betObj",
    next: "GET '/api/player/<position>/cards' OR '/api/table/hands'",
    betObj: {
        next: `/api/table/bet/${position}/${currentBet}`,
        nextPlayer: players[position].name,
        nextBetPosition: position,
        action: currentBet - players[position].bets[round],
        currentBet,
        playerBet: players[position].bets[round],
        position
    }
}
```

8. TABLECARDS
   - #### Route: `/api/table/cards`
   - #### Data

```js
{
    tableCards: [], //an array of cards on the table
}
```

9. CALCULATEHANDS
   - #### Route: `/api/table/hands`
   - #### Data

```js
{
    hands: [], //an array of hands, sorted by rank with player indicators
}
```

10. CALCULATEHANDS

- #### Route: `/api/table/hands`
- #### Data

```js
{
    hands: [], //an array of hands, sorted by rank with player indicators
}
```

- _Note: this route isn't necessary when handling bets. Call_ `/api/table/payout` _instead_

11. PLACEBET

- #### Route: `/api/table/bet/<position>/<amount>`
- #### Data

```js
{
    message: "You have placed a bet for " + amount + " chips.",
    remainingChips: serverTable.players[position].chips,
    potTotal: serverTable.pot[0],
    betObj //betObj contains values that indicate the next player to bet
}
```

11. PAYOUT

- #### Route: `/api/table/payout`
- #### Data

```js
{
  payouts, //an array of chip values that maps onto the serverTable.players array
    hands; //the raw sorted array of ranked winning hands and player data
}
```

# The Virtual Table

## key-value pairs and the table constructor

The virtual table, which lives on the express server, is initialized and manipulated through api calls as demonstrated above. The table is a class that contains a number of key-value pairs as well as methods that manipulate those values. The following is a snapshot of the default table object after initilaization. Some portions of the table are shortened to conserve space. You can always hit the `/api/table` endpoint if you're not into the whole brevity thing.

```js
{
    "buyIn": 200,
    "bigBlind": 12,
    "smallBlind": 6,
    "autoIncrementBlinds": false,
    "limit": true,
    "players": [],
    "pot": [0],
    "deck": {
        "cards": [...],
    },
    "flop": [],
    "dealerIndex": 0,
    "round": 0,
    "currentBet": 0,
    "position": 0,
    "betsIn": false
}
```
