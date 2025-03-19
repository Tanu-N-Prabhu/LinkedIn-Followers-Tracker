import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://linkedin-followers-tracker-production.up.railway.app/followers"); // Ensure this matches your Flask server URL
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !date) {
      alert("Enter all details!");
      return;
    }

    try {
      await axios.post("https://linkedin-followers-tracker-production.up.railway.app/add", 
        { date, count: parseInt(followers) }, 
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Data added!");

      // Reset fields
      setFollowers("");
      setDate("");

      // Fetch updated data
      fetchData();
    } catch (error) {
      console.error("Error adding data:", error);
      alert("Failed to add data.");
    }
  };

  return (
    <div>
      <h1>LinkedIn Followers Tracker</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="number"
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
          placeholder="Enter followers count"
          required
        />
        <button type="submit">Add Entry</button>
      </form>

      <h2>Follower Data</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
