import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { useAuth0 } from "./react-auth0-wrapper";
import "./App.css";
import NavBar from "./components/NavBar";
import Profile from "./components/Profile";
import ChatWindow from "./components/Chat";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="App">
      <BrowserRouter>
        <header>
          <NavBar />
        </header>
        {isAuthenticated && <ChatWindow />}
        <Switch>
          <Route path="/" exact />
          <PrivateRoute path="/profile" component={Profile} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
