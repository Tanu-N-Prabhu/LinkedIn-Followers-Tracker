/*
React Modal Setup:
  * The modal is managed by react-modal and opens when the user clicks on a button (FaClipboardList icon).
  * The modal displays changelog data fetched from an API.

Fetching Changelog Data:
  * Using useEffect, the changelog data is fetched when the component is mounted ([] dependency).
  * fetchChangelogData fetches the changelog data from the backend API and updates the state (setChangelogData).

Displaying Data:
  * The data is displayed in the modal in a structured way with each entry showing version, date, and changes.
  * The changes are highlighted with green or red colors and an appropriate icon (✅ for added, ❌ for removed).

UI and Styling:
  * The modal has a clean and modern design, with Tailwind CSS classes for layout and styling.
  * There's a close button (FaTimes) at the bottom to close the modal.

Notes:
  * The modal uses react-tooltip to provide a tooltip with "Release Notes" when hovering over the button.
  * You should replace the fetch URL (https://linkedin-followers-tracker-production.up.railway.app/changelog) with the actual backend URL that provides the changelog data.
*/

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaClipboardList , FaTimes } from 'react-icons/fa';  // Sync icon
import { Tooltip as ReactTooltip } from "react-tooltip";

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
      <button data-tooltip-id="Release-Notes-tooltip" onClick={openModal} className="btn btn-warning">
      <FaClipboardList  size={15} />
      </button>
      <ReactTooltip id="Release-Notes-tooltip" place="top" effect="solid">
      Release Notes
      </ReactTooltip>
      <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Changelog">
        <div className="w-full h-full flex flex-col items-center bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Release Notes</h2>
          <div className="changelog-container w-full flex flex-col items-center">
            {changelogData.map((entry, index) => (
              <div key={index} className="changelog-entry mb-6 text-center w-3/4">
                {/* Version Number */}
                <h3 className="changelog-version text-xl font-semibold">Version {entry.version}</h3>

                {/* Date */}
                <p className="changelog-date text-gray-600">
                Last Updated on {new Date().toLocaleString()}
                </p>

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
          <button onClick={closeModal} className="mt-6 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 flex items-center">
            <FaTimes size={15}/>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Changelog;