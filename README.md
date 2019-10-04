# UNCBootcamp-Project03

# API Poker

### The API server is able to play a single hand of poker through api calls. Here's how:

1. Add players to the que via POST to `/api/table/join`, which requires:

   ```js
   {
      "name": STRING,
      "cash": NUMBER
   }
   ```

2. GET to `/api/table/prime` **OR** POST to `/api/table/prime`, which requires:

   ```js
   {
      "buyIn": NUMBER,
      "smallBlind": NUMBER,
      "bigBlind": NUMBER,
      "autoIncrementBlinds": BOOLEAN,
      "limit": BOOLEAN
   }
   ```

   NOTE: POST will only set table values if a virtual table doesn't exist. A call to `/api/table` will confirm the existence of a virtual table

3. GET to `/api/table/deal`

4. GET to `/api/player/`<position>`/cards`

5. GET to `/api/table/flop`

6. GET to `/api/table/turn`

7. GET to `api/table/river`

8. GET to `api/table/hands`
   <hr/>

### A note on betting

You can place bets after step 2. Traditional poker would require bets to be made by the big and small blinds before the deal and then by all players after each dealer (`/api/table`) action, ending with a round of betting after the river. Bets can be placed through the route:

- GET `/api/table/bet/<position>/<amount>`

where `<position>` is the player position on the table and `<amount>` is the amount to bet. _Currently, the table limit value (`true/false`) **is ignored**, meaning that the api will accept any bet greater than or equal to the current bet value_.

### Bet amounts

The betting algorithm is driven by numeric values. There are two _special_ bets, viz `fold` and `check`, which are done by submitting an amount **less than 0** or **0** respectively. These amounts are checked for at the beginning of the betting algorithm and, if found, the respective method is called to handle the player action.
Any other amount submitted to the api is compared to the virtual table's `currentBet` amount a semantic method which maps to the player action is called. These methods are named `bet(), call(), raise()` and `allIn()` and exist in the `table.controller.js` file. They are private methods inaccessible from outside the file.

<hr/>

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
