from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
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

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///followers.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define database model
class Follower(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)
    count = db.Column(db.Integer, nullable=False)

# Create database tables if not exists (preferably controlled migration)
with app.app_context():
    db.create_all()

# API Route: Add a new follower count
@app.route('/add', methods=['POST'])
def add_follower():
    data = request.json
    new_entry = Follower(date=data['date'], count=data['count'])
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({'message': 'Data added successfully!'})

# API Route: Get all follower data
@app.route('/followers', methods=['GET'])
def get_followers():
    followers = Follower.query.order_by(Follower.date).all()  # Ensuring order by date
    result = [{'date': f.date, 'count': f.count} for f in followers]
    return jsonify(result)


# API Route: Clear all follower data
@app.route('/clear', methods=['DELETE'])
def clear_data():
    db.session.query(Follower).delete()  
    db.session.commit()
    return jsonify({'message': 'All data cleared successfully!'})

# API Route: Update follower count for a specific date
# API Route: Update follower count and/or date for a specific entry
@app.route('/update', methods=['PUT'])
def update_follower():
    try:
        data = request.json
        print("Received Data:", data)  # Debugging line

        # Check if the original_date exists in the database
        entry = Follower.query.filter_by(date=data['original_date']).first()
        if entry:
            print(f"Entry found: {entry.date}, {entry.count}")  # Debugging line
            entry.date = data['new_date']
            entry.count = data['count']
            db.session.commit()
            return jsonify({'message': 'Data updated successfully!'})
        else:
            return jsonify({'message': 'Entry not found!'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")  # Print the error message for debugging
        return jsonify({'error': 'Internal server error'}), 500

# API Route: Forecast follower growth
@app.route('/forecast', methods=['GET'])
def forecast_followers():
    days = request.args.get('days', default=30, type=int)  # Default to 30 days

    # Fetch data from database
    followers = Follower.query.all()
    if len(followers) < 3:  # Need at least 3 data points to forecast
        return jsonify({'error': 'Not enough data to forecast'}), 400

    # Convert to DataFrame
    df = pd.DataFrame([(f.date, f.count) for f in followers], columns=['date', 'count'])
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
        forecast_results.append({'day': i + 1, 'forecasted_count': int(future_predictions[i])})

    return jsonify(forecast_results)

# AI Alert System
@app.route('/alerts', methods=['GET'])
def ai_alerts():
    followers = Follower.query.order_by(Follower.date.desc()).limit(7).all()  # Last 7 days

    if len(followers) < 2:
        return jsonify({'alert': 'Not enough data for alerts'})

    counts = [f.count for f in followers][::-1]  # Reverse to chronological order
    avg_change = np.mean(np.diff(counts))
    threshold = 2 * abs(avg_change)

    if abs(counts[-1] - counts[-2]) > threshold:
        message = 'Unusual follower activity detected!'
    else:
        message = 'Follower activity is normal.'

    return jsonify({'alert': message})

from datetime import datetime, timedelta  # Import correctly

@app.route('/insights', methods=['GET'])
def insights():
    followers = Follower.query.all()
    if not followers:
        return jsonify({'error': 'No data available for insights'})

    latest_count = max(followers, key=lambda x: datetime.strptime(x.date, "%Y-%m-%d")).count
    next_milestone = ((latest_count // 500) + 1) * 500

    df = pd.DataFrame([(f.date, f.count) for f in followers], columns=['date', 'count'])
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
    followers = Follower.query.order_by(Follower.date).all()
    
    # Create CSV data
    def generate():
        yield 'Date,Count\n'  # CSV Header
        for f in followers:
            yield f"{f.date},{f.count}\n"
    
    # Send as downloadable CSV
    return Response(generate(), mimetype='text/csv', headers={"Content-Disposition": "attachment;filename=followers_data.csv"})

# CSV Upload Function
@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    try:
        data = request.json.get('data')  # Extract data from request
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Convert to DataFrame and process
        df = pd.DataFrame(data)
        
        # Save or process the data as needed
        df.to_csv("followers_data.csv", index=False)
        
        return jsonify({"message": "CSV data uploaded successfully!"}), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500
    

# Route for Home (optional)
@app.route('/')
def home():
    return "Hello, world!"

if __name__ == "__main__":
    app.run(debug=True)