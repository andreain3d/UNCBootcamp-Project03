# UNCBootcamp-Project03

# API Poker

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
