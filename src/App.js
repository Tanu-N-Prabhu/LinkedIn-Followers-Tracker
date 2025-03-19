import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://linkedin-followers-tracker-production.up.railway.app";

function App() {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);

  // Fetch Data Function
  const fetchData = () => {
    axios
      .get(`${API_URL}/followers`)
      .then((response) => {
        console.log("Fetched Followers Data:", response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching followers data:", error);
      });
  };

  // Load Data on Component Mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle Add Entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !date) return alert("Enter all details!");

    try {
      const response = await axios.post(`${API_URL}/add`, 
        { date, count: parseInt(followers) }, 
        { headers: { "Content-Type": "application/json" } }
      );

      alert(response.data.message);
      setFollowers("");
      setDate("");
      fetchData(); // Refresh data after adding
    } catch (error) {
      console.error("Error adding data:", error);
      alert(error.response?.data?.error || "Failed to add data.");
    }
  };

  return (
    <div>
      <h2>LinkedIn Followers Tracker</h2>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Followers"
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      {/* Display Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Followers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.date}>
              <td>{entry.date}</td>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
