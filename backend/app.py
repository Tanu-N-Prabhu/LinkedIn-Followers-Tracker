from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Import CORS

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///followers.db'  # SQLite URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Follower model (table)
class Follower(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String, nullable=False)
    count = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Follower {self.date} - {self.count}>"

# Route to add new follower data
@app.route('/add', methods=['POST'])
def add_follower():
    data = request.get_json()
    date = data.get('date')
    count = data.get('count')

    if not date or not count:
        return jsonify({"error": "Missing data"}), 400

    # Create a new Follower object
    new_follower = Follower(date=date, count=count)

    try:
        db.session.add(new_follower)
        db.session.commit()
        return jsonify({"message": "Data added successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to get all followers data
@app.route('/followers', methods=['GET'])
def get_followers():
    followers = Follower.query.all()
    followers_data = [{"id": f.id, "date": f.date, "count": f.count} for f in followers]
    return jsonify(followers_data)

# Ensure the database table exists
def create_db():
    db.create_all()  # Create tables if they don't exist
    print("Database and tables created!")

@app.route('/')
def home():
    return "Hello, world!"

if __name__ == '__main__':
    create_db()  # Create tables if they don't exist
    app.run(debug=True)
