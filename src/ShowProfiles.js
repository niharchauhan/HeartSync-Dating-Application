import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShowProfiles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';

const ShowProfiles = () => {
  const location = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  //const [imgurl, setImgURL] = useState('');
  const [imgurl, setImgUrl] = useState(''); // State to hold the image URL
  const [matchPopup, setMatchPopup] = useState(false);
  const [likedUser, setLikedUser] = useState('');
  const [i,setI] = useState(0);
  const current_username = location.state.username;

  useEffect(() => {
    // Fetch profiles from your server
    fetchProfiles();

  }, []);

  const fetchProfiles = async () => {    

    try {

      console.log('fetchProfiles called');  
      const response = await axios.get('http://localhost:5001/profiles/'+current_username);
      setProfiles(response.data.profiles);

      if (response.data.profiles.length > 0) {
        newImage();
      }      

    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
    



  };

  const newImage = async () => {

    try {
        const imgResponse = await axios.get(`http://localhost:5000/random-image2/${current_username}`);
        if (imgResponse.data.success) {
         setImgUrl(imgResponse.data.random_image_url);
          console.log('got url = ',imgurl);
        } else {

            let c = 1;
        }
      } catch (error) {
        console.error('Error fetching image for profile:', imgurl, error);
      }


  };

  const handleLike = async (username) => {
    try {
      console.log("User Name ", username);
      // await axios.post('http://localhost:5001/like', { username: 'user84335', likedUsername: username, liked: true });
      await axios.post('http://localhost:5001/like', { username: current_username, likedUsername: username, liked: true });
      checkForMatch(username);
      setCurrentProfileIndex(currentProfileIndex + 1);
      newImage();
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  const handleDislike = async (username) => {
    try {
      // await axios.post('http://localhost:5001/dislike', { username: 'user84335', likedUsername: username, liked: false });
      await axios.post('http://localhost:5001/dislike', { username: current_username, likedUsername: username, liked: false });
      setCurrentProfileIndex(currentProfileIndex + 1);
      newImage();
    } catch (error) {
      console.error('Error disliking profile:', error);
    }
  };

  const checkForMatch = async (likedUsername) => {
    try {
      // const response = await axios.get(`http://localhost:5001/match/${likedUsername}`);
      const response = await axios.get(`http://localhost:5001/match/`+likedUsername+':'+current_username);
      if (response.data.match) {
        setMatchPopup(true); // Show match popup if there's a match
      }
    } catch (error) {
      console.error('Error checking for match:', error);
    }
  };

  const handleClosePopup = () => {
    setMatchPopup(false);
    setCurrentProfileIndex(currentProfileIndex + 1); // Increment profile index after closing popup
  };

  return (
    <div className="app">
      {matchPopup && (
        <div className="match-popup">
          <p>Congratulations! It's a match!</p>
          <button onClick={() => setMatchPopup(false)}>Close</button>
        </div>
      )}
      <div className="profile-card-container">
      {profiles.length > 0 && currentProfileIndex < profiles.length && (
        <div className="profile-card">
          <div className="profile-section">
          <img className="profile-image" src={imgurl} alt={profiles[currentProfileIndex].name} />
          {console.log('url agian =',imgurl)}
            <h2 className="profile-name">{profiles[currentProfileIndex].name}</h2>
            <hr className="divider" />
            <p className="about-title">About</p>
            <p className="profile-bio">{profiles[currentProfileIndex].essay0}</p>
          </div>
          <div className="profile-section">
            <hr className="divider" />
            <p className="about-title">Personal Information</p>
            {profiles[currentProfileIndex].age && (
              <p><strong>Age:</strong> {profiles[currentProfileIndex].age}</p>
            )}
            {profiles[currentProfileIndex].location && (
              <p><strong>Location:</strong> {profiles[currentProfileIndex].location}</p>
            )}
            {profiles[currentProfileIndex].status && (
              <p><strong>Status:</strong> {profiles[currentProfileIndex].status}</p>
            )}
          </div>
          <div className="profile-section">
            <hr className="divider" />
            <p className="about-title">Physical Attributes</p>
            {profiles[currentProfileIndex].sex && (
              <p><strong>Sex:</strong> {profiles[currentProfileIndex].sex}</p>
            )}
            {profiles[currentProfileIndex].orientation && (
              <p><strong>Orientation:</strong> {profiles[currentProfileIndex].orientation}</p>
            )}
            {profiles[currentProfileIndex].body_type && (
              <p><strong>Body Type:</strong> {profiles[currentProfileIndex].body_type}</p>
            )}
            {profiles[currentProfileIndex].height && (
              <p><strong>Height:</strong> {profiles[currentProfileIndex].height}</p>
            )}
          </div>
          <div className="profile-section">
            <hr className="divider" />
            <p className="about-title">Lifestyle</p>
            {profiles[currentProfileIndex].diet && (
              <p><strong>Diet:</strong> {profiles[currentProfileIndex].diet}</p>
            )}
            {profiles[currentProfileIndex].drinks && (
              <p><strong>Drinks:</strong> {profiles[currentProfileIndex].drinks}</p>
            )}
            {profiles[currentProfileIndex].drugs && (
              <p><strong>Drugs:</strong> {profiles[currentProfileIndex].drugs}</p>
            )}
            {profiles[currentProfileIndex].smokes && (
              <p><strong>Smoking:</strong> {profiles[currentProfileIndex].smokes}</p>
            )}
          </div>
          <div className="profile-section">
            <hr className="divider" />
            <p className="about-title">Background</p>
            {profiles[currentProfileIndex].education && (
              <p><strong>Education:</strong> {profiles[currentProfileIndex].education}</p>
            )}
            {profiles[currentProfileIndex].job && (
              <p><strong>Job:</strong> {profiles[currentProfileIndex].job}</p>
            )}
            {profiles[currentProfileIndex].ethnicity && (
              <p><strong>Ethnicity:</strong> {profiles[currentProfileIndex].ethnicity}</p>
            )}
            {profiles[currentProfileIndex].religion && (
              <p><strong>Religion:</strong> {profiles[currentProfileIndex].religion}</p>
            )}
          </div>
          <div className="profile-section">
            <hr className="divider" />
            <p className="about-title">Interests & Preferences</p>
            {profiles[currentProfileIndex].offspring && (
              <p><strong>Offspring:</strong> {profiles[currentProfileIndex].offspring}</p>
            )}
            {profiles[currentProfileIndex].pets && (
              <p><strong>Pets:</strong> {profiles[currentProfileIndex].pets}</p>
            )}
            {profiles[currentProfileIndex].speaks && (
              <p><strong>Languages Spoken:</strong> {profiles[currentProfileIndex].speaks}</p>
            )}
            {profiles[currentProfileIndex].sign && (
              <p><strong>Zodiac Sign:</strong> {profiles[currentProfileIndex].sign}</p>
            )}
          </div>
          <div className="actions">
            <button className="button like-button" onClick={() => handleLike(profiles[currentProfileIndex].username)}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
            <button className="button dislike-button" onClick={() => handleDislike(profiles[currentProfileIndex].username)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            {/* <button className="button report-button">
              <FontAwesomeIcon icon={faExclamationCircle} />
            </button> */}
          </div>
        </div>
      )}
      {currentProfileIndex >= profiles.length && <h2>No more profiles! Try changing your filters and preferences!</h2>}
      </div>
    </div>
  );
};

export default ShowProfiles;