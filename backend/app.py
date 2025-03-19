import os
import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get the database path from environment variables (for Railway), fallback to local for development
DATABASE = os.getenv('DATABASE_PATH', './followers.db')  # Default to './followers.db' for local development

def connect_db():
    return sqlite3.connect(DATABASE, check_same_thread=False)

def init_db():
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

@app.route('/add_entry', methods=['POST'])
def add_entry():
    data = request.json
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO followers (date, count) VALUES (?, ?)", 
                       (data['date'], data['followers']))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Entry added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/update_entry/<old_date>', methods=['PUT'])
def update_entry(old_date):
    data = request.json
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Check if the new date already exists (avoid duplicate dates)
        cursor.execute("SELECT COUNT(*) FROM followers WHERE date = ?", (data['new_date'],))
        if cursor.fetchone()[0] > 0:
            return jsonify({'error': 'This date already exists! Choose another date.'}), 400
        
        cursor.execute("UPDATE followers SET date = ?, count = ? WHERE date = ?", 
                       (data['new_date'], data['followers'], old_date))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Entry updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()  # Call the init_db function here to create the table if not already created
    app.run(debug=True)
