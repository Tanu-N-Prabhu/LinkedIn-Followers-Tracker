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
        <div className="w-full h-full flex flex-col justify-between bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Release Notes</h2>
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
                  <React.Fragment key={index}>
                    <tr>
                      <td className="border p-2" rowSpan={entry.changes.length + 1}>
                        {entry.version}
                      </td>
                      <td className="border p-2" rowSpan={entry.changes.length + 1}>
                        {entry.date}
                      </td>
                    </tr>
                    {entry.changes.map((change, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">
                          {change.added ? (
                            <span className="text-green-500">✅ {change.text}</span>
                          ) : (
                            <span className="text-red-500">❌ {change.text}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No changelog data available.</p>
          )}
          <button
            onClick={closeModal}
            className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
          >
           <MdClose size={24} />  Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
export default Changelog;
