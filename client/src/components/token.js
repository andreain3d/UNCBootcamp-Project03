import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  dealer: {
    height: "30px",
    width: "30px",
    background: "url('./assets/img/dealer.png')",
    backgroundSize: "30px 30px"
  },
  sb: {
    height: "30px",
    width: "30px",
    background: "url('./assets/img/SB.png')",
    backgroundSize: "30px 30px"
  },
  bb: {
    height: "30px",
    width: "30px",
    background: "url('./assets/img/BB.png')",
    backgroundSize: "30px 30px"
  },
  chip: {
    height: "30px",
    width: "30px",
    background: "url('./assets/img/chips.png')",
    backgroundSize: "30px 30px"
  },
  empty: {
    height: "30px",
    width: "30px"
  }
};

class Token extends Component {
  render(props) {
    const classes = this.props.classes;
    if (this.props.type === "D") {
      return <div className={classes.dealer} />;
    } else if (this.props.type === "SB") {
      return <div className={classes.sb} />;
    } else if (this.props.type === "BB") {
      return <div className={classes.bb} />;
    } else if (this.props.type === "C") {
      return <div className={classes.chip} />;
    } else {
      return <div className={classes.empty} />;
    }
  }
}

export default withStyles(styles)(Token);
