import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Home from './pages/Home'
import Summoner from './pages/Summoner'

import './css/App.css';


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <Home/>
        </Route>
        <Route path='/summoner/:server/:username'>
          <Summoner/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
