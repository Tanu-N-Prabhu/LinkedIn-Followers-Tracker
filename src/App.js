import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";
import ChangelogButton from './ChangelogButton';  // Import the ChangelogButton
import Modal from 'react-modal';
// Set the root element (usually the div with id "root")
Modal.setAppElement('#root');

const App = () => {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const [forecastData, setForecastData] = useState([]);  // New state for forecast data
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState(""); // To store the date of the record being edited
  const [alertMessage, setAlertMessage] = useState("");  
  const [originalDate, setOriginalDate] = useState(""); // Store original date for reference
  //const [insights, setInsights] = useState(null); 

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from Flask API
  useEffect(() => {
    axios.get("https://linkedin-followers-tracker-production.up.railway.app/followers").then((response) => {
      const fetchedData = response.data;

      // Calculate range (change in followers) for each date
      const updatedData = fetchedData.map((item, index) => {
        if (index === 0) {
          return { ...item, range: 0 }; // No range for the first day
        } else {
          const previousItem = fetchedData[index - 1];
          const range = item.count - previousItem.count;
          return { ...item, range }; // Add the range for subsequent days
        }
      });
      
      setData(updatedData);
    });

    axios.get("https://linkedin-followers-tracker-production.up.railway.app/alerts").then((response) => {
      if (response.data.alert) {
        setAlertMessage(response.data.alert);
      }
    });
  }, []);

  // Getting the Insights
  const fetchInsights = async () => {
    try {
      const insightsResponse = await axios.get("https://linkedin-followers-tracker-production.up.railway.app/insights");
      const insights = insightsResponse.data;
  
      let alertText = `📊 Insights:
        - Current Followers: ${insights.current_followers}
        - Next Milestone: ${insights.next_milestone}
        - Estimated Time: ${insights.estimated_days_to_milestone} days
        - Average Daily Growth: ${insights.average_daily_growth}
        - Progress: ${insights.progress_percentage}%`;
  
      if (alertMessage) {
        alertText += `\n\n🚨 Alert: ${alertMessage}`;  // Adding the alert message if it exists
      }
  
      alert(alertText);
    } catch (error) {
      alert("Failed to fetch insights. Please try again.");
    }
  };
    // Handle form submission (Add new entry)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !date) return alert("Enter all details!");

    await axios.post("https://linkedin-followers-tracker-production.up.railway.app/add", 
      { date, count: parseInt(followers) },   // Ensure count is sent as a number
      { headers: { 'Content-Type': 'application/json' } }  
    );
        alert("Data added!");
    setFollowers("");
    setDate("");

    // Refresh data
    axios.get("https://linkedin-followers-tracker-production.up.railway.app/followers").then((response) => {
      const fetchedData = response.data;

      // Calculate range (change in followers) for each date
      const updatedData = fetchedData.map((item, index) => {
        if (index === 0) {
          return { ...item, range: 0 }; // No range for the first day
        } else {
          const previousItem = fetchedData[index - 1];
          const range = item.count - previousItem.count;
          return { ...item, range }; // Add the range for subsequent days
        }
      });

      setData(updatedData);
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !editDate || !originalDate) return alert("Enter all details to edit!");

    try {
        await axios.put("https://linkedin-followers-tracker-production.up.railway.app/update", 
          { 
            original_date: originalDate, 
            new_date: editDate, 
            count: parseInt(followers) 
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        alert("Data updated!");
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        alert("Failed to Edit");
    }

    setFollowers("");
    setEditDate("");
    setEditMode(false);

    axios.get("https://linkedin-followers-tracker-production.up.railway.app/followers")
    .then((response) => {
        let fetchedData = response.data;

        // Ensure sorting by date before processing
        fetchedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const updatedData = fetchedData.map((item, index) => {
            if (index === 0) return { ...item, range: 0 };
            const previousItem = fetchedData[index - 1];
            const range = item.count - previousItem.count;
            return { ...item, range };
        });

        setData(updatedData);
    })
    .catch((err) => console.error("Failed to fetch updated data", err));

};


  // Handle clearing data
  const handleClear = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all data?");
    if (confirmClear) {
      await axios.delete("https://linkedin-followers-tracker-production.up.railway.app/clear");
      alert("All data cleared!");
      
      // Refresh data
      setData([]);
    }
  };

  // Handle Start editing a specific record
  const startEditing = (item) => {
    setEditMode(true);
    setFollowers(item.count);
    setEditDate(item.date);
    setOriginalDate(item.date);  // Store the original date for tracking

  };

  /*
  // Handle Forecast Request
  const handleForecast = async (days) => {
    if (data.length < 2) {
      alert("Not enough data to forecast. Please add more data points.");
      return;
    }

    try {
      const response = await axios.get(`https://linkedin-followers-tracker-production.up.railway.app/forecast?days=${days}`);
      const forecastedData = response.data.map((entry, index) => ({
        date: entry.date, // Add the date field
        day: index + 1,
        forecasted_count: entry.forecasted_count,  // Ensure 'forecasted_count' is the correct field name
      }));
      setForecastData(forecastedData);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  */

  // Modified Code with a alert button

   // Handle Forecast Request
   const handleForecast = async (days) => {
    if (data.length <= 3) {
      alert("Bruh, Not enough data to forecast. Please add more data points.");
      return;
    }

    try {
      const response = await axios.get(`https://linkedin-followers-tracker-production.up.railway.app/forecast?days=${days}`);
      const forecastedData = response.data.map((entry, index) => ({
        date: entry.date,
        day: index + 1,
        forecasted_count: entry.forecasted_count,
      }));

      setForecastData(forecastedData);
      setIsModalOpen(true); // Open the modal when data is fetched
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
      <h1>Track Me Now!</h1>
      <i>Designed by Tanu Nanda Prabhu</i>
    <br></br>
    <br></br>
    
      {editMode ? (
        <>
          <h2>Edit Follower Data</h2>
          <form onSubmit={handleEditSubmit}>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Followers"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter Followers"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}
  
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
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.count}</td>
              <td>
                <button onClick={() => startEditing(item)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
      <h2>Follower Growth Chart</h2>
      <div className="fade-in">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" yAxisId="left" />
            <Line type="monotone" dataKey="range" stroke="#ff7300" dot={false} activeDot={false} yAxisId="right" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Forecast Buttons */}
      <button onClick={() => handleForecast(7)}>Forecast 7 Days</button>
      <button onClick={() => handleForecast(10)}>Forecast 10 Days</button>
      <button onClick={() => handleForecast(30)}>Forecast 30 Days</button>
  
      {/* Forecast Modal */}
      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Forecast Results</h2>
      <div className="modal-content">
        <div className="table-container">
          <table>
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
      <button className="close-btn" onClick={() => setIsModalOpen(false)}>Close</button>
    </div>
  </div>
)}

  
      <button onClick={handleClear}>Clear All Data</button>
      <button onClick={handleDownload}>Download Data</button>
      <button onClick={fetchInsights} className="fade-in">Insights</button>


      {/* Add the ChangelogButton here */}
      <ChangelogButton/>
      
    </div>
  );
  
};

export default App;
