import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';  // Import format and parseISO functions
import Chat from './Chat'; // Import Chat component
import { useLocation, useNavigate } from 'react-router-dom';

function Inbox() {

/////////////////////TESTING CURRENT USER

    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state.username;

const [currentUser, setCurrentUser] = useState(username);
const [isUserSet, setIsUserSet] = useState(false);

const handleNameSubmit = (event) => {
    event.preventDefault();
    const name = event.target.name.value; // Assuming your input's name attribute is 'name'
    setCurrentUser(name);
    setIsUserSet(true);
};



    //const currentUser = "Pavitra";
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);  // Track the selected user for chatting

    useEffect(() => {
        const fetchUsers = () => {
            axios.get(`http://localhost:5000/conversations?username=${currentUser}`)
                .then(response => {
                    setUsers(response.data.conversations_with);
                })
                .catch(error => {
                    console.error('Error fetching data: ', error);
                });
        };
        fetchUsers();
        const interval = setInterval(fetchUsers, 1000);

        return () => clearInterval(interval);
    }, [currentUser]);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = () => {
                axios.get(`http://localhost:5000/messages?User1=${currentUser}&User2=${selectedUser}`)
                    .then(response => {
                        setMessages(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching messages: ', error);
                    });
            };

            fetchMessages();
            const interval = setInterval(fetchMessages, 1000);

            return () => clearInterval(interval);
        }
    }, [selectedUser, currentUser]);

    const styles = {
        inboxStyle: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            background: '#f7f7f7', // light grey background
            width: '200%'
        },
        boxStyle: {
            width: '200%', // increased from 70% to 80% to make the box wider
            maxWidth: '1200px', // increased from 1000px to 1200px
            height: '80vh', // responsive height
            border: '1px solid #ccc', // lighter border
            display: 'flex',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // subtle shadow
            borderRadius: '8px', // rounded corners
            overflow: 'hidden', // ensures nothing overflows
        },
        userListStyle: {
            flex: 1,
            borderRight: '1px solid #ddd',
            padding: '10px',
            background: '#ffffff', // white background for clarity
            overflowY: 'auto', // allows scrolling
        },
        messageAreaStyle: {
            flex: 3,
            padding: '10px',
            overflowY: 'auto', // allows scrolling
        },
        userDivStyle: {
            padding: '10px',
            border: '1px solid #eee',
            marginBottom: '5px',
            cursor: 'pointer',
            borderRadius: '4px', // rounded corners for user divs
            backgroundColor: '#f0f0f0', // slightly off-white for contrast
            transition: 'background-color 0.3s', // smooth transition for hover effect
            ':hover': {
                backgroundColor: '#e2e2e2' // change color on hover
            }
        },
        messageDivStyle: {
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#ffffff', // messages on a white background
            borderRadius: '4px', // rounded corners for messages
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // subtle shadow for messages
        }
    };

    const handleUserClick = (otherUser) => {
        setSelectedUser(otherUser);
    };

/*    return (
        <div style={styles.inboxStyle}>
            <h1>Conversations</h1>
            <div style={styles.boxStyle}>
                <div style={styles.userListStyle}>
                    <h2>Your Matches</h2>
                    {users.map((user, index) => (
                        <div key={index} style={styles.userDivStyle} onClick={() => handleUserClick(user)}>
                            {user}
                        </div>
                    ))}
                </div>
                <div style={styles.messageAreaStyle}>
                    {messages.map((msg, index) => (
                        <div key={index} style={styles.messageDivStyle}>
                            ({format(parseISO(msg.timestamp), 'dd MMMM p')}) {msg.sender}: {msg.message}
                        </div>
                    ))}
                    {selectedUser && <Chat otherUser={selectedUser} current={currentUser} initialMessages={messages} />}
                </div>
            </div>
        </div>
    );*/ //WORKING CODE

    return (
        <div style={styles.inboxStyle}>

                <>
                    <h1>Conversations</h1>
                    <div style={styles.boxStyle}>
                        <div style={styles.userListStyle}>
                            <h2>Your Matches</h2>
                            {users.map((user, index) => (
                                <div key={index} style={styles.userDivStyle} onClick={() => handleUserClick(user)}>
                                    {user}
                                </div>
                            ))}
                        </div>
                        <div style={styles.messageAreaStyle}>
                            {messages.map((msg, index) => (
                                <div key={index} style={styles.messageDivStyle}>
                                    ({format(parseISO(msg.timestamp), 'dd MMMM p')}) {msg.sender}: {msg.message}
                                </div>
                            ))}
                            {selectedUser && <Chat otherUser={selectedUser} current={currentUser} initialMessages={messages} />}
                        </div>
                    </div>
                </>
        </div>
    );    
}

export default Inbox;
