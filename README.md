
# LinkedIn Followers Tracker

A web-based application to track LinkedIn follower growth, visualize trends, and forecast future growth. This project is built using **React.js** (Frontend) and **Flask** (Backend) with **PostgreSQL** for data storage.

---

## 🚀 Live Demo
- **Frontend:** [LinkedIn Followers Tracker](https://followers-tracker.netlify.app)
- **Backend:** [API Endpoint](https://linkedin-followers-tracker-production.up.railway.app)

---

## 📋 Features
✅ Add daily LinkedIn follower counts with date entries  
✅ View historical follower data in a detailed table  
✅ Visualize follower growth trends using interactive charts  
✅ Added AI Alert System that detects unusual follower activity and triggers alerts  
✅ Update Feature that modifies an existing entry’s date or follower count  
✅ Added Forecast Growth which uses linear regression to estimate future milestones  

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
4. Set up the PostgreSQL database:
   - Ensure PostgreSQL is installed and running on your machine.
   - Create a new database `followers_tracker`.
   - Update the database connection settings in `config.py` with your PostgreSQL credentials.
5. Run the application:
   ```bash
   python app.py
   ```
6. Access the API at `http://localhost:8080`

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

## 📂 Folder Structure

```plaintext
LinkedIn-Followers-Tracker/
│
├── frontend/                # React.js Frontend
│   ├── public/              # Public assets like index.html
│   ├── src/                 # React app source code
│   │   ├── components/      # React components (UI elements)
│   │   ├── pages/           # React page components
│   │   ├── services/        # API requests and services
│   │   ├── App.js           # Main entry file for React app
│   │   └── index.js         # React entry point
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Environment variables (e.g., backend URL)
│
├── backend/                 # Flask Backend
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies for the backend
│   ├── models/              # Database models (Postgre SQL)
│   ├── routes/              # API routes (GET, POST, PUT, DELETE)
│   └── utils/               # Utility functions (e.g., for forecasting)
│
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
└── LICENSE                  # Project license (MIT)
```
---
## 📊 UML Diagram

```plaintext

+------------------+       +------------------+       +------------------+
|    Frontend      |       |    Backend       |       |    Database      |
|------------------|       |------------------|       |------------------|
| - React.js       |<>---->| - Flask API      |<>---->| - Postgre SQL         |
| - App.js         |       | - routes.py      |       | - FollowersData  |
| - Components     |       | - models.py      |       | - Forecasts      |
| - Services       |       | - utils.py       |       +------------------+
|------------------|       | - changelog.py   |
|                   |       |------------------|
|  + User Interface |       |  + API Endpoints | 
|  + Data Display   |       |  + Data Logic    |
|  + Graphical UI   |       |  + Forecasting   |
|  + User Alerts    |       +------------------+
+------------------+
```
### Explanation of UML Diagram:
1. Frontend (React.js):
   *  App.js: The entry point of your React application, which holds the structure of the UI.
   * Components: React components that represent different UI elements like buttons, modals, and charts.
   *  Services: A set of utility functions that communicate with your backend API to fetch data or update records.

2. Backend (Flask API):
   * Routes.py: Contains API endpoints (like GET /followers, POST /add, etc.).
   *  Models.py: Contains PostgreSQL models representing the structure of your data (followers count, dates, etc.).
   *  Utils.py: Contains utility functions, such as for forecasting follower growth or validating input data.
   *  Changelog.py: Manages and serves changelog data for the frontend.

3. Database (PostgreSQL):
   *  FollowersData: The table storing follower counts and corresponding dates.
   *  Forecasts: A table for storing predicted growth data.

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

## 📢 Changelog (Last Updated on March 22, 2025)

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
* Removed unnecessary hovering effect from the buttons.
---

## 🛠️ Software Engineering Methodology

This project follows an **Agile** methodology, emphasizing iterative development, continuous feedback, and flexibility. Agile allows for adaptive planning, early delivery, and continuous improvement, which fits well with the evolving nature of the LinkedIn Followers Tracker app. Below is a breakdown of the methodology used during the development process:

### **1. Iterative Development**
The development process was broken down into smaller, manageable tasks or "sprints." Each sprint focused on developing a specific feature or set of features. This approach allowed for frequent updates and refinements to the app based on user feedback and testing. The key phases of the iterative development were:
- **Sprint Planning**: Determining the scope of the sprint, breaking down tasks, and assigning priorities.
- **Development & Testing**: Coding the feature and conducting unit testing to ensure correctness.
- **Review & Refinement**: Conducting a sprint review with stakeholders to assess the feature and incorporate feedback.

### **2. Agile Principles**
- **Customer Collaboration**: The project was built with feedback from users (testers) to improve the overall user experience. Changes were made to enhance usability, accessibility, and functionality based on input.
- **Responding to Change**: As the project progressed, new requirements emerged, and the scope was adjusted accordingly. The app's core functionality, such as the AI Alert System and Forecast Growth feature, evolved through several iterations based on user feedback and technical feasibility.
- **Working Software**: The focus was on delivering a working version of the app at the end of each sprint. Every iteration included a working version of the app that could be tested and evaluated.
- **Simplicity**: Efforts were made to keep the app simple and intuitive. For example, the user interface (UI) was designed to be minimalistic with clear visualizations of follower growth trends and an easy-to-use data entry system.

### **3. Continuous Integration and Deployment (CI/CD)**
To ensure a smooth and efficient workflow, a **CI/CD pipeline** was implemented:
- **Continuous Integration**: Code changes were integrated into the main branch frequently to avoid merge conflicts. Automated tests were run after each change to ensure stability.
- **Continuous Deployment**: Every successful commit was deployed to the staging environment automatically, allowing for quick feedback and testing in a live-like environment. Once all tests passed and the feature was verified, it was deployed to production.

### **4. Test-Driven Development (TDD)**
During the development of key features such as the AI Alert System and Forecast Growth, **Test-Driven Development (TDD)** was used:
- Writing tests before code helps ensure the software works as expected and meets the defined requirements.
- This practice helped maintain a high level of code quality, especially when adding complex logic like forecasting and alerting.
- Unit tests were written for both the frontend (React.js) and the backend (Flask) to ensure the accuracy of key functionality and API endpoints.

### **5. Code Reviews and Collaboration**
- Regular **code reviews** were conducted within the team to ensure that the codebase remained clean, maintainable, and free of bugs. Reviews also helped in knowledge sharing and ensured that the team followed best practices in coding and design.
- **Collaborative Development**: Collaboration was central to the project's success. Developers worked together to refine features, resolve issues, and ensure that the app met user needs. Communication was key to the success of the Agile process.

### **6. Version Control and Documentation**
- **Git** was used for version control, ensuring that every change was tracked and managed efficiently. GitHub repositories were used to host the codebase, and pull requests were used to manage and review changes before merging them into the main branch.
- **Documentation** was maintained throughout the development cycle, with detailed explanations of features, endpoints, and configurations. This helped new contributors quickly understand the project and allowed users to set up the project with ease.

### **7. Feedback Loops and User Testing**
- Feedback was collected at every stage of development, including **user acceptance testing (UAT)** and **beta testing**. Users tested new features such as the AI alert system and forecasting, and feedback was used to refine these functionalities.
- Regular user testing sessions allowed for the identification of potential usability issues and helped prioritize future improvements.

---

### **Why Agile?**
Agile was chosen for this project due to its flexibility, iterative nature, and focus on continuous delivery. The project needed to:
- Respond to changing requirements quickly.
- Provide early and frequent releases for user testing.
- Collaborate effectively with stakeholders (users/testers).

This approach ensured that the development cycle remained aligned with user needs, and the app continuously evolved based on real-world usage.

---
## 🛠️ Technologies Used

| Technology          | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **React.js**        | A JavaScript library for building user interfaces, used for the frontend.   |
| **Flask**           | A lightweight Python web framework, used for the backend API.               |
| **PostgreSQL**      | A powerful open-source relational database used for storing follower data.  |
| **Recharts**        | A charting library used to visualize follower growth trends.                |
| **Netlify**         | A platform for deploying the frontend of the application.                  |
| **Railway**         | A platform used for deploying the backend Flask API.                        |
| **Heroku**          | (Optional) Could be used for hosting the backend or full-stack application.|
| **Python**          | The programming language used to build the backend logic and API endpoints. |
| **JavaScript**      | The programming language used for frontend interactions and dynamic content.|
| **CSS**             | Cascading Style Sheets used to style the web pages and improve the user interface. |
| **HTML**            | The markup language used to structure the content on the web pages.        |
| **Git**             | Version control system used for tracking changes in the project codebase.  |
| **GitHub**          | A platform for hosting and collaborating on the project's code repository. |

---

## 📌 Step-by-step guide

## 📝 How to Use the LinkedIn Followers Tracker

Follow these simple steps to start using the LinkedIn Followers Tracker app, whether you're a tech enthusiast or someone with no technical experience:

---

### **Step 1: Access the App**
- **Frontend**: Open the app using your browser [here](https://followers-tracker.netlify.app).
- You’ll be directed to the main page, where you can see your follower growth and trends.

---

### **Step 2: Choose Your Access Mode**
- **Login Mode**: If you have an account, you can sign in with your credentials.
- **Guest Mode**: If you prefer to use the app without logging in, simply click the **Guest Mode** button to access the app directly without the need for a sign-up or login.

---

### **Step 3: Add Daily Follower Data**
1. **Click on the “Add Data” Button** located on the dashboard.
2. **Enter the Date**: Select the date for which you're adding follower data (use the calendar popup to choose the date).
3. **Enter the Follower Count**: Type in the number of followers you have on LinkedIn on that date.
4. **Save the Entry**: After entering the data, click the **Save** button. Your entry will be saved and displayed in the **Follower Data Table**.

---

### **Step 4: View Your Follower Growth Trends**
- After adding some data, you can visualize your follower growth over time.
- **Choose a Time Period**: You can see your trends for **weekly**, **monthly**, or **yearly** periods.
- **Interactive Chart**: The chart will display your follower growth trend, making it easy to track how your followers are growing.

---

### **Step 5: Update Existing Data**
1. If you want to change any existing data (for example, correct a follower count or date), click the **Update Data** button.
2. **Select the Data Entry**: Choose the specific entry you want to update.
3. **Edit the Follower Count or Date**: Adjust the data as needed.
4. **Save the Changes**: Once the changes are made, click **Update** to save the new data.

---

### **Step 6: Use AI Alerts for Unusual Activity**
- The AI-powered alert system will notify you if there are unusual spikes or drops in your follower count.
- **View Alerts**: If an alert is triggered, a pop-up will appear showing the details of the unusual activity (e.g., a sudden increase or decrease in followers).

---

### **Step 7: Forecast Your Future Growth**
1. To see how your followers might grow in the future, click on the **Forecast Growth** button.
2. The system will estimate your follower count for the next few days or weeks based on your current growth trend.
3. **View Forecast**: The forecast will show you a graph and an estimated number of followers you will have on the selected future date.

---

### **Step 8: Download Your Data**
1. You can download your follower data at any time by clicking on the **Download Data** button.
2. Choose between downloading the data as a **CSV file** (for spreadsheets) or **PDF** (for a printable version).

---

### **Step 9: Log Out (if signed in)**
- If you logged in, you can log out at any time by clicking the **Logout** button in the app's menu.

---

## 🎉 Congratulations, You’re Ready to Track Your Followers!

By following these easy steps, you can effortlessly track your LinkedIn follower growth, visualize trends, and forecast future growth without any technical hassle. Enjoy using the LinkedIn Followers Tracker!


---

## 📄 License
This project is licensed under the MIT License.

---

## 👨‍💻 Author
**Tanu Nanda Prabhu**  
[LinkedIn](https://www.linkedin.com/in/tanu-nanda-prabhu/) | [Medium](https://medium.com/@tanunprabhu95)  

If you found this project helpful, feel free to star ⭐ the repository!
