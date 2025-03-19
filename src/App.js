import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function LinkedInTracker() {
  const [followersData, setFollowersData] = useState([]);
  const [date, setDate] = useState('');
  const [followers, setFollowers] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newFollowers, setNewFollowers] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await fetch('https://linkedin-followers-tracker-production.up.railway.app/get_entries');
    const data = await res.json();
    setFollowersData(data);
  };

  const handleAddEntry = async () => {
    if (!date || !followers) return;
    const newEntry = { date, followers: parseInt(followers) };

    await fetch('https://linkedin-followers-tracker-production.up.railway.app/add_entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    });

    fetchData();
    setDate('');
    setFollowers('');
  };

  const handleDeleteEntry = async (date) => {
    await fetch(`https://linkedin-followers-tracker-production.up.railway.app/${date}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEditEntry = (entry) => {
    setEditingDate(entry.date);
    setNewDate(entry.date);
    setNewFollowers(entry.followers);
  };

  const handleUpdateEntry = async () => {
    await fetch(`https://linkedin-followers-tracker-production.up.railway.app/${editingDate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_date: newDate, followers: parseInt(newFollowers) }),
    });

    setEditingDate(null);
    fetchData();
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
    </div>
  );
}

export default LinkedInTracker;
