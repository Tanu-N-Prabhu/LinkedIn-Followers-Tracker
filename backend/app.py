import os
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# Path to the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get the absolute path of the backend folder
DB_PATH = os.path.join(BASE_DIR, 'followers.db')  # Path to the SQLite database inside backend folder
print(f"Using database at: {DB_PATH}")  # Debugging log

# Get database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)  # Ensure you're using the correct path
    conn.row_factory = sqlite3.Row
    return conn

# Route to add new follower data
@app.route('/add', methods=['POST'])
def add_follower():
    data = request.get_json()
    date = data.get('date')
    count = data.get('count')

    if not date or not count:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Insert new follower data into the database
    cursor.execute('INSERT INTO followers (date, count) VALUES (?, ?)', (date, count))
    conn.commit()
    conn.close()

    return jsonify({"message": "Data added successfully!"}), 200

# Route to get all followers data
@app.route('/followers', methods=['GET'])
def get_followers():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM followers')
    rows = cursor.fetchall()

    followers_data = []
    for row in rows:
        followers_data.append({
            'id': row['id'],
            'date': row['date'],
            'count': row['count']
        })

    conn.close()
    return jsonify(followers_data)

# Ensure the database table exists
def create_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        count INTEGER NOT NULL
    )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_db()  # Create the table if it doesn't exist
    app.run(debug=True)
