import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Extract SQLite database path from env variable (REMOVE "sqlite:///")
DB_PATH = os.getenv("DATABASE_URL", "followers.db").replace("sqlite:///", "")

# Ensure Database & Table Exist
def create_table():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE NOT NULL,
            count INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

create_table()  # Ensure the table is created on startup

# Route to Add Follower Data
@app.route("/add", methods=["POST"])
def add_follower():
    data = request.json
    date = data.get("date")
    count = data.get("count")

    if not date or count is None:
        return jsonify({"error": "Missing data"}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO followers (date, count) VALUES (?, ?)", (date, count))
        conn.commit()
        conn.close()
        return jsonify({"message": "Follower count added successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Date already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to Fetch Data
@app.route("/followers", methods=["GET"])
def get_followers():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT date, count FROM followers ORDER BY date")
    data = [{"date": row[0], "count": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
