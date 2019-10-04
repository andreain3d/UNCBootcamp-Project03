import React, { Component } from "react";
import "./style.css";
import { isEmpty } from "lodash";
import io from "socket.io-client";

class ChatWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allMessages: [],
      message: "",
      username: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);

    this.socket = io.connect();

    this.socket.on("RECEIVE_MESSAGE", function(data) {
      console.log("RECEIVING MESSAGE SOCKET");
      addMessage(data);
    });

    const addMessage = data => {
      console.log(data);
      this.setState({ allMessages: [...this.state.allMessages, data] });
    };

    this.sendMessage = event => {
      event.preventDefault();

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

    this.socket.on("FLASH", data) {
      console.log(data);
    }
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
    // "on typing" function call here
    this.sendTypingMessage();
  };

  render() {
    return (
      <div className="container">
        <div id="chat-area">
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
        </div>
        <br />
        <form id="messageInput">
          <div className="messageDiv">
            <input
              key="username"
              type="text"
              name="username"
              id="chat-message"
              placeholder="username"
              value={this.state.username}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="messageDiv">
            <input
              key="message"
              type="text"
              name="message"
              id="chat-message"
              placeholder="message"
              value={this.state.message}
              onChange={this.handleInputChange}
            />
          </div>
          <input type="submit" value="Send" id="chat-submit" onClick={this.sendMessage} />
        </form>
      </div>
    );
  }
}

export default ChatWindow;
