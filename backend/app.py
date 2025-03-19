from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

DB_PATH = "followers.db"  # Use direct SQLite DB path

# Function to connect to the database
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Create table if it doesn't exist
def create_table():
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

create_table()  # Ensure table is created on startup

# API to add followers
@app.route("/add", methods=["POST"])
def add_followers():
    data = request.get_json()
    date = data.get("date")
    count = data.get("count")

    if not date or count is None:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO followers (date, count) VALUES (?, ?)", (date, count))
    conn.commit()
    conn.close()

    return jsonify({"message": "Data added successfully!"}), 201

# API to fetch followers
@app.route("/followers", methods=["GET"])
def get_followers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date ASC")
    followers = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in followers])

if __name__ == "__main__":
    app.run(debug=True)
