import React from 'react';
import Row from './Row';

// The key fix is adding 'onCellValueChange' to this list of props
const Grid = ({ gridData, activeCell, onCellClick, onCellValueChange }) => {
  return (
    <div className="grid">
      {gridData.map((row, rowIndex) => (
        <Row 
          key={rowIndex} 
          rowIndex={rowIndex}
          rowData={row}
          activeCell={activeCell}
          onCellClick={onCellClick}
          // Now this prop can be passed down without causing an error
          onCellValueChange={onCellValueChange} 
        />
      ))}
    </div>
  );
};

export default Grid;