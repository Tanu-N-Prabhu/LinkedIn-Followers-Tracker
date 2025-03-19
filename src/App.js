import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);

  // Fetch existing data on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("https://linkedin-followers-tracker-production.up.railway.app/followers")
      .then((response) => {
        console.log("Fetched Followers Data:", response.data);
        setData(response.data);
      }) // ✅ Closing bracket fixed here
      .catch((error) => console.error("Error fetching followers:", error));
  };

  // Handle form submission (Add new entry)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !date) {
      alert("Enter all details!");
      return;
    }

    try {
      await axios.post(
        "https://linkedin-followers-tracker-production.up.railway.app/add", 
        { date, count: parseInt(followers) }, // Ensure count is an integer
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Data added!");
      setFollowers("");
      setDate("");

      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Error adding data:", error);
      alert("Failed to add data!");
    }
  };

  return (
    <div>
      <h2>LinkedIn Followers Tracker</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter followers count"
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
        />
        <button type="submit">Add Followers</button>
      </form>

      <h3>Followers Data</h3>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.date} - {item.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
