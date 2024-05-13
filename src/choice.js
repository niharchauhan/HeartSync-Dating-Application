import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useLocation, useNavigate } from 'react-router-dom';
import './choice.css';

function Choice() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  
  const current_username = location.state.username;

  const centeredStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center'
  };

  const [weights, setWeights] = useState({
    ethnicity: 0,
    job: 0,
    bodyType: 0,
    location: 0,
    religion: 0,
    horrorscope: 0,
    language: 0,
    bio: 0
  });

  const handleSliderChange = (feature) => (event) => {
    setWeights({
      ...weights,
      [feature]: event.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Sending data to backend:', weights);
    setIsLoading(true); // Start loading
    fetch('http://localhost:5000/update-weights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({weights: weights ,current_user: current_username} )
    })
    .then(response => response.json())
    .then(data => {
        console.log('Recommendations from backend:', data.recommendations);
        setRecommendations(data.recommendations);
        setIsLoading(false); // Stop loading when data is received
    })
    .catch(error => {
        console.error('Error:', error);
        setIsLoading(false); // Stop loading on error
    });
};


  const handleShowProfiles = () => {
    navigate('/showprofiles', { state: { username: current_username } });
   };       

  return (
    <div className="Choice" style={centeredStyle}>
        {isLoading && (
            <div className="loading-message"><h2>Please wait while we set up the best profiles for you!</h2></div>
        )}        
        <h1>What kind of profiles do you want to see {current_username}?</h1>
        {/* <button onClick={() => setViewMode('similar')}>I want to see similar profiles</button>
        <button onClick={() => setViewMode('explore')}>I'm open to explore</button> */}

        {(
            <div>
                <h2>To help us recommend you similar profiles, choose the weights for following features:</h2>
                {Object.keys(weights).map(feature => (
                    <div key={feature}>
                        <label>{feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1').trim()}: </label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            value={weights[feature]}
                            onChange={handleSliderChange(feature)}
                        />
                        <span> {weights[feature]}</span>
                    </div>
                ))}
                <button onClick={handleSubmit}>Submit</button>
                <br />
                <Link to="/"><button>Back to Chat</button></Link> {/* Add a back button */}
            </div>
        )}

        {/* Display recommendations if available */}
        {recommendations.length > 0 && (
            <div>
                <h3>Preferences Saved!</h3>
                <p>We have saved your preferences!</p>
                <p>Goto <strong>Show Profiles</strong> page to swipe through the profiles!</p>
                <button onClick={handleShowProfiles}>
                    Show Profiles
                </button>                
            </div>
        )}
    </div>
);

}

export default Choice;
