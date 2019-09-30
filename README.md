# UNCBootcamp-Project03

# API Poker

### The API server is able to play a one player game of poker through api calls. Here's how:

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
