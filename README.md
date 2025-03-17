# LinkedIn Followers Tracker

A web-based application to track LinkedIn follower growth, visualize trends, and forecast future growth. This project is built using **React.js** (Frontend) and **Flask** (Backend) with **SQLite** for data storage.

---
## 🚀 Live Demo
- **Frontend:** [LinkedIn Followers Tracker](https://followers-tracker.netlify.app)
- **Backend:** [API Endpoint](https://linkedin-followers-tracker-production.up.railway.app)

---

## 📋 Features
✅ Add daily LinkedIn follower counts with date entries  
✅ View historical follower data in a detailed table  
✅ Visualize follower growth trends using interactive charts  
✅ Added AI Alert System that Detects unusual follower activity and triggers alerts  
✅ Update Feature that Modify an existing entry’s date or follower count  
✅ Added Forecast Growth whichUses linear regression to estimate future milestones  

---


## 🛠️ Setup Instructions

### Frontend (React.js)
1. Clone the repository:
   ```bash
   git clone https://github.com/Tanu-N-Prabhu/LinkedIn-Followers-Tracker.git
   cd LinkedIn-Followers-Tracker/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Access the app at `http://localhost:3000`

### Backend (Flask)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # For Mac/Linux
   .\venv\Scripts\activate  # For Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   python app.py
   ```
5. Access the API at `http://localhost:8080`

---

## 🔌 API Endpoints

### Add Follower Data
**POST** `/add`
```json
{
    "date": "YYYY-MM-DD",
    "count": 1234
}
```

### Get All Followers Data
**GET** `/followers`

### Update Follower Data
**PUT** `/update`
```json
{
    "date": "YYYY-MM-DD",
    "count": 1500
}
```

### Forecast Future Growth
**GET** `/forecast?days=7`

### Clear All Data
**DELETE** `/clear`

---

## 🐞 Troubleshooting

### 1. **CORS Error in Frontend**
- Solution: Added `CORS(app, resources={r"/*": {"origins": "https://followers-tracker.netlify.app"}})` in Flask backend.

### 2. **Network Error in Frontend**
- Solution: Ensured the correct backend API endpoint was used.

### 3. **Python Version Error on Netlify**
- Solution: Updated `.tool-versions` and `runtime.txt` to `python-3.9.19`.

### 4. **Mise Error**
- Solution: Created `netlify.toml` file with the correct settings.

### 5. **Data Not Displaying on Frontend**
- Solution: Corrected database entries, refreshed data logic in React, and confirmed API endpoints were working with Postman.

---

## 📢 Changelog (Last Updated on March 14, 2025)

#### AI Alert System
* Checks the last 7 days of data.
* Calculates average daily growth.
* If a sudden spike/drop is detected, it alerts the user.
  

#### Update Feature
* Allows users to edit existing follower data.
* Requires original_date (existing entry) and new_date (updated date).
* Returns a confirmation message on success.

#### UI Changes
* Added a Download Data button that will download the `followers_data.csv` file! 
* Added alert (pop-ups) rather than standard display of messages
* Combined the Insights and Followers Alert messages into a single pop-up, ensuring alerts appear only when necessary and improving readability.
* Added a validation check in `handleForecast` to prevent forecasting with insufficient data, displaying an alert if fewer than two data points exist.
* Enhanced UI with CSS animations, improved button styles, added hover effects, and made the layout more responsive for better user experience.
* Fixed the unused `forecast_date` warning, improved API response by including forecast dates, and ensured proper JSON serialization for better readability.
* Added forecasted date to the /forecast API response and updated the frontend to display the actual dates instead of relative day numbers.
* Removed unecessary hovering effect from the buttons.
---

## 📄 License
This project is licensed under the MIT License.

---

## 👨‍💻 Author
**Tanu Nanda Prabhu**  
[LinkedIn](https://www.linkedin.com/in/tanu-nanda-prabhu/) | [Medium](https://medium.com/@tanu.nanda.prabhu)  

If you found this project helpful, feel free to star ⭐ the repository!

