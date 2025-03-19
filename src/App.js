import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const App = () => {
  const [followers, setFollowers] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState([]);

  // Fetch existing data on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "followers"));
      const fetchedData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      console.log("Fetched Followers Data:", fetchedData);
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!followers || !date) {
      alert("Enter all details!");
      return;
    }
  
    try {
      await addDoc(collection(db, "followers"), {
        date,
        count: parseInt(followers)
      });
  
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
