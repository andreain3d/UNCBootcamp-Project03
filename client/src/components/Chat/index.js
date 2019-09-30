import React, { Component } from "react";
import "./style.css";

class ChatWindow extends Component {
  constructor() {
    super();

    this.displayData = [];

    this.state = {
      showdata: this.displayData,
      postVal: "",
      username: ""
    };

    this.handleChatSubmit = this.handleChatSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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
          {this.state.username}: {this.state.postVal}
        </pre>
      </div>
    );
    this.setState({
      showdata: this.displayData,
      postVal: ""
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
              name="postVal"
              id="chat-message"
              placeholder="message"
              value={this.state.postVal}
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
