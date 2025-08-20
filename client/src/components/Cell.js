import React, { useEffect, useRef } from 'react';

const Cell = ({ rowIndex, colIndex, cellData, activeCell, onCellClick, onCellValueChange }) => {
  const isActive = activeCell && activeCell.row === rowIndex && activeCell.col === colIndex;
  const inputRef = useRef(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleInputChange = (e) => {
    onCellValueChange(rowIndex, colIndex, e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onCellClick(null); 
    }
  };

  if (isActive) {
    return (
      <input
        ref={inputRef}
        className="cell active"
        value={cellData.value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => onCellClick(null)}
      />
    );
  }

  return (
    <div 
      className="cell"
      onClick={() => onCellClick(rowIndex, colIndex)}
    >
      {cellData.value}
    </div>
  );
};

export default Cell;