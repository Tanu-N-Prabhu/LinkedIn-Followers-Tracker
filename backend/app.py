import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get the database path from environment variables (for Railway), fallback to local for development
# DATABASE = "/tmp/followers.db" if os.getenv("RAILWAY_ENVIRONMENT") else "./followers.db"

DATABASE = os.getenv("DATABASE_PATH", "./followers.db")  # Local use ./followers.db

def connect_db():
    return sqlite3.connect(DATABASE, check_same_thread=False)

def init_db():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT UNIQUE,
            count INTEGER
        )
        """)
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except sqlite3.Error as e:
        print(f"Error initializing the database: {e}")

@app.route('/get_entries', methods=['GET'])
def get_entries():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT date, count FROM followers ORDER BY date ASC")
        data = [{'date': row[0], 'followers': row[1]} for row in cursor.fetchall()]
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask App...")
    init_db()  # Ensure DB is initialized before running
    app.run(debug=True)