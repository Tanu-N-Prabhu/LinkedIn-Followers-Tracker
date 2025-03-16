import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');  // Important for accessibility.

const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [changelogData, setChangelogData] = useState([]);

  // Fetch changelog data from the API endpoint
  useEffect(() => {
    const fetchChangelogData = async () => {
      try {
        const response = await fetch('/changelog');  // Fetch from the correct endpoint
        const data = await response.json();
        setChangelogData(data);
      } catch (error) {
        console.error("Error fetching changelog data:", error);
      }
    };

    fetchChangelogData();
  }, []);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-700"
      >
        Recent Updates
      </button>

      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Changelog">
        <div className="w-full h-full flex flex-col justify-between bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Changelog</h2>
          {/* Check if changelogData is available before attempting to map */}
          {changelogData && changelogData.length > 0 ? (
            <table className="w-full table-auto border-collapse mb-4">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Version</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Changes</th>
                </tr>
              </thead>
              <tbody>
                {changelogData.map((entry, index) => (
                  <tr key={index}>
                    <td className="border p-2">{entry.version}</td>
                    <td className="border p-2">{entry.date}</td>
                    <td className="border p-2">
                      <ul>
                        {entry.changes.map((change, idx) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No changelog data available.</p>  // Show a message if no data is available
          )}
          <button
            onClick={closeModal}
            className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Changelog;
