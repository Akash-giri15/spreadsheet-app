import React, { useState } from 'react';
import Grid from './components/Grid';
import FormulaBar from './components/FormulaBar';
import './Grid.css';

const generateInitialGrid = (rows, cols) => {
  const initialGrid = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({ value: '' }); 
    }
    initialGrid.push(row);
  }
  initialGrid[0][0].value = 'Hello';
  initialGrid[1][1].value = 'World';
  return initialGrid;
};

function App() {
  const numRows = 50;
  const numCols = 30;

  const [gridData, setGridData] = useState(generateInitialGrid(numRows, numCols));
  const [activeCell, setActiveCell] = useState(null);
  const [formulaInputValue, setFormulaInputValue] = useState('');

  // CORRECTED: This function now handles both selecting and de-selecting
  const handleCellClick = (rowIndex, colIndex) => {
    // If rowIndex is null, it means we are de-selecting.
    if (rowIndex === null || colIndex === null) {
      setActiveCell(null);
      setFormulaInputValue(''); // Clear the formula bar
      return;
    }
    
    // Otherwise, we are selecting a cell.
    setActiveCell({ row: rowIndex, col: colIndex });
    setFormulaInputValue(gridData[rowIndex][colIndex].value);
  };

  const handleCellValueChange = (rowIndex, colIndex, newValue) => {
    const newGridData = gridData.map(row => row.map(cell => ({ ...cell })));
    newGridData[rowIndex][colIndex].value = newValue;
    setGridData(newGridData);
    setFormulaInputValue(newValue);
  };
  
  const handleFormulaChange = (e) => {
    const newValue = e.target.value;
    setFormulaInputValue(newValue);
    if (activeCell) {
      const { row, col } = activeCell;
      // Note: This creates a new copy of the grid data, which is good practice
      const newGridData = gridData.map((r, rIndex) => 
        r.map((c, cIndex) => {
          if (rIndex === row && cIndex === col) {
            return { ...c, value: newValue };
          }
          return c;
        })
      );
      setGridData(newGridData);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My Spreadsheet</h1>
      <FormulaBar 
        value={formulaInputValue} 
        onChange={handleFormulaChange} 
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
}

export default App;
