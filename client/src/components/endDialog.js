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
  state = {
    open: true
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
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
            <Playerhand
              username="Username"
              card1="card1.jpg"
              card2="card2.jpg"
              rank="1"
            />
            <Playerhand
              username="Username2"
              card1="card1.jpg"
              card2="card2.jpg"
              rank="2"
            />
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
