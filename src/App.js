import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./styles.css";
import ChangelogButton from './ChangelogButton';  // Import the ChangelogButton
import {FaPlusCircle, FaPencilAlt, FaTrashAlt, FaSave, FaEraser } from 'react-icons/fa';  // Importing icons from FontAwesome
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function LinkedInTracker() {
  const [followersData, setFollowersData] = useState([]);
  const [date, setDate] = useState('');
  const [followers, setFollowers] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newFollowers, setNewFollowers] = useState('');


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
          <LineChart data={followersData}>
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

      <br></br>

      {/* Forecast Buttons Section */}
     <div className="header-container">
  <h1>Try Me!</h1>

  <div className="button-group">
    <button onClick={handleClearAllData} className="btn btn-danger"><FaEraser size={15} /></button>

    {/* Forecast Buttons Inside Actions Section */}

    <ChangelogButton />
    {/* ToastContainer for showing toast notifications */}
    <ToastContainer />
  </div>
</div>

    </div>
  );
}

export default LinkedInTracker;
