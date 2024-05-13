from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from g4f.client import Client
from flask_socketio import SocketIO, send, emit
import random
import sqlite3
import pandas as pd
from rank_bm25 import BM25Okapi
import nltk
import string
import numpy as np
import ast
import json
import base64

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import base64

import os
import json

import requests
import random





#FILTER########################################################################################################################

PEXELS_API_KEY = 'EWZ8QvBgj7NkUKqWurmM6gPKczNwUud3qh3BJDgohA44g8hgdGE4R3mm'


i = 0
profilepage = 0
lastimage = ''

def filter_dataframe(df, column, target_value):
    if target_value is not None:
        value_list = target_value.split()  # Split the string by spaces into a list
        df = df[df[column].isin(value_list)]
    return df

def filter_users(target_age_min=None, target_age_max=None, target_sex=None, target_status=None,
                 target_orientation=None, target_drinks=None, target_drugs=None, target_ethnicity=None,
                 target_height=None, target_income=None, target_offspring=None, target_pets=None,
                 target_religion=None, target_smokes=None):

    # Connect to SQLite database
    conn = sqlite3.connect('users.db')
    query = "SELECT * FROM users LIMIT 1000"
    df = pd.read_sql_query(query, conn)
    conn.close()


    # Applying filters dynamically
    if target_age_min is not None:
        df = df[df['age'] >= target_age_min]
    if target_age_max is not None:
        df = df[df['age'] <= target_age_max]

    

    # Apply filters dynamically for list-based conditions
    if target_status is not None:
        df = filter_dataframe(df, 'status', target_status)
    if target_orientation is not None:
        df = filter_dataframe(df, 'orientation', target_orientation)
    if target_drinks is not None:
        df = filter_dataframe(df, 'drinks', target_drinks)
    if target_drugs is not None:
        df = filter_dataframe(df, 'drugs', target_drugs)
    if target_ethnicity is not None:
        df = filter_dataframe(df, 'ethnicity', target_ethnicity)
    if target_offspring is not None:
        df = filter_dataframe(df, 'offspring', target_offspring)
    if target_pets is not None:
        df = filter_dataframe(df, 'pets', target_pets)
    if target_religion is not None:
        df = filter_dataframe(df, 'religion', target_religion)
    if target_smokes is not None:
        df = filter_dataframe(df, 'smokes', target_smokes)

    # Numeric filters can remain the same
    if target_height is not None:
        df = df[df['height'] > target_height]
    if target_income is not None:
        df = df[df['income'] >= target_income]

    return df


#FILTER########################################################################################################################

# DB PROCESSING BM25
# ------------------------------------------------------------------------------------------------------------------------

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

# Define weights for each feature
feature_weights = {
    'ethnicity': 0,
    'job': 0,
    'body_type': 0,
    'location': 5,
    'religion': 0,
    'sign': 0,
    'speaks': 0,
    'essays_concatenated': 0
}

def get_user_profiles(indices):
    conn = sqlite3.connect('users.db')
    placeholders = ', '.join(['?' for _ in indices])  # Create placeholders for SQL query
    query = f"SELECT username,sex, age,orientation,status, body_type,diet,drinks,drugs,education,ethnicity,religion,job, ROWID FROM users WHERE ROWID IN ({placeholders})"
    df_top_profiles = pd.read_sql_query(query, conn, params=indices)
    conn.close()
    return df_top_profiles

# Function to calculate, scale BM25 scores, and return scores with indices
def calculate_scaled_bm25_scores_with_indices(bm25_obj, corpus, min_val=0, max_val=5):
    # Calculate BM25 scores for the corpus
    bm25_scores_matrix = [bm25_obj.get_scores(doc) for doc in corpus]
    
    # Scale scores for the entire matrix
    scaled_bm25_scores_matrix = [min_max_scale(scores, min_val, max_val) for scores in bm25_scores_matrix]
    
    # Pair scores with user indices
    bm25_scores_with_indices = [[(score, idx) for idx, score in enumerate(user_scores)] for user_scores in scaled_bm25_scores_matrix]
    
    return bm25_scores_with_indices

# Function to preprocess text
def preprocess(text):
    if not text:
        return []
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    words = nltk.word_tokenize(text)
    stop_words = set(nltk.corpus.stopwords.words('english'))
    words = [word for word in words if word not in stop_words]    
    return words

def min_max_scale(scores, min_val, max_val):
    min_score = min(scores)
    max_score = max(scores)
    if max_score - min_score == 0:  # Avoid division by zero if all scores are the same
        return [min_val if score <= min_val else max_val for score in scores]
    scaled_scores = [(score - min_score) / (max_score - min_score) * (max_val - min_val) + min_val for score in scores]
    return scaled_scores

# Function to display BM25 scores for a document in each corpus
def scale_and_display_scores(doc_index, min_val=0, max_val=5):
    for column in columns:
        raw_scores = bm25_objects[column].get_scores(corpora[column][doc_index])
        scaled_scores = min_max_scale(raw_scores, min_val, max_val)
        print(f"Scaled scores for {column}:")
        print(scaled_scores)

# Calculate the weighted combined BM25 scores
def calculate_combined_scores(bm25_objects, corpora, num_users, feature_weights):
    # Initialize the combined feature matrix with zeros
    combined_features = np.zeros((num_users, num_users))

    # Total weight normalization factor
    total_weight = sum(feature_weights.values())

    # Iterate over each feature to calculate scores
    for feature, bm25_obj in bm25_objects.items():
        scores_matrix = np.array([bm25_obj.get_scores(doc) for doc in corpora[feature]])
        
        # Scale each score matrix
        min_val, max_val = 0, 5  # Define the range for scaling
        scores_min = scores_matrix.min(axis=1, keepdims=True)
        scores_max = scores_matrix.max(axis=1, keepdims=True)
        scores_matrix = min_val + (scores_matrix - scores_min) / (scores_max - scores_min) * (max_val - min_val)
        
        # Avoid NaNs by replacing them with the minimum value
        scores_matrix = np.nan_to_num(scores_matrix, nan=min_val)
        
        # Apply the feature weight and sum the weighted scores matrix to the combined features matrix
        combined_features += scores_matrix * feature_weights[feature]

    # Normalize the combined features matrix by the total weight
    combined_features /= total_weight

    return combined_features



# Function to calculate, scale scores and return scores with indices for combined features matrix
def scale_and_sort_combined_features(combined_features, min_val=0, max_val=5):
    num_users = combined_features.shape[0]
    scaled_combined_features = np.zeros_like(combined_features)

    # Scale each user's scores using min-max scaling
    for i in range(num_users):
        scores = combined_features[i, :]
        scaled_scores = min_max_scale(scores, min_val, max_val)
        scaled_combined_features[i, :] = scaled_scores

    # Create a list of tuples (score, index) for sorting
    combined_scores_with_indices = []
    for i in range(num_users):
        score_with_indices = [(score, idx) for idx, score in enumerate(scaled_combined_features[i, :])]
        sorted_scores_with_indices = sorted(score_with_indices, key=lambda x: x[0], reverse=True)
        combined_scores_with_indices.append(sorted_scores_with_indices)

    return combined_scores_with_indices

# ------------------------------------------------------------------------------------------------------------------------



app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Change to a real secret in production
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

client = Client()

user_names = {}

@socketio.on('connect')
def handle_connect():
    user_id = request.sid
    user_name = f'User{random.randint(1000, 9999)}'
    user_names[user_id] = user_name
    emit('assign_name', {'name': user_name}, room=user_id)

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.sid
    print(f'User disconnected: {user_id}')
    del user_names[user_id]

@socketio.on('message')
def handle_message(data):
    user_id = request.sid
    data['name'] = user_names.get(user_id, 'Unknown')
    emit('message', data, broadcast=True, include_self=False)

# Existing AI assistant endpoint
@app.route('/ask-assistant', methods=['POST'])
def ask_assistant():
    data = request.get_json()
    current_conversation = data.get('conversation')
    current_user = data.get('currentUser')  # Retrieve current user from payload
    otherUser = data.get('otherUser')  # Retrieve current user from payload

    if not current_conversation:
        return jsonify({"error": "No conversation provided"}), 400
    

    conn = sqlite3.connect('users.db')

    #FILTER DATA HERE

    query = "SELECT * FROM users WHERE username = ?"


    df = pd.read_sql_query(query, conn, params=(otherUser,))

    row = df.iloc[0]

    conn.close()

    user_profile = ", ".join([f"{key}: {value}" for key, value in row.items()])

    print('user profile = ',user_profile)




    # Adjust the prompt to ask for suggestions specifically for the current user
    conversation_text = "\n".join([f"{msg.get('name', '')}: {msg.get('message', '')}" for msg in current_conversation])
    prompt = f"I am {current_user} and I am talking to {otherUser}. This is {otherUser}'s profile {user_profile}. Based on {otherUser}'s profile and following latest conversation:\n{conversation_text}\n give me 5 suggestions for my next message based on our latest conversation and {otherUser}'s whole profile"

    print(prompt)

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": prompt}]
    )
    suggestion = response.choices[0].message.content
    suggestions = suggestion.strip().split('\n')

    return jsonify({"suggestions": suggestions})

@app.route('/update-weights', methods=['POST'])
def update_weights():

    feature_weights = {
        'ethnicity': 0,
        'job': 0,
        'body_type': 0,
        'location': 5,
        'religion': 0,
        'sign': 0,
        'speaks': 0,
        'essays_concatenated': 0
    }

    # Receive weights from the frontend
    data = request.json

    weights = data.get('weights')

    feature_weights['ethnicity'] = weights['ethnicity']
    feature_weights['job'] = weights['job']
    feature_weights['body_type'] = weights['bodyType']
    feature_weights['location'] = weights['location']
    feature_weights['religion'] = weights['religion']
    feature_weights['sign'] = weights['horrorscope']
    feature_weights['speaks'] = weights['language']
    feature_weights['essays_concatenated'] = weights['bio']

    print('fw = ',feature_weights)

    current_user = data.get('current_user')
    if not weights:
        return jsonify({'error': 'Missing weights'}), 400

    # Update feature weights based on received data
    feature_weights = {key: float(value) for key, value in weights.items()}

    # Call your recommendation calculation function
    recommendations = calculate_recommendations(feature_weights,current_user)

    # Return JSON response
    return jsonify({'recommendations': recommendations})

def calculate_recommendations(feature_weight,current_user):

    # Connect to SQLite database
    conn = sqlite3.connect('users.db')

    #FILTER DATA HERE

    query = "SELECT * FROM users WHERE username = ?"


    df = pd.read_sql_query(query, conn, params=(current_user,))

    print("print df tar = " ,  df )


# Define a dictionary to store the target variables
    target_variables = {}

    # Iterate over each column that begins with 'target'
    for column in df.columns:
        if column.startswith('target'):
            # Attempt to convert the string representation of a list to a list
            try:
                # Safely evaluate the string as a list if it's not already a list
                if isinstance(df[column].iloc[0], str):
                    evaluated_data = ast.literal_eval(df[column].iloc[0])
                else:
                    evaluated_data = df[column].iloc[0]
                    
                # Check if the result is a list and convert it to a space-separated string
                if isinstance(evaluated_data, list):
                    target_variables[column] = ' '.join(evaluated_data)
                else:
                    target_variables[column] = evaluated_data
            except ValueError:
                # Handle the case where the column is not a list or string representation of a list
                target_variables[column] = df[column].iloc[0]      

    print('drinks  = ',target_variables['target_drinks'])      

    filtered_df = filter_users(
        target_age_min=target_variables['target_age_min'],
        target_age_max=target_variables['target_age_max'],
        target_sex=target_variables['target_sex'],
        target_status=target_variables['target_status']
        #target_orientation=target_variables['target_orientation']
        #target_drinks=target_variables['target_drinks']
        #target_drugs=target_variables['target_drugs']
        #target_ethnicity=target_variables['target_ethnicity']
        #target_height=target_variables['target_height'],  
        #target_offspring=target_variables['target_offspring']
        #target_pets=target_variables['target_pets'],
        #target_religion=target_variables['target_religion']
        #target_smokes=target_variables['target_smokes']
    )

    filtered_df.loc[len(filtered_df)] = df.iloc[0].values
    

    df = filtered_df

    print('got following = ',df)





    #query = "SELECT body_type, ethnicity, job, location, religion, sign, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9 FROM users LIMIT 500"
    #df = pd.read_sql_query(query, conn)
    conn.close()



    # Preprocess essays by concatenating them and then preprocessing
    #df['essays_concatenated'] = df[['essay0', 'essay1', 'essay2', 'essay3', 'essay4', 'essay5', 'essay6', 'essay7', 'essay8', 'essay9']].fillna('').agg(' '.join, axis=1)
    concatenated_series = df[['essay0', 'essay1', 'essay2', 'essay3', 'essay4', 'essay5', 'essay6', 'essay7', 'essay8', 'essay9']].fillna('').agg(lambda x: ' '.join(x), axis=1)
    df['essays_concatenated'] = concatenated_series


    df['essays_concatenated'] = df['essays_concatenated'].apply(preprocess)

    # Initialize dictionaries to hold BM25 objects and corpora
    bm25_objects = {}
    corpora = {}

    # Columns to calculate BM25 on
    columns = ['body_type','ethnicity', 'job', 'location', 'religion', 'sign', 'speaks', 'essays_concatenated']

    # Calculate BM25 for each column
    for column in columns:
        if column != 'essays_concatenated':  # Handle categorical data
            df[column] = df[column].fillna('').apply(lambda x: x.split())
        corpus = df[column].tolist()
        corpora[column] = corpus
        bm25 = BM25Okapi(corpus)
        bm25_objects[column] = bm25

    # Number of users (assumed to be the number of rows in df)
    num_users = len(df)   

    print('num users = ',num_users)

    combined_features = calculate_combined_scores(bm25_objects, corpora, num_users, feature_weights)

    # Calculate and store scaled BM25 scores with indices
    scaled_bm25_with_indices = {}
    for column in columns:
        scaled_bm25_with_indices[column] = calculate_scaled_bm25_scores_with_indices(bm25_objects[column], corpora[column])

    # Sort the scores with indices
    sorted_bm25_scores_with_indices = {}
    for column in columns:
        # Sort each user's scores in descending order while keeping indices
        sorted_bm25_scores_with_indices[column] = [sorted(user_scores, key=lambda x: x[0], reverse=True) for user_scores in scaled_bm25_with_indices[column]]
        

    # Calculate and sort scaled scores with indices for the combined features matrix
    sorted_combined_features_with_indices = scale_and_sort_combined_features(combined_features)    

    last_index = len(df) - 1

    top_indices = [idx for score, idx in sorted_combined_features_with_indices[last_index] if idx != last_index][:50]
    top_user_profiles = get_user_profiles(top_indices)

    print(last_index)


    if target_variables['target_age_min'] is not None:
        top_user_profiles = top_user_profiles[top_user_profiles['age'] >= target_variables['target_age_min']]
    if target_variables['target_age_max'] is not None:
        top_user_profiles = top_user_profiles[top_user_profiles['age'] <= target_variables['target_age_max']]

    

    print('error = ',top_user_profiles['sex'].values)

    # Apply filters dynamically for list-based conditions
    # if target_variables['target_sex'] is not None:
    #     top_user_profiles = top_user_profiles[top_user_profiles['sex'].iloc.isin([target_variables['target_sex']])]  # Wraps the string in a list


    # if target_variables['target_sex']:
    #     target_sex_list = target_variables['target_sex'].split()  

    #     top_user_profiles = top_user_profiles[top_user_profiles['sex'].isin(target_sex_list)]    

    # if target_variables['target_status'] is not None:
    #     # Split the target_status into a list if it's a non-empty string
    #     target_status_list = target_variables['target_status'].split()  # Assuming space-separated values
    #     # Filter the DataFrame
    #     top_user_profiles = top_user_profiles[top_user_profiles['status'].isin(target_status_list)]


    if target_variables['target_orientation'] is not None:
        # Split the target_orientation into a list if it's a non-empty string
        target_orientation_list = target_variables['target_orientation'].split()  # Assuming space-separated values

        top_user_profiles = top_user_profiles[top_user_profiles['orientation'].isin(target_orientation_list)]


    if target_variables['target_ethnicity'] is not None:
        # Split the target_orientation into a list if it's a non-empty string
        target_orientation_list = target_variables['target_ethnicity'].split()  # Assuming space-separated values

        top_user_profiles = top_user_profiles[top_user_profiles['ethnicity'].isin(target_orientation_list)]        




    print('target sex = ',target_variables['target_sex'])

    top_indices = top_user_profiles['rowid'].values



    file_name = f"{current_user}_recommendations.txt"

    # Writing to a text file
    with open(file_name, 'w') as file:
        for index in top_indices:
            file.write(f"{index}\n")

    # Convert DataFrame to a list of dictionaries for JSON serialization
    result_profiles = top_user_profiles.to_dict(orient='records')


    return result_profiles


@app.route('/conversations', methods=['GET'])
def get_conversations():
    # Extract username from the query parameter
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username parameter is missing"}), 400

    # Connect to the SQLite database
    conn = sqlite3.connect('conversations.db')
    cursor = conn.cursor()

    # Prepare SQL query to find all unique users that the given user has talked to
    query = """
    SELECT DISTINCT User2 FROM conversations WHERE User1 = ?
    UNION
    SELECT DISTINCT User1 FROM conversations WHERE User2 = ?
    """
    cursor.execute(query, (username, username))
    
    # Fetch all results
    users = cursor.fetchall()
    # Convert the result into a simple list
    user_list = [user[0] for user in users if user[0] != username]  # exclude the requesting user from the list

    # Close the database connection
    conn.close()

    # Return the list of users as a JSON response
    return jsonify({"conversations_with": user_list})



@app.route('/messages', methods=['GET'])
def get_messages():
    user1 = request.args.get('User1')
    user2 = request.args.get('User2')

    if not user1 or not user2:
        return jsonify({"error": "Missing parameters"}), 400

    # Connect to the SQLite database
    conn = sqlite3.connect('conversations.db')
    cursor = conn.cursor()

    # Prepare SQL query to find conversations between the two users
    # Ensure sorting is accurate by treating Timestamp as a datetime
    query = """
    SELECT User1, Timestamp, Message FROM conversations
    WHERE (User1 = ? AND User2 = ?) OR (User1 = ? AND User2 = ?)
    ORDER BY datetime(Timestamp) ASC  
    """
    cursor.execute(query, (user1, user2, user2, user1))

    # Fetch all results
    conversations = cursor.fetchall()

    # Close the database connection
    conn.close()

    # Prepare response
    result = [{'sender': sender, 'timestamp': ts, 'message': msg} for sender, ts, msg in conversations]

    # Return the conversations as a JSON response
    return jsonify(result)


@app.route('/saveconversation', methods=['POST'])
def save_conversation():
    data = request.get_json()
    user1 = data.get('User1')
    user2 = data.get('User2')
    timestamp = data.get('Timestamp')
    message = data.get('Message')

    # Validate data
    if not all([user1, user2, timestamp, message]):
        return jsonify({"error": "Missing data"}), 400

    # Connect to the SQLite database
    conn = sqlite3.connect('conversations.db')
    cursor = conn.cursor()

    # Create table if not exists (optional, run once)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS conversations (
        User1 TEXT,
        User2 TEXT,
        Timestamp TEXT,
        Message TEXT
    )
    ''')

    # Insert the new conversation
    cursor.execute('''
    INSERT INTO conversations (User1, User2, Timestamp, Message) 
    VALUES (?, ?, ?, ?)
    ''', (user1, user2, timestamp, message))

    conn.commit()  # Commit the transaction
    conn.close()  # Close the database connection

    return jsonify({"success": "Conversation saved"}), 201




######################### VARUN's BACKEND ############################################################



# Function to validate user credentials
def validate_user(username, password):
    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Query the database for the user
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = cursor.fetchone()

    # Close the database connection
    conn.close()

    return user is not None

# Route for handling login requests
@app.route('/login', methods=['GET','POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if validate_user(username, password):
        return jsonify({'success': True, 'message': 'User validated'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'})

# Function to add a new user to the database
def add_user(username, password, image_path, name, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online):

    # Serialize the pets array into a string
    pets_str = json.dumps(pets)

    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Insert the new user into the database
    cursor.execute("INSERT INTO users (username, password, name, image_path, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (username, password, name, image_path, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets_str, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online))

    # Commit changes and close the database connection
    conn.commit()
    conn.close()

# Route for handling join requests
@app.route('/join', methods=['POST'])
def join():
    data = request.get_json()
    username = data['username']
    password = data['password']
    name = data['name']
    sex = data['sex']
    age = data['age']
    location = data['location']
    status = data['status']
    orientation = data['orientation']
    body_type = data['body_type']
    diet = data['diet']
    drinks = data['drinks']
    drugs = data['drugs']
    education = data['education']
    ethnicity = data['ethnicity']
    height = data['height']
    income = data['income']
    job = data['job']
    offspring = data['offspring']
    pets = data['pets']
    religion = data['religion']
    sign = data['sign']
    smokes = data['smokes']
    speaks = data['speaks']
    essay0 = data['essay0']
    essay1 = data['essay1']
    essay2 = data['essay2']
    essay3 = data['essay3']
    essay4 = data['essay4']
    essay5 = data['essay5']
    essay6 = data['essay6']
    essay7 = data['essay7']
    essay8 = data['essay8']
    essay9 = data['essay9']
    last_online = data['last_online']
    image_data = data['image']

    # Decode base64 image data
    image_binary = base64.b64decode(image_data)

    # Save the image locally with the username as the filename
    image_path = os.path.join('C:\\Users\\pavit\\Desktop\\react-chat-app\\images', f"{username}.png")
    with open(image_path, 'wb') as f:
        f.write(image_binary)

    if validate_user(username, password):
        return jsonify({'success': False, 'message': 'User already exists'})
    else:
        add_user(username, password, name, image_path, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online)
        return jsonify({'success': True, 'message': 'User added successfully'})

@app.route('/preference', methods=['POST'])
def update_preference():
    data = request.get_json()
    username = data['username']

    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Initialize the list to hold the columns and values to update
    update_values = []

    # Iterate through the received data and add non-empty values to the update list
    for key, value in data.items():
        if value:  # Check if the value is not empty
            # Serialize lists to strings
            if isinstance(value, list):
                value = json.dumps(value)
            update_values.append((key, value))

    # Prepare the SQL update statement
    columns = ', '.join([f"{column} = ?" for column, _ in update_values])
    update_statement = f"""
        UPDATE users
        SET {columns}
        WHERE username = ?
    """

    # Extract the values to update and add username at the end
    update_params = [value for _, value in update_values]
    update_params.append(username)

    # Update the user preferences in the database
    cursor.execute(update_statement, tuple(update_params))

    # Commit changes and close the database connection
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'User preferences updated successfully'})

# Route for handling getting user details
@app.route('/user/<username>', methods=['GET'])
def get_user_details(username):
    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Query the database for the user details
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    user_details = cursor.fetchone()

    # Close the database connection
    conn.close()

    if user_details:
        # Extract user details
        user = {
            'username': user_details[31],
            'password': user_details[32],
            'name': user_details[33],
            'image_path': user_details[34],
            'age': user_details[0],
            'status': user_details[1],
            'sex': user_details[2],
            'orientation': user_details[3],
            'body_type': user_details[4],
            'diet': user_details[5],
            'drinks': user_details[6],
            'drugs': user_details[7],
            'education': user_details[8],
            'ethnicity': user_details[9],
            'height': user_details[10],
            'income': user_details[11],
            'job': user_details[12],
            'last_online': user_details[13],
            'location': user_details[14],
            'offspring': user_details[15],
            'pets': user_details[16],
            'religion': user_details[17],
            'sign': user_details[18],
            'smokes': user_details[19],
            'speaks': user_details[20],
            'essay0': user_details[21],
            'essay1': user_details[22],
            'essay2': user_details[23],
            'essay3': user_details[24],
            'essay4': user_details[25],
            'essay5': user_details[26],
            'essay6': user_details[27],
            'essay7': user_details[28],
            'essay8': user_details[29],
            'essay9': user_details[30],
            'target_age_min': user_details[35],
            'target_age_max': user_details[36],
            'target_sex': user_details[37],
            'target_status': user_details[38],
            'target_orientation': user_details[39],
            'target_drinks': user_details[40],
            'target_drugs': user_details[41],
            'target_ethnicity': user_details[42],
            'target_height': user_details[43],
            'target_income': user_details[44],
            'target_offspring': user_details[45],
            'target_pets': user_details[46],
            'target_religion': user_details[47],
            'target_smokes': user_details[48]
        }
        return jsonify({'success': True, 'user': user})
    else:
        return jsonify({'success': False, 'message': 'User not found'})




###PHOTOS###########################################################################################


@app.route('/random-image/<username>', methods=['GET'])
def get_random_image(username):

    global profilepage
    global lastimage

    profilepage += 1

    if profilepage == 2:
        return lastimage

    print(username)

    conn = sqlite3.connect('users.db')

    query = "SELECT * FROM users WHERE username = ?"


    df = pd.read_sql_query(query, conn, params=(username,))

    conn.close()

    print(df['sex'][0])

    gender = df['sex'][0]
    
    try:
        # Make a request to the Pexels API

        if gender == 'Male' or gender == 'male':
            response = requests.get('https://api.pexels.com/v1/search?query=man', headers={'Authorization': PEXELS_API_KEY})

        else:
            response = requests.get('https://api.pexels.com/v1/search?query=hot girl', headers={'Authorization': PEXELS_API_KEY})
        data = response.json()

        # Extract the URL of a random image
        random_index = random.randint(0, len(data['photos']) - 1)
        random_image_url = data['photos'][random_index]['src']['large']

        lastimage = jsonify({'success': True, 'random_image_url': random_image_url})

        return jsonify({'success': True, 'random_image_url': random_image_url})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
    

@app.route('/reseti', methods=['GET'])    
def reseti():

    global i
    global profilepage

    i=0
    profilepage = 0
    return jsonify({'success': True})

@app.route('/random-image2/<username>', methods=['GET'])
def get_random_image2(username):

    global i

    i = i+1

    if i == 2:
        return jsonify({'success': False})

    print(username)

    conn = sqlite3.connect('users.db')

    query = "SELECT * FROM users WHERE username = ?"


    df = pd.read_sql_query(query, conn, params=(username,))

    conn.close()

    print(df['sex'][0])

    gender = df['sex'][0]
    
    try:
        # Make a request to the Pexels API

        if gender == 'Male' or gender == 'male':
            response = requests.get('https://api.pexels.com/v1/search?query=hot girl', headers={'Authorization': PEXELS_API_KEY})

        else:
            response = requests.get('https://api.pexels.com/v1/search?query=man', headers={'Authorization': PEXELS_API_KEY})
        data = response.json()

        # Extract the URL of a random image
        random_index = random.randint(0, len(data['photos']) - 1)
        random_image_url = data['photos'][random_index]['src']['large']

        return jsonify({'success': True, 'random_image_url': random_image_url})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})    



#####################################################################################################










######################### VARUN's BACKEND ############################################################






if __name__ == "__main__":
    socketio.run(app, debug=True)






