//Join table
const joinTable = {
  user_id: "",
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
  user_id: ""
};

//Bet
const betObj = {
  user_id: "",
  username: "",
  mongoId: "",
  betAmt: 0
};

//Check
const checkObj = {
  user_id: "",
  username: ""
};

//Call
const callObj = {
  user_id: "",
  username: "",
  prevBetAmt: 0
};

//Raise
const raiseObj = {
  user_id: "",
  username: "",
  prevBetAmt: 0,
  raise: 0
};

//Fold
const foldObj = {
  user_id: "",
  username: ""
};

//Payout
const payout = {
  user_id: "",
  mongoId: "",
  payAmt: 0
};

//Leave table
const leaveTableObj = {
  user_id: "",
  username: "",
  mongoId: "",
  chips: 0 //to be converted back into cash
};

//Chat message
const chatObj = {
  user_id: "",
  username: "",
  message: ""
};
