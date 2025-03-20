import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://followers-tracker.netlify.app", "http://localhost:3000"]}})

DATABASE_URL = os.getenv("DATABASE_URL")

def connect_db():
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def init_db():
    try:
        with connect_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS followers (
                    id SERIAL PRIMARY KEY,
                    date TEXT UNIQUE,
                    count INTEGER
                )
                """)
            conn.commit()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing the database: {e}")

@app.route('/get_entries', methods=['GET'])
def get_entries():
    try:
        with connect_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT date, count FROM followers ORDER BY date ASC")
                data = [{'date': row[0], 'followers': row[1]} for row in cursor.fetchall()]
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_entry', methods=['POST'])
def add_entry():
    try:
        data = request.json
        date, count = data['date'], data['followers']

        with connect_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM followers WHERE date = %s", (date,))
                if cursor.fetchone()[0] > 0:
                    return jsonify({'error': 'Entry for this date already exists.'}), 400
                
                cursor.execute("INSERT INTO followers (date, count) VALUES (%s, %s)", (date, count))
            conn.commit()

        return jsonify({'message': 'Entry added successfully.'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_entry/<date>', methods=['DELETE'])
def delete_entry(date):
    try:
        with connect_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM followers WHERE date = %s", (date,))
            conn.commit()
        return jsonify({'message': 'Entry deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_entry/<date>', methods=['PUT'])
def update_entry(date):
    try:
        data = request.json
        with connect_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE followers SET count = %s WHERE date = %s", (data['followers'], date))
            conn.commit()
        return jsonify({'message': 'Entry updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clear_all', methods=['DELETE'])
def clear_all_entries():
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM followers")  # Delete all entries
        conn.commit()
        conn.close()
        return jsonify({'message': 'All entries deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Added Changelog for Version details
@app.route('/changelog', methods=['GET'])
def get_changelog():
    try:
        # Assuming you have a list of changelogs in your database or a static list
        with open('changelog.json', 'r') as file:
            changelog = json.load(file)

        return jsonify(changelog)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask App...")
    init_db()
    app.run(debug=True)
