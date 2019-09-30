import React, { Component } from "react";
import "./style.css";

class ChatWindow extends Component {
  constructor() {
    super();

    this.displayData = [];

    this.state = {
      showdata: this.displayData,
      postVal: ""
    };

    this.handleChatSubmit = this.handleChatSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange = event => {
    const inputValue = event.target.value;
    this.setState({ postVal: inputValue });
  };

  handleChatSubmit = event => {
    event.preventDefault();
    this.displayData.push(
      <div id="display-data">
        <pre>{this.state.postVal}</pre>
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
          <div id="messageDiv">
            <input type="text" id="chat-message" value={this.state.postVal} onChange={this.handleInputChange} />
          </div>
          <input type="submit" value="Send" id="chat-submit" onClick={this.handleChatSubmit} />
        </form>
      </div>
    );
  }
}

export default ChatWindow;
