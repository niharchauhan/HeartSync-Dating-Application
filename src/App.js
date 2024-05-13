import React from 'react';
import Inbox from './Inbox';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Chat from './Chat';
import Choice from './choice'; 
import Login from './Login';
import heartLogo from './heart.png';
import MainScreen from './MainScreen';
import Preferences from './Preferences';
import JoinScreen from './JoinScreen';
import ShowProfiles from './ShowProfiles';
import Profile from './Profile'; // Make sure the path is correct


function App() {

  const centeredStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    maxWidth: '100%', // Limit width to the viewport width
    overflowX: 'hidden', // Hide horizontal overflow
  }; 

  return (
    <Router>
      <div style = {centeredStyle}>
        <h1>HeartSync</h1>
        {/* Navigation Link to Choice Page */}
        {/*<Link to="/choice"><button>Go to Choice</button></Link>*/}
        {/*<Link to="/Chat"><button>Go to Chat</button></Link>*/}
        {/* <Link to="/inbox"><button>Go to Inbox</button></Link> */}
        {/* <Link to="/login"><button>Go to Login</button></Link> */}
        {/* Setup the Router and Routes */}
        <img src={heartLogo} className="App-logo" alt="heart logo" />
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/chat" element={<Chat />} /> {/* Chat route */}
        <Route path="/choice" element={<Choice />} /> {/* Choice route */}
        <Route path="/main" element={<MainScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<JoinScreen />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/showprofiles" element={<ShowProfiles />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
