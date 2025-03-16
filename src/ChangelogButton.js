import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { MdClose } from 'react-icons/md';

Modal.setAppElement('#root');  // Important for accessibility.

const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [changelogData, setChangelogData] = useState([]);

  useEffect(() => {
    const fetchChangelogData = async () => {
      try {
        const response = await fetch('https://linkedin-followers-tracker-production.up.railway.app/changelog');  // Use your live URL here
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
        
      >
        Recent Updates
      </button>

      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Changelog">
        <div className="modal-container">
          <h2 className="modal-header">Release Notes</h2>
          {changelogData && changelogData.length > 0 ? (
            <div className="changelog-table">
              {changelogData.map((entry, index) => (
                <div key={index} className="changelog-entry">
                  {/* Compact version and date in one row */}
                  <div className="changelog-header">
                    <span className="changelog-version">{entry.version}</span>
                    <span className="changelog-date">{entry.date}</span>
                  </div>
                  
                  {/* Displaying changes */}
                  <div className="changelog-changes">
                    {entry.changes.map((change, idx) => (
                      <div key={idx} className="change-item">
                        {change.added ? (
                          <span className="change-added">✅ {change.text}</span>
                        ) : (
                          <span className="change-removed">❌ {change.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No changelog data available.</p>
          )}
          <div className="modal-footer">
            <button
              onClick={closeModal}
              className="close-btn"
            >
              <MdClose size={24} /> Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Changelog;
