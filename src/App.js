import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";
import axios from "axios";
import {FaLightbulb} from 'react-icons/fa';  // Importing icons from FontAwesome

//import ChangelogButton from './ChangelogButton';  // Import the ChangelogButton
import Modal from 'react-modal';
//import { FaDownload, FaTimes,FaTrashAlt, FaPencilAlt, FaEraser, FaLightbulb, FaCloudSun, FaCalendarCheck, FaCalendarAlt, FaPlusCircle  } from 'react-icons/fa';  // Importing icons from FontAwesome


// Set the root element (usually the div with id "root")
Modal.setAppElement('#root');

function LinkedInTracker() {
  const [followersData, setFollowersData] = useState([]);
  const [date, setDate] = useState('');
  const [followers, setFollowers] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newFollowers, setNewFollowers] = useState('');

  //const [forecastData, setForecastData] = useState([]);  // New state for forecast data
  const [alertMessage, setAlertMessage] = useState("");
  //const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from Flask API
  useEffect(() => {
    fetchData();

    
  }, []);

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

  const handleAddEntry = async () => {
    if (!date || !followers) return;
    const newEntry = { date, followers: parseInt(followers) };

    try {
      await fetch('https://linkedin-followers-tracker-production.up.railway.app/add_entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      alert("Data added!");

      await fetchData();
      setDate('');
      setFollowers('');
    } catch (error) {
      console.error('Error adding entry:', error);
      alert("Failed to add data.");
    }
  };

  const handleDeleteEntry = async (date) => {
    try {
      await fetch(`https://linkedin-followers-tracker-production.up.railway.app/delete_entry/${date}`, {
        method: 'DELETE',
      });
      alert("Data Deleted!");


      await fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert("I failed to delete your data!");

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
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  return (
    <div>
      <h1>LinkedIn Followers Tracker</h1>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Followers" />
      <button onClick={handleAddEntry}>Add Entry</button>

      {followersData.length > 0 && (
        <div>
          <h2>Follower Data</h2>
          <table>
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
                      <button onClick={handleUpdateEntry}>Save</button>
                    ) : (
                      <>
                        <button onClick={() => handleEditEntry(entry)}>Edit</button>
                        <button onClick={() => handleDeleteEntry(entry.date)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Growth Chart</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={followersData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="followers" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>

      <button onClick={fetchInsights} className="btn btn-success"><FaLightbulb size={15} /></button>
    </div>
  );
}

export default LinkedInTracker;
