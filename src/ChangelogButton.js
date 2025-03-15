// ChangelogButton.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const ChangelogButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changelog, setChangelog] = useState([]);

  useEffect(() => {
    // Fetch changelog data from backend
    axios.get('https://linkedin-followers-tracker-production.up.railway.app/changelog')
      .then(response => {
        setChangelog(response.data);
      })
      .catch(error => {
        console.error("Error fetching changelog:", error);
      });
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button onClick={openModal} style={{ padding: '10px', backgroundColor: 'blue', color: 'white', borderRadius: '5px' }}>
        Recent Updates
      </button>

      <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel="Changelog">
        <h2>Recent Updates</h2>
        <button onClick={closeModal} style={{ marginTop: '20px', padding: '5px', backgroundColor: 'red', color: 'white' }}>
          Close
        </button>
        <ul style={{ marginTop: '20px' }}>
          {changelog.map((entry, index) => (
            <li key={index}>
              <strong>{entry.date}:</strong> {entry.update}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default ChangelogButton;
