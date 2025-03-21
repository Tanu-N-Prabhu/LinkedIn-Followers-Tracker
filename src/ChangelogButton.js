import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaSync, FaTimes } from "react-icons/fa";

Modal.setAppElement("#root");

const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [changelogData, setChangelogData] = useState([]);

  // Fetch changelog data from the API
  useEffect(() => {
    const fetchChangelogData = async () => {
      try {
        const response = await fetch(
          "https://linkedin-followers-tracker-production.up.railway.app/changelog"
        );
        const data = await response.json();
        setChangelogData(data);
      } catch (error) {
        console.error("Error fetching changelog data:", error);
      }
    };

    fetchChangelogData();
  }, []);

  return (
    <div className="flex justify-center">
      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-yellow-600 transition-all duration-300"
      >
        <FaSync size={18} className="mr-2" /> Changelog
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Changelog"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white max-w-lg w-full p-6 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Release Notes</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-red-500 transition-all duration-300"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Changelog Content */}
          <div className="max-h-80 overflow-y-auto space-y-6">
            {changelogData.map((entry, index) => (
              <div key={index} className="p-4 border rounded-md shadow-sm">
                <h3 className="text-lg font-semibold text-blue-600">
                  Version {entry.version}
                </h3>
                <p className="text-sm text-gray-500">Last updated: {entry.date}</p>
                <ul className="mt-2 space-y-2">
                  {entry.changes.map((change, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className={change.added ? "text-green-500" : "text-red-500"}>
                        {change.added ? "✅" : "❌"}
                      </span>
                      <p className="text-gray-700">{change.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Changelog;
