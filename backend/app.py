from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

# Database connection
def get_db_connection():
    conn = sqlite3.connect("followers.db")
    conn.row_factory = sqlite3.Row
    return conn

# Create the table if it doesn't exist
def create_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            count INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

create_table()  # Ensure table is created on startup

# API Endpoint to add data
@app.route("/add", methods=["POST"])
def add_followers():
    data = request.get_json()

    if not data or "date" not in data or "count" not in data:
        return jsonify({"error": "Invalid data"}), 400

    date = data["date"]
    count = data["count"]

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO followers (date, count) VALUES (?, ?)", (date, count))
        conn.commit()
        conn.close()
        return jsonify({"message": "Data added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to get all followers data
@app.route("/followers", methods=["GET"])
def get_followers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date ASC")
    data = cursor.fetchall()
    conn.close()

    followers_list = [{"id": row["id"], "date": row["date"], "count": row["count"]} for row in data]

    return jsonify(followers_list)

if __name__ == "__main__":
    app.run(debug=True)
