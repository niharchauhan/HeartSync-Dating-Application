import sqlite3
import pandas as pd
from rank_bm25 import BM25Okapi
import nltk
import string
import numpy as np

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')


#FILTER#
import pandas as pd
import sqlite3

def filter_users(target_age_min=None, target_age_max=None, target_sex=None, target_status=None,
                 target_orientation=None, target_drinks=None, target_drugs=None, target_ethnicity=None,
                 target_height=None, target_income=None, target_offspring=None, target_pets=None,
                 target_religion=None, target_smokes=None):

    # Connect to SQLite database
    conn = sqlite3.connect('users.db')
    query = "SELECT * FROM users LIMIT 500"
    df = pd.read_sql_query(query, conn)
    conn.close()

    print(df.head())

    # Applying filters dynamically
    if target_age_min is not None:
        df = df[df['age'] >= target_age_min]
    if target_age_max is not None:
        df = df[df['age'] <= target_age_max]
    if target_sex is not None:
        df = df[df['sex'].isin(target_sex)]
    if target_status is not None:
        df = df[df['status'].isin(target_status)]
    if target_orientation is not None:
        df = df[df['orientation'].isin(target_orientation)]
    if target_drinks is not None:
        df = df[df['drinks'].isin(target_drinks)]
    if target_drugs is not None:
        df = df[df['drugs'].isin(target_drugs)]
    if target_ethnicity is not None:
        df = df[df['ethnicity'].isin(target_ethnicity)]
    if target_height is not None:
        df = df[df['height'] > target_height]
    if target_income is not None:
        df = df[df['income'] >= target_income]
    if target_offspring is not None:
        df = df[df['offspring'].isin(target_offspring)]
    if target_pets is not None:
        df = df[df['pets'].isin(target_pets)]
    if target_religion is not None:
        df = df[df['religion'].isin(target_religion)]
    if target_smokes is not None:
        df = df[df['smokes'].isin(target_smokes)]

    return df


#FILTER#

# Define weights for each feature
feature_weights = {
    'ethnicity': 0,
    'job': 0,
    'body_type': 5,
    'location': 1,
    'religion': 3,
    'sign': 3,
    'speaks': 4,
    'essays_concatenated': 3
}

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
     

# Connect to SQLite database
conn = sqlite3.connect('users.db')
query = "SELECT * FROM users LIMIT 500"
df = pd.read_sql_query(query, conn)
conn.close()


#FILTER
filtered_df = filter_users(
    #target_age_min=20,
    #target_age_max=50,
    #target_sex=['Female']
    #target_status=['Single']
    #target_orientation=['Straight'],
    #target_drinks=['not-at-all'],
    #target_drugs=['never'],
    target_ethnicity=['American', 'Asian'],
    #target_height=150,  # Assuming height is in cm
    target_offspring=['Wants kids'],
    #target_pets=['Likes dogs'],
    target_religion=['Agnostic', 'Atheist','Jewish','Sikh','Catholic'],
    #target_smokes=['']
)
print('FILTERED DF')
print(filtered_df)
age_counts = filtered_df['ethnicity'].value_counts()
print(age_counts)
#FILTER
input()

# Preprocess essays by concatenating them and then preprocessing
df['essays_concatenated'] = df[['essay0', 'essay1', 'essay2', 'essay3', 'essay4', 'essay5', 'essay6', 'essay7', 'essay8', 'essay9']].fillna('').agg(' '.join, axis=1)
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

combined_features = calculate_combined_scores(bm25_objects, corpora, num_users, feature_weights)
   


# Function to calculate, scale BM25 scores, and return scores with indices
def calculate_scaled_bm25_scores_with_indices(bm25_obj, corpus, min_val=0, max_val=5):
    # Calculate BM25 scores for the corpus
    bm25_scores_matrix = [bm25_obj.get_scores(doc) for doc in corpus]
    
    # Scale scores for the entire matrix
    scaled_bm25_scores_matrix = [min_max_scale(scores, min_val, max_val) for scores in bm25_scores_matrix]
    
    # Pair scores with user indices
    bm25_scores_with_indices = [[(score, idx) for idx, score in enumerate(user_scores)] for user_scores in scaled_bm25_scores_matrix]
    
    return bm25_scores_with_indices

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

# Example to display sorted scores for user_0
print(sorted_combined_features_with_indices[0])

top_indices = [idx for score, idx in sorted_combined_features_with_indices[0] if idx != 0][:10]



def get_user_profiles(indices):
    conn = sqlite3.connect('users.db')
    placeholders = ', '.join(['?' for _ in indices])  # Create placeholders for SQL query
    query = f"SELECT username, age, body_type,diet,drinks,drugs,education,ethnicity,religion,job, ROWID FROM users WHERE ROWID IN ({placeholders})"
    df_top_profiles = pd.read_sql_query(query, conn, params=indices)
    conn.close()
    return df_top_profiles




# Fetch the top user profiles
top_user_profiles = get_user_profiles(top_indices)
print(top_user_profiles)

