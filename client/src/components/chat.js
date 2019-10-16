import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Paper, Typography, Button, TextField } from "@material-ui/core";
import { isEmpty } from "lodash";

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  grow: {
    flexGrow: 1,
    height: "35vh",
    marginTop: 5,
    background: "#1C2022"
  },
  header: {
    color: "#fff"
  },
  inner: {
    margin: 5,
    padding: 10,
    background: "#D5D5D5",
    height: "25vh"
  },
  msgDisplay: {
    padding: 5,
    overflowY: "scroll",
    height: "6rem"
  },
  button: {
    marginLeft: 10
  }
};

class Chat extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  scrollToBottom = () => {
    this.el.scrollIntoView({ behavior: "smooth" });
  };

  render(props) {
    const classes = this.props.classes;
    return (
      <Paper className={classes.grow}>
        <Typography className={classes.header} align="center" variant="h6">
          Chat
        </Typography>
        <Paper className={classes.inner}>
          <Paper className={classes.msgDisplay}>
            {this.props.allMessages.map((message, index) => {
              if (isEmpty(message.author)) {
                return (
                  <div key={index}>
                    <Typography
                      variant="body1"
                      style={{ color: message.style }}
                    >
                      {message.message}
                    </Typography>
                  </div>
                );
              }
              return (
                <div key={index}>
                  <Typography variant="body1">
                    {message.author}: {message.message}
                  </Typography>
                </div>
              );
            })}
            <div
              ref={el => {
                this.el = el;
              }}
            />
          </Paper>
          {this.props.position >= 0 ? (
            <Grid container justify="center" alignItems="flex-end">
              <TextField
                key="message"
                name="message"
                placeholder="message"
                value={this.props.message}
                onChange={this.props.handleInputChange}
                label="Message"
                className={classes.textField}
                margin="normal"
              />
              <Button
                className={classes.button}
                variant="contained"
                color="secondary"
                onClick={this.props.sendMessage}
              >
                Post
              </Button>
            </Grid>
          ) : (
            ""
          )}
        </Paper>
      </Paper>
    );
  }
}

export default withStyles(styles)(Chat);
