from datetime import timedelta
import os
import psycopg2
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from sklearn.linear_model import LinearRegression
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose


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
        # Get the 'page' and 'per_page' query parameters, defaulting to page 1 and 10 items per page if not provided
        page = int(request.args.get('page', 1))  # Default to page 1
        limit = int(request.args.get('limit', 10))  # Default to 10 entries per page
        offset = (page - 1) * limit  # Calculate the offset based on page number

        with connect_db() as conn:
            with conn.cursor() as cursor:
                # Proper parameterized query for PostgreSQL
                cursor.execute("SELECT date, count FROM followers ORDER BY date ASC LIMIT %s OFFSET %s", (limit, offset))
                data = [{'date': row[0], 'followers': row[1]} for row in cursor.fetchall()]
                cursor.execute("SELECT COUNT(*) FROM followers")
                total_entries = cursor.fetchone()[0]
                # Get the total number of entries to calculate the total pages
                cursor.execute("SELECT COUNT(*) FROM followers")
                total_entries = cursor.fetchone()[0]

        # Return the data along with total entries count
        return jsonify({
            'followers': data,
            'totalEntries': total_entries  # Total count of entries to calculate pages on the frontend
        })
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
    try:
        conn = connect_db()
        cursor = conn.cursor()

        cursor.execute("SELECT date, count FROM followers ORDER BY date ASC")
        followers = cursor.fetchall()
        conn.close()

        if not followers:
            print("❌ No data in followers table")
            return jsonify({'error': 'No data available for insights'})

        print("✅ Fetched Followers Data:", followers)

        df = pd.DataFrame(followers, columns=['date', 'count'])
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        
        if df['date'].isnull().all():
            print("❌ Date conversion failed!")
            return jsonify({'error': 'Date conversion error'})

        latest_count = df['count'].iloc[-1]
        next_milestone = ((latest_count // 500) + 1) * 500

        df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
        X = df[['days_since_start']]
        y = df['count']

        model = LinearRegression()
        model.fit(X, y)

        avg_daily_growth = model.coef_[0]
        if avg_daily_growth <= 0:
            days_to_next_milestone = "Growth rate too low to predict milestone"
        else:
            days_to_next_milestone = int((next_milestone - latest_count) / avg_daily_growth)

        progress_percentage = round((latest_count / next_milestone) * 100, 2)

        print("✅ Insights Calculated:", {
            'current_followers': latest_count,
            'next_milestone': next_milestone,
            'estimated_days_to_milestone': days_to_next_milestone,
            'average_daily_growth': round(avg_daily_growth, 2),
            'progress_percentage': progress_percentage
        })

        return jsonify({
            'current_followers': int(latest_count),
            'next_milestone': int(next_milestone),
            'estimated_days_to_milestone': (
                int(days_to_next_milestone) if isinstance(days_to_next_milestone, (int, np.integer)) else days_to_next_milestone
            ),
            'average_daily_growth': round(float(avg_daily_growth), 2),  # Convert np.float64 to Python float
            'progress_percentage': round(float(progress_percentage), 2)
        })
    
    except Exception as e:
        print("❌ Error in /insights:", str(e))
        return jsonify({'error': str(e)}), 500

# API Route: Forecast follower growth
@app.route('/forecast', methods=['GET'])
def forecast_followers():
    # Get the 'days' parameter from the request URL, default to 30 if not provided
    days = request.args.get('days', default=30, type=int)

    # Fetch data from PostgreSQL database
    conn = connect_db()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM followers ORDER BY date ASC")  # Replace with your actual table/column names
    followers = cursor.fetchall()
    conn.close()

    # Check if there are enough data points
    if len(followers) <= 3:  # Need at least 3 data points to forecast
        return jsonify({'error': 'Not enough data to forecast'}), 400

    # Convert the fetched data into a DataFrame for easier processing
    df = pd.DataFrame([(f[1], f[2]) for f in followers], columns=['date', 'count'])  # Adjust as per your table
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # Convert date to numerical values for regression (days since the first data point)
    df['days_since_start'] = (df['date'] - df['date'].min()).dt.days

    # Train a Linear Regression model
    X = df[['days_since_start']]  # Independent variable: Days since start
    y = df['count']  # Dependent variable: Follower count
    model = LinearRegression()
    model.fit(X, y)

    # Predict future data points for the next 'days' days
    future_dates = [(df['days_since_start'].max() + i) for i in range(1, days + 1)]
    future_predictions = model.predict(np.array(future_dates).reshape(-1, 1))

    # Prepare the forecasted results
    forecast_results = []
    for i in range(days):
        forecast_date = df['date'].max() + timedelta(days=i + 1)
        forecast_results.append({
            'date': forecast_date.strftime('%Y-%m-%d'),  # Format the date
            'day': i + 1,
            'forecasted_count': int(future_predictions[i])  # Round the predicted count to an integer
        })

    # Return the forecasted data as JSON
    return jsonify(forecast_results)

# Download Data
@app.route('/download', methods=['GET'])
def download_data():
    conn = connect_db()
    cursor = conn.cursor()

    # PostgreSQL requires explicit column selection; assuming 'date' and 'count' columns exist
    cursor.execute("SELECT date, count FROM followers ORDER BY date")
    followers = cursor.fetchall()
    conn.close()

    # Create CSV data
    def generate():
        yield 'Date,Count\n'  # CSV Header
        for date, count in followers:
            yield f"{date},{count}\n"

    # Send as downloadable CSV
    return Response(generate(), mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=followers_data.csv"})

@app.route('/follower-alerts', methods=['GET'])
def getFollowerAlerts():
    try:
        conn = connect_db()
        cursor = conn.cursor()

        # Fetch the latest 7 records ordered by date
        cursor.execute("SELECT date, count FROM followers ORDER BY date DESC LIMIT 7")
        followers = cursor.fetchall()
        conn.close()

        if len(followers) < 2:
            return jsonify({'alert': '⚠️ Not enough data for meaningful insights. Add more records!'})

        # Extract follower counts and reverse them for chronological order
        counts = [f[1] for f in followers][::-1]

        avg_change = np.mean(np.diff(counts))
        threshold = 2 * abs(avg_change)

        last_change = counts[-1] - counts[-2]

        if abs(last_change) > threshold:
            if last_change > 0:
                message = '🚀 Big surge in followers! Your growth rate has significantly increased. Check for viral posts or mentions.'
            else:
                message = '⚠️ Follower loss detected! Your numbers have dropped sharply. Review content engagement or external factors.'
        elif avg_change == 0:
            message = '⏳ Growth is slowing down! Your follower count has remained stagnant. Consider boosting engagement strategies.'
        elif abs(avg_change) < 2:
            message = '✅ Follower activity is stable. Your growth is consistent with historical data.'
        else:
            message = '📆 Seasonal pattern shift detected! Your follower trends differ from past months. This may be due to industry changes or content strategy shifts.'

        return jsonify({'alert': message})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask App...")
    init_db()
    app.run(debug=True)
