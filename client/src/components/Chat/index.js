import React, { Component } from "react";
import "./style.css";
import io from "socket.io-client";

class ChatWindow extends Component {
  constructor(props) {
    super(props);

    this.displayData = [];

    this.state = {
      allMessages: this.displayData,
      message: "",
      username: ""
    };

    this.handleChatSubmit = this.handleChatSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.socket = io.connect();

    // this.socket.on("RECEIVE_MESSAGE", function(data) {
    //   addMessage(data);
    // });

    //NOT SURE BOUT THIS

    // const addMessage = data => {
    //   console.log(data);
    //   this.setState({ messages: [...this.state.messages, data] });
    //   console.log(this.state.messages);
    // };

    // this.sendMessage = ev => {
    //   ev.preventDefault();
    //   this.socket.emit("SEND_MESSAGE", {
    //     author: this.state.username,
    //     message: this.state.message
    //   });
    //   this.setState({ message: "" });
    // };
  }

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleChatSubmit = event => {
    event.preventDefault();
    this.displayData.push(
      <div id="display-data">
        <pre>
          {this.state.username}: {this.state.message}
        </pre>
      </div>
    );
    this.setState({
      allMessages: this.displayData,
      message: ""
    });
  };

  render() {
    return (
      <div className="container">
        <div id="chat-area">{this.displayData}</div>
        <br />
        <form id="messageInput">
          <div className="messageDiv">
            <input
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
              type="text"
              name="message"
              id="chat-message"
              placeholder="message"
              value={this.state.message}
              onChange={this.handleInputChange}
            />
          </div>
          <input type="submit" value="Send" id="chat-submit" onClick={this.handleChatSubmit} />
        </form>
      </div>
    );
  }
}

export default ChatWindow;
