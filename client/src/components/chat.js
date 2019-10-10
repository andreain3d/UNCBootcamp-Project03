import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button, TextField } from "@material-ui/core";
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
    overflowY: "scroll",
    height: "6rem"
  }
};

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allMessages: [],
      message: "",
      username: props.username
    };

    this.socket = this.props.socket;
    this.socket.on("RECEIVE_MESSAGE", function(data) {
      console.log("RECEIVING MESSAGE SOCKET");
      addMessage(data);
    });

    const addMessage = data => {
      console.log(data);
      this.setState({ allMessages: [...this.state.allMessages, data] });
    };

    this.socket.on("FLASH", data => {
      console.log(data);
    });
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

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  sendMessage = event => {
    event.preventDefault();
    console.log(this.state.message);
    this.socket.emit("SEND_MESSAGE", {
      author: this.state.username,
      message: this.state.message
    });
    this.setState({
      message: ""
    });
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
            {this.state.allMessages.map(message => {
              if (isEmpty(message.author)) {
                return <div>{message.message}</div>;
              }
              return (
                <div>
                  {message.author}: {message.message}
                </div>
              );
            })}
            <div
              ref={el => {
                this.el = el;
              }}
            />
          </Paper>
          <div className={classes.container} noValidate autoComplete="off">
            <TextField
              key="message"
              name="message"
              placeholder="message"
              value={this.state.message}
              onChange={this.handleInputChange}
              label="Message"
              className={classes.textField}
              margin="normal"
            />
            <Button onClick={this.sendMessage}>Post</Button>
          </div>
        </Paper>
      </Paper>
    );
  }
}

export default withStyles(styles)(Chat);
