import React, { useState, useEffect, useRef } from 'react';

const Cell = ({ rowIndex, colIndex, cellData, activeCell, onCellClick, onCellValueChange }) => {
  const [editingValue, setEditingValue] = useState(cellData.value);
  const isActive = activeCell && activeCell.row === rowIndex && activeCell.col === colIndex;
  const inputRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setEditingValue(cellData.value);
      inputRef.current?.focus();
    }
  }, [isActive, cellData.value]);

  const handleCommitChange = () => {
    onCellValueChange(rowIndex, colIndex, editingValue);
    onCellClick(null, null);
  };

  const handleInputChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleCommitChange();
  };

  const className = `cell data-cell ${isActive ? 'active' : ''}`;

  if (isActive) {
    return (
      <div className={className}>
        <form onSubmit={handleFormSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="cell-input"
            value={editingValue}
            onChange={handleInputChange}
            onBlur={handleCommitChange}
          />
        </form>
      </div>
    );
  }

  return (
    <div
      className={className}
      onClick={() => onCellClick(rowIndex, colIndex)}
    >
      {cellData.displayValue}
    </div>
  );
};

export default Cell;
