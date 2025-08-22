import React, { useState } from 'react';
import { auth } from '../firebase';

const ShareModal = ({ spreadsheetId, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/api/spreadsheets/${spreadsheetId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to share.');
      }
      
      setSuccess(data.message);
      setEmail('');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Share Spreadsheet</h2>
        <form onSubmit={handleShare}>
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button type="submit">Share</button>
        </form>
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default ShareModal;
