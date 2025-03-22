import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";
import ChangelogButton from './ChangelogButton';  // Import the ChangelogButton
import {FaDownload, FaPlusCircle, FaPencilAlt, FaTrashAlt, FaSave, FaEraser, FaLightbulb, FaCloudSun, FaCalendarCheck, FaCalendarAlt, FaTimes } from 'react-icons/fa';  // Importing icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";


function LinkedInTracker() {
  const [followersData, setFollowersData] = useState([]);
  const [date, setDate] = useState('');
  const [followers, setFollowers] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newFollowers, setNewFollowers] = useState('');
  const [setAlertMessage] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forecastHeading, setForecastHeading] = useState("Forecast Results");



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


  // 🔹 Processed Data for the Graph
  const processedData = followersData.map((entry, index, arr) => {
    const previousFollowers = index > 0 ? arr[index - 1].followers : entry.followers;
    return {
      date: entry.date,
      followers: entry.followers,
      difference: entry.followers - previousFollowers,
    };
  });
  

  const fetchData = async () => {
    try {
      const res = await fetch('https://linkedin-followers-tracker-production.up.railway.app/get_entries');
      const data = await res.json();
      setFollowersData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

 // Getting the Insights
 const fetchInsights = async () => {
       
  try {
    // Fetch insights and AI alerts
    const insightsResponse = await axios.get(
      "https://linkedin-followers-tracker-production.up.railway.app/insights"
    );
    const aiAlertsResponse = await axios.get(
      "https://linkedin-followers-tracker-production.up.railway.app/alerts"
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
    - ⏰ Estimated Time: ${insights.estimated_days_to_milestone} days`;
    
    /*
    if (typeof insights.estimated_days_to_milestone === "number") {
      alertText += `\n\n⏰ Estimated Time: ${insights.estimated_days_to_milestone} days`;
    } else {
      alertText += `\n\n⏰ Estimated Time: 🚨 ${insights.estimated_days_to_milestone}`;
    }
    */
    
     // Add AI alert message if it exists
     if (aiAlertsResponse.data.alert) {
      alertText += `\n\n🚨 AI Alert: ${aiAlertsResponse.data.alert}`;
    }

    // Show the alert with insights and AI alert message
    alert(alertText); 
    
  } catch (error) {
    console.error("Error fetching insights or alerts:", error.response?.data || error);
    toast.error("Failed to fetch insights or alerts. Please try again.");
  }
};


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

  
  const handleEditEntry = (entry) => {
    setEditingDate(entry.date);
    setNewDate(entry.date);
    setNewFollowers(entry.followers);
  };

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

   // Download Data
   const handleDownload = () => {
    window.open("https://linkedin-followers-tracker-production.up.railway.app/download", "_blank");
  };


  return (
    <div>

      {/* Header Section */}
      <header className="app-header">
      <h1>Track Me Now!</h1>
      <p className="designed-by">Designed by Tanu Nanda Prabhu</p>
      </header>

      <input type="date" placeholder= "Enter Date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="number" placeholder="Enter Followers" value={followers} onChange={(e) => setFollowers(e.target.value)}/>
      <button onClick={handleAddEntry}><FaPlusCircle  size={15}/></button>

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
                      <button onClick={handleUpdateEntry}><FaSave size={15}/></button>
                    ) : (
                      <>
                        <button onClick={() => handleEditEntry(entry)}><FaPencilAlt size={15}/></button>
                        <button onClick={() => handleDeleteEntry(entry.date)}><FaTrashAlt size={15}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


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
      <div className="header-container">
      <h1>Try Me!</h1>

      <div className="button-group">
        <button onClick={handleClearAllData} className="btn btn-danger"><FaEraser size={15} /></button>
        <button onClick={fetchInsights} className="btn btn-success"><FaLightbulb size={15} /></button>
        <button onClick={handleDownload} className="btn btn-primary"><FaDownload size={15} /></button>

        {/* Forecast Buttons Inside Actions Section */}
        <button className="btn btn-warning" onClick={() => handleForecast(7)}><FaCloudSun size={15} /></button>
        <button className="btn btn-warning" onClick={() => handleForecast(10)}><FaCalendarCheck size={15}></FaCalendarCheck></button>
        <button className="btn btn-warning" onClick={() => handleForecast(30)}><FaCalendarAlt size={15}></FaCalendarAlt></button>

        {/* Changelog Button (if needed) */}
        <ChangelogButton />
      </div>

      {/* Forecast Modal */}
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
    <ToastContainer />

    </div>
  );
}

export default LinkedInTracker;
