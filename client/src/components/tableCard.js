import React, { Component, Fragment } from "react";
import { Paper } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  paper: {
    height: 100,
    width: 70,
    margin: 5
  }
};

class TableCard extends Component {
  constructor(props) {
    super(props);
  }
  render(props) {
    const classes = this.props.classes;
    const { src } = this.props;
    return (
      <Fragment>
        <Paper
          className={classes.paper}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
          }}
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
