import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button, TextField } from "@material-ui/core";
import io from "socket.io-client";
import { isEmpty } from "lodash";

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  grow: {
    flexGrow: 1,
    height: "35vh",
    marginTop: 5
  }
};

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allMessages: [],
      message: "",
      username: ""
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

    // this.typing method containing socket emitter goes here
    this.sendTypingMessage = () => {
      this.socket.emit("typing", this.state.username);
    };

    this.socket.on("isTyping", username => {
      if (!this.state.allMessages.includes(`${username} is typing...`)) {
        console.log("SOCKET IS TYPING");
        addMessage(`${username} is typing...`);
      }
    });

    this.socket.on("FLASH", data => {
      console.log(data);
    });
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
    // "on typing" function call here
    this.sendTypingMessage();
  };

  sendMessage = event => {
    event.preventDefault();
    console.log(this.state.message);
    this.socket.emit("SEND_MESSAGE", {
      author: this.state.username,
      message: this.state.message
    });
    this.setState({
      message: "",
      //`${this.state.username} is typing...` needs to be changed to find any message that includes " is typing..."
      allMessages: this.state.allMessages.filter(value => value !== `${this.state.username} is typing...`)
    });
  };

  render(props) {
    const classes = this.props.classes;
    return (
      <Paper className={classes.grow}>
        <Typography variant="h6">Chat</Typography>
        <Paper>
          {this.state.allMessages.map(message => {
            if (isEmpty(message.author)) {
              return <div>{message}</div>;
            }
            return (
              <div>
                {message.author}: {message.message}
              </div>
            );
          })}
        </Paper>
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            key="username"
            name="username"
            placeholder="username"
            value={this.state.username}
            onChange={this.handleInputChange}
            label="Name"
            className={classes.textField}
            margin="normal"
          />
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
        </form>
      </Paper>
    );
  }
}

export default withStyles(styles)(Chat);
