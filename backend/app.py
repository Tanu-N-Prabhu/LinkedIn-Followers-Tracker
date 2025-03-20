import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://followers-tracker.netlify.app"])

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

# Fetchning the followers from the database
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

#Adding the entries to the database
@app.route('/add_entry', methods=['POST'])
def add_entry():
    try:
        data = request.json
        date = data['date']
        count = data['followers']
        
        # Check if the date already exists
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM followers WHERE date = %s", (date,))
        if cursor.fetchone()[0] > 0:
            return jsonify({'error': 'Entry for this date already exists.'}), 400

        # Insert the new entry into the database
        cursor.execute("INSERT INTO followers (date, count) VALUES (%s, %s)", (date, count))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Entry added successfully.'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_entry/<date>', methods=['DELETE'])
def delete_entry(date):
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM followers WHERE date = ?", (date,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Entry deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_entry/<date>', methods=['PUT'])
def update_entry(date):
    data = request.json
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE followers SET count = ? WHERE date = ?", (data['followers'], date))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Entry updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask App...")
    init_db()  # Ensure DB is initialized before running
    app.run(debug=True)
