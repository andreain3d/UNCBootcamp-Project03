import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import PrivateRoute from "./components/PrivateRoute";
import LobbyView from "./pages/LobbyView";
import TableView from "./pages/TableView";
import ProfileView from "./pages/ProfileView";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <PrivateRoute path="/table">
            <TableView />
          </PrivateRoute>
          <PrivateRoute path="/profile">
            <ProfileView />
          </PrivateRoute>
          <Route path="/">
            <LobbyView />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
