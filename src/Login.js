import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoin = () => {
    console.log('Join button clicked');
    // Implement the logic for joining here
    navigate('/join');
  };

  const handleSignIn = () => {
    console.log('Sign In button clicked');
    setShowLoginScreen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    try {
      const response = await axios.post('http://127.0.0.1:5000/login', { username, password }, { headers: { 'Content-Type': 'application/json' } });
      console.log(response.data)
      if (response.data.success) {
        setIsAuthenticated(true);
        setErrorMessage('');
        //onLogin(); // Optional: trigger additional actions on login
        //navigate('/main'); // Navigate to MainScreen
        navigate('/main', { state: { username } });

      } else {
        setIsAuthenticated(false);
        setErrorMessage('Invalid credentials!');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsAuthenticated(false);
      setErrorMessage('Error validating user. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* Head, title, and favicon */}
      <div className="login-content">

        <p className="tagline">Sync your heartbeats together</p>
        <h2>Make the first move</h2>
        <p>Start meeting new people in your area! If you already have an account, sign in to use HeartSync.</p>
        <div className="buttons-container">
        <button type="button" onClick={handleJoin}>Join Now</button>
        <div class="horizontal-space"></div>
        <button type="button" onClick={handleSignIn}>Sign In</button>
        </div>

        {showLoginScreen && !isAuthenticated && (
          <div className="login-screen">
            <p>Enter your registered username and password</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="username">Username:</label>
              <input type="text" id="username" name="username" required />
              <br />
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" required />
              <br />
              <button type="submit">Submit</button>
            </form>
          </div>
        )}

        {!isAuthenticated && errorMessage && <p>{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Login;