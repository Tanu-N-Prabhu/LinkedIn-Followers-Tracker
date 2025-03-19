import os
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# Path to the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
DB_PATH = os.path.join(BASE_DIR, 'followers.db')  
print(f"Using database at: {DB_PATH}")  

# Get database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)  
    conn.row_factory = sqlite3.Row
    return conn

# Route to add new follower data
@app.route('/add', methods=['POST'])
def add_follower():
    data = request.get_json()
    print(f"Received Data: {data}")  # Debugging log

    date = data.get('date')
    count = data.get('count')

    if not date or count is None:
        return jsonify({"error": "Missing data"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO followers (date, count) VALUES (?, ?)', (date, count))
        conn.commit()
        conn.close()
        return jsonify({"message": "Data added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get all followers data
@app.route('/followers', methods=['GET'])
def get_followers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM followers')
    rows = cursor.fetchall()
    conn.close()

    return jsonify([{"id": row["id"], "date": row["date"], "count": row["count"]} for row in rows])

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
    create_db()
    app.run(debug=True)
