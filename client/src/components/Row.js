import React from 'react';
import Cell from './Cell';

const Row = ({ rowIndex, rowData, activeCell, onCellClick, onCellValueChange }) => {
  return (
    <div className="row">
      {rowData.map((cell, cellIndex) => (
        <Cell 
          key={cellIndex} 
          rowIndex={rowIndex}
          colIndex={cellIndex} // Pass down the cell's index
          cellData={cell}
          activeCell={activeCell}
          onCellClick={onCellClick}
          onCellValueChange={onCellValueChange}
        />
      ))}
    </div>
  );
};

export default Row;