import React, { Component, Fragment } from "react";
import { Paper } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  paper: {
    height: 100,
    width: 70,
    margin: 5,
    background: "#1a643f"
  }
};

class TableCard extends Component {
  render(props) {
    const classes = this.props.classes;
    const { src } = this.props;
    return (
      <Fragment>
        <Paper
          className={classes.paper}
          style={
            src.length > 0
              ? {
                  backgroundImage: `url(${src})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center"
                }
              : {}
          }
        />

        <Paper />
        <Paper />
        <Paper />
        <Paper />
      </Fragment>
    );
  }
}

export default withStyles(styles)(TableCard);
