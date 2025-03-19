from flask import Flask, request, jsonify
# from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
import os
import csv
from flask import Response
import pandas as pd
from io import StringIO 
import json
import sqlite3


# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Gets the backend folder path
DATABASE = os.path.join(BASE_DIR, "followers.db")

print("Database Path:", DATABASE)
print("Database Exists:", os.path.exists(DATABASE))

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This will return rows as dictionaries
    return conn


def fetch_followers():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM followers")  # Use your correct table name
        data = cursor.fetchall()
        conn.close()

        followers_list = [{"id": row[0], "date": row[1], "count": row[2]} for row in data]
        return followers_list

    except Exception as e:
        print("Error fetching data:", e)
        return []

# Create the 'followers' table if it doesn't exist
def create_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS followers
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, count INTEGER)''')
    conn.commit()
    conn.close()

create_table()



# API Route: Add a new follower count
@app.route('/add', methods=['POST'])
def add_follower():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO followers (date, count) VALUES (?, ?)", (data['date'], data['count']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Data added successfully!'})

# API Route: Get all follower data
@app.route('/followers', methods=['GET'])
def get_followers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date")  # Ensuring order by date
    data = cursor.fetchall()
    conn.close()
    result = [{'date': row[1], 'count': row[2]} for row in data]
    return jsonify(result)

# API Route: Clear all follower data
@app.route('/clear', methods=['DELETE'])
def clear_data():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM followers")
    conn.commit()
    conn.close()
    return jsonify({'message': 'All data cleared successfully!'})

# API Route: Update follower count and/or date for a specific entry
@app.route('/update', methods=['PUT'])
def update_follower():
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM followers WHERE date=?", (data['original_date'],))
        entry = cursor.fetchone()

        if entry:
            cursor.execute("UPDATE followers SET date=?, count=? WHERE date=?",
                           (data['new_date'], data['count'], data['original_date']))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Data updated successfully!'})
        else:
            conn.close()
            return jsonify({'message': 'Entry not found!'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message for debugging
        return jsonify({'error': 'Internal server error'}), 500


# API Route: Forecast follower growth
@app.route('/forecast', methods=['GET'])
def forecast_followers():
    days = request.args.get('days', default=30, type=int)  # Default to 30 days

    # Fetch data from database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers")
    followers = cursor.fetchall()
    conn.close()

    if len(followers) <= 3:  # Need at least 3 data points to forecast
        return jsonify({'error': 'Not enough data to forecast'}), 400

    # Convert to DataFrame
    df = pd.DataFrame([(f[1], f[2]) for f in followers], columns=['date', 'count'])
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # Convert date to numerical values for regression
    df['days_since_start'] = (df['date'] - df['date'].min()).dt.days

    # Train model
    X = df[['days_since_start']]
    y = df['count']
    model = LinearRegression()
    model.fit(X, y)

    # Make predictions
    future_dates = [(df['days_since_start'].max() + i) for i in range(1, days + 1)]
    future_predictions = model.predict(np.array(future_dates).reshape(-1, 1))

    # Format response
    forecast_results = []
    for i in range(days):
        forecast_date = df['date'].max() + timedelta(days=i + 1)
        forecast_results.append({'date': forecast_date.strftime('%Y-%m-%d'), 'day': i + 1, 'forecasted_count': int(future_predictions[i])})

    return jsonify(forecast_results)


# AI Alert System
@app.route('/alerts', methods=['GET'])
def ai_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date DESC LIMIT 7")
    followers = cursor.fetchall()
    conn.close()

    if len(followers) < 2:
        return jsonify({'alert': 'Not enough data for alerts'})

    counts = [f[2] for f in followers][::-1]  # Reverse to chronological order
    avg_change = np.mean(np.diff(counts))
    threshold = 2 * abs(avg_change)

    if abs(counts[-1] - counts[-2]) > threshold:
        message = 'Unusual follower activity detected!'
    else:
        message = 'Follower activity is normal.'

    return jsonify({'alert': message})


# Insights - Storytelling
@app.route('/insights', methods=['GET'])
def insights():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers")
    followers = cursor.fetchall()
    conn.close()

    if not followers:
        return jsonify({'error': 'No data available for insights'})

    latest_count = max(followers, key=lambda x: datetime.strptime(x[1], "%Y-%m-%d"))[2]
    next_milestone = ((latest_count // 500) + 1) * 500

    df = pd.DataFrame([(f[1], f[2]) for f in followers], columns=['date', 'count'])
    df['date'] = pd.to_datetime(df['date'], errors='coerce').dropna()

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


# Download Data
@app.route('/download', methods=['GET'])
def download_data():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date")
    followers = cursor.fetchall()
    conn.close()
    
    # Create CSV data
    def generate():
        yield 'Date,Count\n'  # CSV Header
        for f in followers:
            yield f"{f[1]},{f[2]}\n"
    
    # Send as downloadable CSV
    return Response(generate(), mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=followers_data.csv"})

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

# API Route: Delete follower entry by ID
@app.route('/delete', methods=['DELETE'])
def delete_follower():
    try:
        data = request.json
        follower_id = data.get('id')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM followers WHERE id=?", (follower_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Entry deleted successfully!'})
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message for debugging
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/')
def home():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True)