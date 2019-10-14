import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";
import Playerhand from "./playerhand.js";

class EndDialog extends React.Component {
  constructor(props) {
    super(props);
    this.props.socket.on("PRIME", data => {
      this.setState({ open: true });
    });
  }
<<<<<<< HEAD
=======

>>>>>>> 140e71eeffcb0180abb87bd6255afc41f437d7bf
  state = {
    open: true
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const hands = this.props.hands;
    return (
      <div>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Results</DialogTitle>
          <DialogContent>
            {hands.map(hand => (
              <Playerhand
                username={hand.player}
                cards={hand.cards}
                otherCards={hand.otherCards}
                rank={hand.rank}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleClose}
              color="secondary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default EndDialog;
