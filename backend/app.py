import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get database connection URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")  # Set this in Railway or locally

def connect_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def init_db():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Create followers table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS followers (
            id SERIAL PRIMARY KEY,
            date TEXT UNIQUE,
            count INTEGER
        )
        """)
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
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