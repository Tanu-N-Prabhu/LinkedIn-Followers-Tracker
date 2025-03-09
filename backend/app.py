from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app, origins="https://followers-tracker.netlify.app")

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
    followers = Follower.query.all()
    result = [{'date': f.date, 'count': f.count} for f in followers]
    return jsonify(result)

# API Route: Clear all follower data
@app.route('/clear', methods=['DELETE'])
def clear_data():
    db.session.query(Follower).delete()  
    db.session.commit()
    return jsonify({'message': 'All data cleared successfully!'})

# API Route: Update follower count for a specific date
@app.route('/update', methods=['PUT'])
def update_follower():
    data = request.json
    entry = Follower.query.filter_by(date=data['date']).first()
    
    if entry:
        entry.count = data['count']
        db.session.commit()
        return jsonify({'message': 'Data updated successfully!'})
    else:
        return jsonify({'message': 'Entry not found!'}), 404

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
        #forecast_results.append({'date': forecast_date.strftime('%Y-%m-%d'), 'predicted_count': int(future_predictions[i])})
        forecast_results.append({'day': i + 1, 'forecasted_count': int(future_predictions[i])})

    return jsonify(forecast_results)


if __name__ == '__main__':
    app.run(debug=True)
