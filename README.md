# UNCBootcamp-Project03

# Auth0 Configuration

### Setting up the Database

Run the following command in the main directory to setup the Mongo Database:

**npm run seed**

### Setting up Auth0 Configuration

Create a file called **auth_config.json** in the **/client/src** directory with the following content:

{
'domain': '<YOUR_AUTH0_DOMAIN>',
'clientId': '<YOUR_AUTH0_CLIENT_ID>'
}

### Testing Auth0 Configuration

On the main page, click **Log in** to authenticate with Auth0 and type in the following credentials:

username/email: **test@testing.com**
password: **Password!123**

Afterwards, it should log you in and since the User does not exist in your local database, it will create one for you.

### User API Calls

1. GET to '/api/users' returns all of the Users in our local database
2. POST to '/api/users' which requires:
   {
   "username": 'STRING',
   "email:" 'STRING',
   "image:" 'STRING'
   "achievements:" 'STRING',
   "preferences:" 'STRING'
   }
   creates a User in our local database

3. GET to '/api/users/email' returns a unique User with the given email

# API Poker

### The API server is able to play a single hand of poker through api calls. Here's how:

1. GET to '/api/table/init' **OR** POST to '/api/table/init', which requires:
   {
   "buyIn": `NUMBER`,
   "smallBlind": `NUMBER`,
   "bigBlind": `NUMBER`,
   "autoIncrementBlinds": `BOOLEAN`,
   "limit": `BOOLEAN`
   }

2. POST to '/api/table/join' which requires:
   {
   "name": `STRING`,
   "chips": `NUMBER`
   }

3. GET to '/api/table/deal'

4. GET to '/api/player/`<position>`/cards

5. GET to '/api/table/flop'

6. GET to '/api/table/turn'

7. GET to 'api/table/river'

8. GET to 'api/table/hands'
   <hr/>

### A note on betting

You can place bets after step 2. Traditional poker would require bets to be made by the big and small blinds before the deal and then by all players after each dealer (`/api/table`) action, ending with a round of betting after the river. Bets can be placed through the route:

- GET '/api/table/bet/`<position>`/`<amount>`'

where `<position>` is the player position on the table and `<amount>` is the amount to bet. Currently the table defaults to `limit=true`,
which requires that bets be in increments of the big blind, with raises only allowed after an initial bet and only by one increment
of the big blind. You can override limit by using POST in step 1.

### Bet amounts

The betting algorithm is driven by numeric values. There are two _special_ bets, viz `fold` and `check`, which are done by submitting an amount **less than 0** or **0** respectively. Any other amount submitted to the api is simply deducted from the player chips and added to the pot.

<hr/>
=======
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
