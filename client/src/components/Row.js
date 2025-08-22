import React from 'react';
import Cell from './Cell';

const Row = ({ rowIndex, rowData, activeCell, onCellClick, onCellValueChange }) => {
  return (
    <div className="row">
      {/* Row Number Header Cell */}
      <div className="cell header-cell row-header">{rowIndex + 1}</div>
      
      {/* Data Cells */}
      {rowData.map((cell, cellIndex) => (
        <Cell
          key={cellIndex}
          rowIndex={rowIndex}
          colIndex={cellIndex}
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
