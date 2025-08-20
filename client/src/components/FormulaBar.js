import React from 'react';

const FormulaBar = ({ value, onChange }) => {
  return (
    <div className="formula-bar-container">
      <div className="fx-label">fx</div>
      <input 
        type="text" 
        className="formula-input" 
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default FormulaBar;