import React from 'react';
import Row from './Row';

// Helper to convert a column index (0, 1, 2...) to a letter (A, B, C...)
const getColumnName = (index) => {
  let name = '';
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const Grid = ({ gridData, activeCell, onCellClick, onCellValueChange }) => {
  if (!gridData || gridData.length === 0) {
    return <div>No data to display.</div>;
  }

  const columnCount = gridData[0].length;

  return (
    <div className="grid-container">
      <div className="grid">
        {/* Header Row */}
        <div className="row header-row">
          <div className="cell header-cell corner"></div> {/* Top-left corner cell */}
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <div key={colIndex} className="cell header-cell">
              {getColumnName(colIndex)}
            </div>
          ))}
        </div>

        {/* Data Rows */}
        {gridData.map((row, rowIndex) => (
          <Row
            key={rowIndex}
            rowIndex={rowIndex}
            rowData={row}
            activeCell={activeCell}
            onCellClick={onCellClick}
            onCellValueChange={onCellValueChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;
