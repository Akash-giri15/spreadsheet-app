import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { auth } from '../firebase';

const Dashboard = () => {
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Fetch spreadsheets when the component mounts ---
  useEffect(() => {
    const fetchSpreadsheets = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:5000/api/spreadsheets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch spreadsheets.');
        }
        const data = await response.json();
        setSpreadsheets(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpreadsheets();
  }, []); // Empty dependency array means this runs once on mount

  const handleCreateSpreadsheet = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/spreadsheets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'Untitled Spreadsheet' })
      });

      if (!response.ok) {
        throw new Error('Failed to create spreadsheet.');
      }

      const newSpreadsheet = await response.json();
      console.log('Spreadsheet created:', newSpreadsheet);
      
      // --- NEW: Update the local state to show the new spreadsheet immediately ---
      setSpreadsheets(prevSpreadsheets => [...prevSpreadsheets, newSpreadsheet]);

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return <div>Loading spreadsheets...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <button onClick={handleCreateSpreadsheet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          + Create New Spreadsheet
        </button>
      </div>

      {/* --- NEW: Display the list of spreadsheets --- */}
      {spreadsheets.length > 0 ? (
        <ul>
          {spreadsheets.map(sheet => (
            <li key={sheet.id} style={{ marginBottom: '10px' }}>
              {/* This link will take the user to the spreadsheet page later */}
              <Link to={`/spreadsheet/${sheet.id}`}>{sheet.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You don't have any spreadsheets yet. Create one to get started!</p>
      )}
    </div>
  );
};

export default Dashboard;
