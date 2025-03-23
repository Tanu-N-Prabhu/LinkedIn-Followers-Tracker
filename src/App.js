// Importing necessary libraries for the project
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";
import ChangelogButton from './ChangelogButton';  // Import the ChangelogButton
import {FaDownload, FaPlusCircle, FaPencilAlt, FaTrashAlt, FaSave, FaLightbulb, FaExclamationTriangle ,FaCloudSun, FaCalendarCheck, FaCalendarAlt, FaTimes } from 'react-icons/fa';  // Importing icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import { Tooltip as ReactTooltip } from "react-tooltip";

/*
State Variables
* followersData: Stores the follower count data over time.
* date: The date associated with the current follower count entry.
* followers: The number of followers for the current date.
* editingDate: The date currently being edited (for modifying an entry).
* newDate: A new date being input for adding/editing a record.
* newFollowers: The new follower count being added.
* alertMessage: Stores an alert message, typically fetched from an API.
* forecastData: Stores forecast data for follower growth.
* isModalOpen: Tracks whether the modal (popup) is open or closed.
* forecastHeading: The heading of the modal or forecast section.
*/
function LinkedInTracker() {
  const [followersData, setFollowersData] = useState([]);
  const [date, setDate] = useState('');
  const [followers, setFollowers] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newFollowers, setNewFollowers] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forecastHeading, setForecastHeading] = useState("Forecast Results");

  /*
  useEffect Hook
  The useEffect hook is used to fetch data when the component mounts:
    * fetchData() retrieves follower data from the API endpoint (/get_entries) and populates the followersData state.
    * fetchAlertData() retrieves any alert messages via an API request (/alerts) and updates the alertMessage state.
  The isMounted variable ensures that state updates only occur if the component is still mounted, preventing potential memory leaks.
  */

  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted components

    const fetchAlertData = async () => {
      try {
        const response = await axios.get(
          "https://linkedin-followers-tracker-production.up.railway.app/alerts"
        );

        console.log("Fetched Alert Data:", response.data); // Debugging Log

        if (isMounted && response.data && response.data.alert) {
          setAlertMessage(response.data.alert);
        }
      } catch (error) {
        console.error("Error fetching alert data:", error);
      }
    };

    fetchData(); // Ensure fetchData() is properly defined
    fetchAlertData(); // Fetch alert data

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, []);

  /*
  Processed Data for Graph
  This code processes the follower data to calculate the difference in followers between consecutive days. This difference is used in the graph to show follower growth over time.
  */
  const processedData = followersData.map((entry, index, arr) => {
    const previousFollowers = index > 0 ? arr[index - 1].followers : entry.followers;
    return {
      date: entry.date,
      followers: entry.followers,
      difference: entry.followers - previousFollowers,
    };
  });

  /*
  fetchData Function
    * This asynchronous function fetches follower data from the backend API (/get_entries) and updates the followersData state. It handles any errors by logging them to the console.
  */
  const fetchData = async () => {
    try {
      const res = await fetch('https://linkedin-followers-tracker-production.up.railway.app/get_entries');
      const data = await res.json();
      setFollowersData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 /*
  fetchInsights Function
  This function fetches insights data from the API (/insights). It processes the data to display key follower insights, such as:
    * Current follower count
    * Next milestone
    * Average daily growth
    * Estimated time to reach the next milestone
  If there are fewer than 3 data points, an error message is displayed using toast.error().
  It also appends any active alert message to the insights if present.
 */
 const fetchInsights = async () => {

  try {
    const insightsResponse = await axios.get(
      "https://linkedin-followers-tracker-production.up.railway.app/insights"
    );

    if (insightsResponse.data.length < 3) {
      toast.error("Bruh, Not enough data to provide insights. Please add 3 data points. 😑");
      return; // Stop execution if there are fewer than 3 entries
    }
    console.log("Fetched Insights Data:", insightsResponse.data); // Debugging
    const insights = insightsResponse.data;

    let alertText = `📊 Insights:
    - 👥 Current Followers: ${insights.current_followers}
    - 🎯 Next Milestone: ${insights.next_milestone}
    - 📈 Average Daily Growth: ${insights.average_daily_growth} per day
    - ⏳ Progress: ${insights.progress_percentage}%
    - ⏰ Estimated Time: ${insights.estimated_days_to_milestone} days`

    if (alertMessage) {
      alertText += `\n\n🚨 Alert: \n${alertMessage}`;
    }

    alert(alertText);

  } catch (error) {
    console.error("Error fetching insights:", error.response?.data || error);
    toast.error("Failed to fetch insights. Please try again.");
  }
};

  /*
  Handle Data Manipulation Functions
  These functions manage adding, editing, deleting, and updating follower data. Here's a breakdown of each function:
  */

  /*
  handleAddEntry Function
  This function is responsible for adding a new follower entry to the database:
    * It checks that the date and followers fields are provided.
    * The followers count is validated to ensure it is a positive number.
    * If valid, the new entry is sent to the backend using a POST request.
    * If successful, the data is refreshed and a success message is displayed using toast.success(). Otherwise, an error message is shown using toast.error().
  */
  const handleAddEntry = async () => {
    if (!date) {
      toast.error("Please enter a date!");
      return;
    }
    if (!followers) {
      toast.error("Please enter the followers count!");
      return;
    }
    if (isNaN(followers) || followers <= 0) {
      toast.error("Followers count must be a positive number!");
      return;
    }

    const newEntry = { date, followers: parseInt(followers) };

    try {
      await fetch('https://linkedin-followers-tracker-production.up.railway.app/add_entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      await fetchData();
      setDate('');
      setFollowers('');
      toast.success('Yayy, I added your data successfully! 🎉'); // Success alert
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error("Oh No, I failed to add your data. 😞");
    }
};
  /*
  handleDeleteEntry Function
  This function handles deleting a specific follower entry based on the date:
    * It sends a DELETE request to the backend with the date of the entry to delete.
    * Upon successful deletion, it refreshes the data and shows a success message.
    * If an error occurs, an error message is displayed.
  */
  const handleDeleteEntry = async (date) => {
    try {
      await fetch(`https://linkedin-followers-tracker-production.up.railway.app/delete_entry/${date}`, {
        method: 'DELETE',
      });
      await fetchData();
      toast.success("Yayy, I deleted your data successfully! 🎉");

    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error("Oh No, I failed to add your data. 😞");
    }
  };

  /*
  handleEditEntry Function
  This function pre-fills the fields for editing a follower entry:
    * It sets the editingDate, newDate, and newFollowers state variables with the data from the entry to be edited.
  */
  const handleEditEntry = (entry) => {
    setEditingDate(entry.date);
    setNewDate(entry.date);
    setNewFollowers(entry.followers);
  };

  /*
  handleUpdateEntry Function
  This function updates an existing follower entry:
    * It ensures the new values for newDate and newFollowers are provided.
    * A PUT request is sent to update the entry on the backend.
    * After the update, the data is refreshed, and a success message is displayed.
  */
  const handleUpdateEntry = async () => {
    if (!newDate || !newFollowers) return;

    try {
      await fetch(`https://linkedin-followers-tracker-production.up.railway.app/update_entry/${editingDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_date: newDate, followers: parseInt(newFollowers) }),
      });

      setEditingDate(null);
      await fetchData();
      toast.success("Yayy, I edited your data successfully. 🎉");
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error("Oh No, I failed to edit your data. 😞");
    }
  };

  /*
  handleClearAllData Function
  This function handles clearing all follower data:
    * It prompts the user with a confirmation dialog to ensure they want to delete all data.
    * If confirmed, a DELETE request is sent to clear all entries in the backend.
    * After successful deletion, the data is refreshed and a success message is displayed.
  */
  const handleClearAllData = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete all data? This action cannot be undone.");

    if (!isConfirmed) {
      toast.info("Data deletion canceled.");
      return;
    }

    try {
      await fetch('https://linkedin-followers-tracker-production.up.railway.app/clear_all', {
        method: 'DELETE',
      });
      fetchData();
      toast.success('Yayy, I cleared your data successfully! 🎉');
    } catch (error) {
      toast.error('Oh No, I failed to clear your data.😞');
    }
  };

  /*
  handleForecast Function
  This function retrieves a forecast for follower growth based on the number of days specified:
    * It dynamically sets the forecast heading based on the selected days.
    * A GET request is sent to fetch the forecast data from the backend.
    * If the forecast data contains fewer than 3 entries, it stops the operation and shows an error message.
    * The forecast data is displayed in a modal once fetched.
  */
  const handleForecast = async (days) => {

    // Set the dynamic heading based on the days selected
  setForecastHeading(`Forecast Results for ${days} days`);

    try {
      const response = await axios.get(`https://linkedin-followers-tracker-production.up.railway.app/forecast?days=${days}`);

       // Check if the response contains enough data
      if (response.data.length < 3) {
        toast.error("Bruh, Not enough data to forecast. Please add 3 data points. 😑");
        return; // Stop execution if there are fewer than 3 entries
      }
      // Assuming the response is an array of forecast data
      const forecastedData = response.data.map((entry, index) => ({
        date: entry.date,  // Date string returned from backend
        day: entry.day,
        forecasted_count: entry.forecasted_count,  // Forecasted follower count
      }));

      setForecastData(forecastedData);  // Update state with forecast data
      setIsModalOpen(true);  // Open the modal
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  /*
  handleDownload Function
  This function triggers the download of data:
    * It opens a new tab with the URL for downloading the data.
  */
   const handleDownload = () => {
    window.open("https://linkedin-followers-tracker-production.up.railway.app/download", "_blank");
  };

  /*
  handleFetchAlerts Function
  This function fetches alert data related to follower activity:
    * A GET request is sent to retrieve any follower alerts from the backend.
    * If an alert is found, it is displayed using an alert() message.
  */
  const handleFetchAlerts = async () => {
    try {
      const response = await axios.get(
        "https://linkedin-followers-tracker-production.up.railway.app/follower-alerts"
      );

      console.log("Fetched Alert Data:", response.data);



      if (response.data && response.data.alert) {
        setAlertMessage(response.data.alert);
        alert(`📢 AI Alert: \n\n${response.data.alert}`);
      }
    } catch (error) {
      console.error("Error fetching alert data:", error);
      toast.error("Failed to fetch AI alerts. Please try again.");
    }
  };

  /*
  LinkedInTracker Component Documentation
  1. Structure and Purpose:
  This React component serves as the main UI for the LinkedIn Follower Tracker app. It includes various sections to handle user input, manage follower data, display follower growth trends, and perform actions like downloading or forecasting data.

  2. Component Breakdown:
  Header Section:
  Header Content: Displays the application name ("Track Me Now!") and the creator's name ("Designed by Tanu Nanda Prabhu").
  */
  return (
    <div>

      {/* Header Section */}
      <header className="app-header">
      <h1>Track Me Now!</h1>
      <p className="designed-by">Designed by Tanu Nanda Prabhu</p>
      </header>

      {/* Follower Input Fields: */}
      {/* Date Input: Allows the user to select a date. */}
      {/* Followers Input: Allows the user to input the follower count for that specific date. */}
      {/* Add Button: A button with a tooltip to add the entered data (date and followers count) to the list. */}

      <input type="date" placeholder= "Enter Date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="number" placeholder="Enter Followers" value={followers} onChange={(e) => setFollowers(e.target.value)}/>
      <button data-tooltip-id="Add-Entry-tooltip" onClick={handleAddEntry}><FaPlusCircle  size={15}/></button>
      <ReactTooltip id="Add-Entry-tooltip" place="top" effect="solid">
      Add Entry
      </ReactTooltip>

      {/* Follower History Table: */}
      {/* Displays a table of historical follower data. */}
      {/* Editing Mode: Allows users to edit existing data for a particular entry (date and followers). */}
      {/* Delete/Edit Actions: Buttons for deleting or editing an entry, which shows tooltips for clarity. */}

      {followersData.length > 0 && (
        <div>
          <h2>Follower History</h2>
          <table className="fade-in">
            <thead>
              <tr>
                <th>Date</th>
                <th>Followers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {followersData.map((entry) => (
                <tr key={entry.date}>
                  <td>
                    {editingDate === entry.date ? (
                      <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    ) : (
                      entry.date
                    )}
                  </td>
                  <td>
                    {editingDate === entry.date ? (
                      <input
                        type="number"
                        value={newFollowers}
                        onChange={(e) => setNewFollowers(e.target.value)}
                      />
                    ) : (
                      entry.followers
                    )}
                  </td>
                  <td>
                    {editingDate === entry.date ? (
                      <button data-tooltip-id="Save-tooltip" onClick={handleUpdateEntry}><FaSave size={15}/></button>
                    ) : (
                      <>
                        <ReactTooltip id="Save-tooltip" place="top" effect="solid">
                        Save
                        </ReactTooltip>
                        <button data-tooltip-id="Edit-tooltip" onClick={() => handleEditEntry(entry)}><FaPencilAlt size={15}/></button>
                        <ReactTooltip id="Edit-tooltip" place="top" effect="solid">
                        Edit
                        </ReactTooltip>
                        <button data-tooltip-id="Delete-tooltip" onClick={() => handleDeleteEntry(entry.date)}><FaTrashAlt size={15}/></button>
                        <ReactTooltip id="Delete-tooltip" place="top" effect="solid">
                        Delete
                        </ReactTooltip>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Follower Growth Chart: */}
      {/* Chart Rendering: Displays a line chart using Recharts to show follower growth over time. */}
      {/* Data Keys: The LineChart uses two datasets, followers and difference, for rendering. */}
      
      <h2>Follower Growth Chart</h2>
      <div className="fade-in">
        <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="followers" stroke="#8884d8" yAxisId="left" />
          <Line type="monotone" dataKey="difference" stroke="#ff7300" dot={false} activeDot={false} yAxisId="right" />
        </LineChart>
      </ResponsiveContainer>
      </div>

      <br></br>

      {/* Forecast Buttons Section */}
      {/* Erase Data Button: Clears all saved follower data. */}
      {/* Insights Button: Displays insights related to follower growth. */}
      {/* Download Button: Exports the follower data to a downloadable format.*/}
      {/* AI Alert Button: Shows alerts generated by AI for unusual follower growth. */}
      {/* Forecast Buttons (7, 10, 30 Days): Provides forecasts for the next 7, 10, or 30 days based on the existing data. */}
      
      <div className="header-container">
        <h1>Try Me!</h1>
        <div className="button-group">
          <button data-tooltip-id="Erase-tooltip" onClick={handleClearAllData} className="btn btn-danger"><FaTrashAlt size={15} /></button>
          <ReactTooltip id="Erase-tooltip" place="top" effect="solid">
          Erase Contents
          </ReactTooltip>
          <button data-tooltip-id="Insights-tooltip" onClick={fetchInsights} className="btn btn-success"><FaLightbulb size={15} /></button>
          <ReactTooltip id="Insights-tooltip" place="top" effect="solid">
          Insights
          </ReactTooltip>
          <button data-tooltip-id="Download-tooltip" onClick={handleDownload} className="btn btn-primary"><FaDownload size={15} /></button>
          <ReactTooltip id="Download-tooltip" place="top" effect="solid">
          Download
          </ReactTooltip>
          <button data-tooltip-id="ai-alert-tooltip" onClick={handleFetchAlerts} className="btn btn-primary"><FaExclamationTriangle size={15} /></button>
          <ReactTooltip id="ai-alert-tooltip" place="top" effect="solid">
          AI Alerts
          </ReactTooltip>
          {/* Forecast Buttons Inside Actions Section */}
          <button data-tooltip-id="7-tooltip" className="btn btn-warning" onClick={() => handleForecast(7)}><FaCloudSun size={15} /></button>
          <ReactTooltip id="7-tooltip" place="top" effect="solid">
          Forecast - 7 Days
          </ReactTooltip>
          <button data-tooltip-id="10-tooltip" className="btn btn-warning" onClick={() => handleForecast(10)}><FaCalendarCheck size={15}></FaCalendarCheck></button>
          <ReactTooltip id="10-tooltip" place="top" effect="solid">
          Forecast - 10 Days
          </ReactTooltip>
          <button data-tooltip-id="30-tooltip" className="btn btn-warning" onClick={() => handleForecast(30)}><FaCalendarAlt size={15}></FaCalendarAlt></button>
          <ReactTooltip id="30-tooltip" place="top" effect="solid">
          Forecast - 30 Days
          </ReactTooltip>
          {/* Changelog Button (if needed) */}
          <ChangelogButton />
        </div>

        {/* Forecast Modal */}
        {/* Forecast Data Display: A modal opens when a forecast button is clicked to display the forecasted follower count for each day. */}
        {/* Table View: Shows day-by-day forecast with the date and expected follower count. */}
       
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{forecastHeading}</h2>
              <div className="modal-content">
                <div className="table-container">
                  <table className='forecast-table'>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Forecasted Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.map((item) => (
                        <tr key={item.day}>
                          <td>{item.day}</td>
                          <td>{item.date}</td>
                          <td>{item.forecasted_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><FaTimes size={15}/></button>
            </div>
          </div>
        )}
      </div>

    {/* Render ToastContainer to show toasts */}
    {/* Toast Notifications: */}
    {/* ToastContainer: The component utilizes ToastContainer from react-toastify to show toast notifications (e.g., for success or errors). */}
    
    <ToastContainer />

    </div>
  );
}

/*
Functions (Methods):
  * handleAddEntry: Handles the event for adding a new follower entry.
  * handleEditEntry: Initiates the editing of an existing entry.
  * handleUpdateEntry: Updates an existing entry after editing.
  * handleDeleteEntry: Deletes a selected entry.
  * fetchInsights: Fetches insights about the follower data.
  * handleDownload: Downloads the current follower data.
  * handleFetchAlerts: Fetches AI-generated alerts about unusual follower activity.
  * handleForecast: Handles forecasting logic for 7, 10, or 30 days.
  * handleClearAllData: Clears all follower data.
*/

/*
Libraries Used:
  * React: JavaScript library for building the user interface.
  * react-tooltip: Provides tooltips for the UI elements.
  * react-toastify: Library for displaying toast notifications.
  * recharts: A library for rendering charts (used here for the follower growth chart).
*/

export default LinkedInTracker;

/*
# LinkedIn Followers Tracker
    This project is open-source and is maintained by [Tanu Nanda Prabhu](https://github.com/Tanu-N-Prabhu). Feel free to contribute, submit issues, or fork this repository.
# License
    This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# Contributions
    Contributions are welcome! Please open an issue or submit a pull request. Ensure that you follow the code of conduct and review the contributing guidelines before submitting any changes.
# A Special Thanks
    A huge thanks to **myself** for building and maintaining this project from start to finish!
This repository is designed to help users track their LinkedIn follower growth, visualize trends, and forecast future growth. It's built with React.js for the frontend, Flask for the backend, and PostgreSQL for the database.
# Connect
    If you have any questions or need further assistance, feel free to contact [Tanu Nanda Prabhu](mailto:tanunprabhu95@gmail.com).
*/