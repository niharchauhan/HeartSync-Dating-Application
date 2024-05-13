// MainScreen.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


function MainScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state.username;



    // Function to fetch from /reseti
    const resetCounter = async () => {
        try {

            const response = await axios.get(`http://localhost:5000/reseti`);
            const data = await response.json();
            console.log('Reset successful:', data);
        } catch (error) {
            console.error('Failed to reset counter:', error);
        }
    };    

    useEffect(() => {
        resetCounter();
    }, []); // Empty dependency array to run only once    

    const handleUpdatePreferences = () => {
        navigate('/preferences', { state: { username } });
    };

    const handleInbox = () => {
        navigate('/inbox', { state: { username } });
    };   
    
    const handleShowProfiles = () => {
        navigate('/showprofiles', { state: { username } });
    };     
    
    const handleChoice = () => {
        navigate('/choice', { state: { username } });
    };       

    const handleViewProfile = () => {
        navigate('/profile', { state: { username } }); // Navigate to Profile.js
    };    

    return (
        <div>
            <h1>Welcome, {username}!</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={handleViewProfile} style={{ position: 'absolute', top: '50px', right: '10px' }}>
                    View Your Profile</button>                
                <button onClick={handleUpdatePreferences}>
                    Must Haves
                </button>
                <div style={{ width: '10px', height: '20px', alignSelf: 'center' }} />
                <button onClick={handleInbox}>
                    Love Bot
                </button>
                <div style={{ width: '10px', height: '20px', alignSelf: 'center' }} />
                <button onClick={handleShowProfiles}>
                    Show Profiles
                </button>                
                <div style={{ width: '10px', height: '20px', alignSelf: 'center' }} />
                <button onClick={handleChoice}>
                    Matchmaker's Choice
                </button>                  
            </div>
        </div>
    );
}

export default MainScreen;
