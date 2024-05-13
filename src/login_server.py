# app.py (Flask Server)

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import base64
import os
import json

app = Flask(__name__)
CORS(app) 

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
    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Insert the new user into the database
    cursor.execute("INSERT INTO users (username, password, name, image_path, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (username, password, name, image_path, sex, age, location, status, orientation, body_type, diet, drinks, drugs, education, ethnicity, height, income, job, offspring, pets, religion, sign, smokes, speaks, essay0, essay1, essay2, essay3, essay4, essay5, essay6, essay7, essay8, essay9, last_online))

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


if __name__ == '__main__':
    app.run(debug=True)