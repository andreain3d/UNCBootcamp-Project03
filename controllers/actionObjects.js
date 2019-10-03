//Join table
const joinTable = {
  socketId: "",
  mongoInfo: {
    mongoId: "",
    username: "",
    img: "",
    badges: ""
  },
  position: "",
  chips: 0
};

//Deal
const dealObj = {
  holeCards: [],
  socketId: ""
};

//Bet
const betObj = {
  socketId: "",
  username: "",
  mongoId: "",
  betAmt: 0
};

//Check
const checkObj = {
  socketId: "",
  username: ""
};

//Call
const callObj = {
  socketId: "",
  username: "",
  prevBetAmt: 0
};

//Raise
const raiseObj = {
  socketId: "",
  username: "",
  prevBetAmt: 0,
  raise: 0
};

//Fold
const foldObj = {
  socketId: "",
  username: ""
};

//Payout
const payout = {
  socketId: "",
  mongoId: "",
  payAmt: 0
};

//Leave table
const leaveTableObj = {
  socketId: "",
  username: "",
  mongoId: "",
  chips: 0 //to be converted back into cash
};

//Chat message
const chatObj = {
  socketId: "",
  username: "",
  message: ""
};
