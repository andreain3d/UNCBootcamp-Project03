import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent
} from "@material-ui/core";

class HandDialog extends React.Component {
  state = {
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Button
          variant="contained"
          color="inherit"
          onClick={this.handleClickOpen}
        >
          Hands
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {/* <DialogTitle id="alert-dialog-title">
            {"Poker Hand Rankings"}
          </DialogTitle> */}
          <DialogContent>
            <img
              alt="rankings"
              src="https://www.mathworks.com/matlabcentral/mlc-downloads/downloads/submissions/17579/versions/1/screenshot.jpg"
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

export default HandDialog;
