import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaSync, FaTimes } from 'react-icons/fa';  // Sync icon

Modal.setAppElement('#root');  // Important for accessibility.

const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [changelogData, setChangelogData] = useState([]);

  // Fetch changelog data from the API
  useEffect(() => {
    const fetchChangelogData = async () => {
      try {
        const response = await fetch('https://linkedin-followers-tracker-production.up.railway.app/changelog');  // Replace with your backend URL
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
        className="btn btn-warning"
      >
        <FaSync size={15} />
      </button>

      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Changelog">
  <div className="w-full h-full flex flex-col items-center bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
    <h2 className="text-2xl font-bold mb-4 text-center">Release Notes</h2>

    <div className="changelog-container w-full flex flex-col items-center">
      {changelogData.map((entry, index) => (
        <div key={index} className="changelog-entry mb-6 text-center w-3/4">
          {/* Version Number */}
          <h3 className="changelog-version text-xl font-semibold">Version {entry.version}</h3>

          {/* Date */}
          <p className="changelog-date text-gray-600">Last Updated on {entry.date}</p>

          {/* Changes */}
          <div className="mt-4 space-y-2">
            {entry.changes.map((change, idx) => (
              <div key={idx} className="changelog-item flex items-center justify-center space-x-2">
                <span className={change.added ? "text-green-500 text-lg" : "text-red-500 text-lg"}>
                  {change.added ? "✅" : "❌"}
                </span>
                <p className="text-base">{change.text}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Close Button */}
    <button
      onClick={closeModal}
      className="mt-6 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 flex items-center"
    >
      <FaTimes size={15}/>
    </button>
  </div>
</Modal>

    </div>
  );
};

export default Changelog;
