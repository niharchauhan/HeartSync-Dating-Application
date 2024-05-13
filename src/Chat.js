import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { format, parseISO } from 'date-fns'; // Importing necessary functions
import './Chat.css'

const socket = io.connect('http://localhost:5000');

function Chat({ otherUser, current, initialMessages }) {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [userName, setUserName] = useState('');
    const [loadingAssistant, setLoadingAssistant] = useState(false);


    useEffect(() => {
        // Only set initial messages if the messages array is empty
        if (messages.length === 0) {
            const formattedInitialMessages = initialMessages.map(msg => ({
                ...msg,
                name: msg.sender, // Ensure this is consistent
                timestampFormatted: format(parseISO(msg.timestamp), 'd MMMM p')
            }));
            setMessages(formattedInitialMessages);
        }
    
        socket.on('assign_name', (data) => {
            setUserName(data.name);
        });
    
        socket.on('message', (message) => {
            console.log('Received message:', message);
            if (message.name === otherUser || message.name === userName) {
                message.timestampFormatted = format(parseISO(message.timestamp), 'd MMMM p');
                // Check if the message is already in the state to avoid duplication
                if (!messages.find(m => m.timestamp === message.timestamp && m.content === message.content)) {
                    setMessages(prevMessages => [...prevMessages, message]);
                }
            }
        });
    
        return () => {
            socket.off('assign_name');
            socket.off('message');
        };
    }, [otherUser, userName, initialMessages, messages]);


    const formattedConversation = messages.map(msg => ({
        name: msg.name,
        message: msg.content || msg.message,  // Fallback to `message` if `content` is undefined
        timestamp: msg.timestamp,
        sender: msg.sender
    }));

    const sendMessage = (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;
    
        const message = {
            name: current,
            content: userInput,
            timestamp: new Date().toISOString(),
            receiver: otherUser // Assuming 'otherUser' is the receiver
        };
    
        // Emit the message to the server to be broadcasted to other users
        socket.emit('message', { name: userName, content: userInput, timestamp: message.timestamp });
    
        // Save the conversation via API call
        fetch('http://localhost:5000/saveconversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                User1: current,
                User2: otherUser,
                Timestamp: message.timestamp,
                Message: userInput
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Save successful:', data);
        })
        .catch(error => {
            console.error('Error saving conversation:', error);
        });
    
        // Clear the user input after sending the message
        setUserInput('');
    };
    



    const askAssistant = () => {
        // First fetch the latest messages
        setLoadingAssistant(true);
        fetch(`http://localhost:5000/messages?User1=${current}&User2=${otherUser}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            // Update messages state with the latest fetched messages
            const updatedMessages = data.map(msg => ({
                ...msg,
                name: msg.sender,
                timestampFormatted: format(parseISO(msg.timestamp), 'd MMMM p')
            }));
            setMessages(updatedMessages);
    
            // Prepare the payload for asking the assistant
            const payload = {
                currentUser: current,
                otherUser: otherUser,
                conversation: updatedMessages.map(msg => ({
                    name: msg.name,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    sender: msg.sender
                })),
            };
    
            // Now send the updated conversation to the assistant
            return fetch('http://localhost:5000/ask-assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        })
        .then(response => response.json())
        .then(data => {
            setSuggestions(data.suggestions);
            setLoadingAssistant(false);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const handleSuggestionClick = (suggestion) => {
        // Strip any leading numbers followed by a dot and space (e.g., '1. ') and also remove the double quotes
        const cleanSuggestion = suggestion.replace(/^\d+\.\s+/, '').replace(/^"(.+(?="$))"$/, '$1');
        setUserInput(cleanSuggestion);
        setSuggestions([]);
    };

    const styles = {
        inputStyle: {
            width: '100%',  // Makes the input box take the full width of its container
            height: '50px',  // Sets a fixed height
            padding: '10px',  // Adds space inside the box around the text
            fontSize: '16px',  // Sets the size of the text
            boxSizing: 'border-box',  // Includes padding and border in the width and height
            borderRadius: '5px',  // Rounds the corners of the input box
            border: '1px solid #ccc',  // Adds a subtle border
            marginBottom: '10px',  // Adds space below the input box
        }
    };
    
    return (
        <div>
            {loadingAssistant && (
                <div className="assistant-loading">
                    <h2>Please wait while HeartSync AI Assistant generates suggestions!</h2>
                </div>
            )}            
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {messages.map((msg, index) => (
                    msg.content ? (
                        <li key={index}>
                            <span>({msg.timestampFormatted})</span>
                            <b> {msg.name}: </b> {msg.content}
                        </li>
                    ) : null
                ))}
            </ul>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.inputStyle}  // Applying the custom styles
                />
                <button type="submit">Send</button>
            </form>
            <button onClick={askAssistant}>Ask HeartSynch Assistant ❤️</button>
            {suggestions.length > 0 && (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {suggestions.map((suggestion, index) => (
                        <li key={index} style={{ cursor: 'pointer' }} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Chat;
