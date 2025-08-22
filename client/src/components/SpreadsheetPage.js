import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { auth } from '../firebase';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'; // Removed updateDoc as we'll use the backend
import Grid from './Grid';
import FormulaBar from './FormulaBar';
import ShareModal from './ShareModal';
import '../Grid.css';

// This helper is still needed
const unflattenGrid = (flatGrid, rows, cols) => {
  const grid = [];
  if (!flatGrid || !rows || !cols) return grid;
  for (let i = 0; i < rows; i++) {
    grid.push(flatGrid.slice(i * cols, (i + 1) * cols));
  }
  return grid;
};

const SpreadsheetPage = () => {
  const { id } = useParams();
  const [sheetData, setSheetData] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);
  const [formulaInputValue, setFormulaInputValue] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // --- REAL-TIME LISTENER ---
  // This useEffect now correctly listens for changes and updates the UI
  useEffect(() => {
    const db = getFirestore();
    const docRef = doc(db, 'spreadsheets', id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSheetData(data);
        const twoDGrid = unflattenGrid(data.sheetData.grid, data.sheetData.rows, data.sheetData.cols);
        setGridData(twoDGrid);
      } else {
        console.error("Spreadsheet not found!");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // --- RE-IMPLEMENTED: Cell changes now call the backend for calculation ---
  const handleCellValueChange = useCallback(async (rowIndex, colIndex, newValue) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      
      // Optimistic UI update for a responsive feel
      const tempGrid = JSON.parse(JSON.stringify(gridData));
      tempGrid[rowIndex][colIndex].value = newValue;
      setGridData(tempGrid);

      // Call the backend to perform recalculation and save to Firestore
      const response = await fetch(`http://localhost:5000/api/spreadsheets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rowIndex,
          colIndex,
          newValue,
          currentGrid: tempGrid // Send the grid with the user's latest change
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update spreadsheet on the server.');
      }
      
      // No need to setGridData here, because the onSnapshot listener will
      // automatically receive the update from Firestore and handle the re-render.

    } catch (error) {
      console.error("Error updating cell:", error);
      // Optional: Revert local change if server update fails
    }
  }, [id, gridData]);

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    setActiveCell(rowIndex === null ? null : { row: rowIndex, col: colIndex });
  }, []);
  
  // --- RE-IMPLEMENTED: Connect FormulaBar changes back to the grid ---
  const handleFormulaBarChange = (e) => {
    setFormulaInputValue(e.target.value);
  };

  const handleFormulaBarCommit = (e) => {
    if (e.key === 'Enter' && activeCell) {
      handleCellValueChange(activeCell.row, activeCell.col, formulaInputValue);
    }
  };

  useEffect(() => {
    if (activeCell && gridData.length > 0) {
      setFormulaInputValue(gridData[activeCell.row][activeCell.col].value);
    } else {
      setFormulaInputValue('');
    }
  }, [activeCell, gridData]);

  if (loading) {
    return <div>Loading spreadsheet...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{sheetData?.title}</h2>
        <button onClick={() => setShowShareModal(true)}>Share</button>
      </div>
      
      {showShareModal && <ShareModal spreadsheetId={id} onClose={() => setShowShareModal(false)} />}
      
      <FormulaBar 
        value={formulaInputValue} 
        onChange={handleFormulaBarChange}
        onKeyDown={handleFormulaBarCommit} // Pass the keydown handler
      />
      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid #ccc' }}>
        <Grid
          gridData={gridData}
          activeCell={activeCell}
          onCellClick={handleCellClick}
          onCellValueChange={handleCellValueChange}
        />
      </div>
    </div>
  );
};

export default SpreadsheetPage;
