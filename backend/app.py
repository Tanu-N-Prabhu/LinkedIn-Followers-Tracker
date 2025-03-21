import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sklearn.linear_model import LinearRegression
import pandas as pd

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

# AI alert System
@app.route('/alerts', methods=['GET'])
def ai_alerts():
    try:
        conn = connect_db()  # Use PostgreSQL connection
        cursor = conn.cursor()

        # Fetch the latest 7 records ordered by date
        cursor.execute("SELECT date, count FROM followers ORDER BY date DESC LIMIT 7")
        followers = cursor.fetchall()
        conn.close()

        if len(followers) < 2:
            return jsonify({'alert': 'Not enough data for alerts'})

        # Extract follower counts and reverse them for chronological order
        counts = [f[1] for f in followers][::-1]  # f[1] is the 'count' column in PostgreSQL

        avg_change = np.mean(np.diff(counts))
        threshold = 2 * abs(avg_change)

        if abs(counts[-1] - counts[-2]) > threshold:
            message = '🚨 Unusual follower activity detected!'
        else:
            message = '✅ Follower activity is normal.'

        return jsonify({'alert': message})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Insights - Storytelling (PostgreSQL)
@app.route('/insights', methods=['GET'])
def insights():
    conn = connect_db()
    cursor = conn.cursor()

    # Fetch all data from the followers table
    cursor.execute("SELECT date, count FROM followers ORDER BY date ASC")
    followers = cursor.fetchall()
    conn.close()

    if not followers:
        return jsonify({'error': 'No data available for insights'})

    # Convert PostgreSQL date format and extract latest count
    df = pd.DataFrame(followers, columns=['date', 'count'])
    df['date'] = pd.to_datetime(df['date'], errors='coerce').dropna()

    latest_count = df['count'].iloc[-1]
    next_milestone = ((latest_count // 500) + 1) * 500

    # Prepare data for linear regression
    df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
    X = df[['days_since_start']]
    y = df['count']

    model = LinearRegression()
    model.fit(X, y)

    avg_daily_growth = model.coef_[0]
    days_to_next_milestone = (
        int((next_milestone - latest_count) / avg_daily_growth)
        if avg_daily_growth > 0
        else "Growth rate too low to predict milestone"
    )

    progress_percentage = round((latest_count / next_milestone) * 100, 2)

    insights_data = {
        'current_followers': latest_count,
        'next_milestone': next_milestone,
        'estimated_days_to_milestone': days_to_next_milestone,
        'average_daily_growth': round(avg_daily_growth, 2),
        'progress_percentage': progress_percentage
    }

    return jsonify(insights_data)


if __name__ == '__main__':
    print("Starting Flask App...")
    init_db()
    app.run(debug=True)
