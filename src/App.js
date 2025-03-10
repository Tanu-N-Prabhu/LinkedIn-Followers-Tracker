import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";

const App = () => {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);
  const [forecastData, setForecastData] = useState([]);  // New state for forecast data
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState(""); // To store the date of the record being edited

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
  }, []);

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

  // Handle Edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !editDate) return alert("Enter all details to edit!");

    await axios.put("https://linkedin-followers-tracker-production.up.railway.app/update", { date: editDate, count: followers });
    alert("Data updated!");
    setFollowers("");
    setEditDate("");
    setEditMode(false);

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
  };

  // Handle Forecast Request
  const handleForecast = async (days) => {
    try {
      const response = await axios.get(`https://linkedin-followers-tracker-production.up.railway.app/forecast?days=${days}`);
      const forecastedData = response.data.map((entry, index) => ({
        day: index + 1,
        forecasted_count: entry.forecasted_count,  // Ensure 'forecasted_count' is the correct field name
      }));
      setForecastData(forecastedData);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  return (
    <div>
      <h1>LinkedIn Follower Tracker</h1>
      
      {editMode ? (
        <>
          <h2>Edit Follower Data</h2>
          <form onSubmit={handleEditSubmit}>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              disabled
            />
            <input
              type="number"
              placeholder="Enter Followers"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditMode(false)}>
              Cancel
            </button>
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
      <table border="1">
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
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            name="Followers Count"
            yAxisId="left"
          />
          <Line
            type="monotone"
            dataKey="range"
            stroke="#ff7300"
            name="Followers Change"
            dot={false}
            activeDot={false}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>

      <h2>Forecast Data</h2>
      <button onClick={() => handleForecast(7)}>Forecast 7 Days</button>
      <button onClick={() => handleForecast(10)}>Forecast 10 Days</button>
      <button onClick={() => handleForecast(30)}>Forecast 30 Days</button>

      <div>
        {forecastData.length > 0 && (
          <div>
            <h3>Forecast Results:</h3>
            <ul>
              {forecastData.map((entry, index) => (
                <li key={index}>Day {entry.day}: {entry.forecasted_count}</li>  
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={handleClear}>Clear All Data</button>
    </div>
  );
};

export default App;
