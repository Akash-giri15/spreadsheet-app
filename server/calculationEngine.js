function parseCellReference(ref) {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const colStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
  }
  
  return { row: parseInt(rowStr, 10) - 1, col: col - 1 };
}

// Evaluates a single cell's formula
function evaluateCell(cell, grid) {
  if (!cell.value.startsWith('=')) {
    return cell.value; // It's a literal value, not a formula
  }

  const expression = cell.value.substring(1);

  // Replace all cell references (e.g., A1, B2) with their numeric values from the grid
  const evaluatedExpression = expression.replace(/[A-Z]+\d+/g, (match) => {
    const coords = parseCellReference(match);
    if (coords && grid[coords.row] && grid[coords.row][coords.col]) {
      // Recursively get the value. For simplicity, we assume no circular refs for now.
      // A full engine would need cycle detection like in your C code.
      const referencedCell = grid[coords.row][coords.col];
      // Use displayValue for calculations if it's a number, otherwise 0
      const val = parseFloat(referencedCell.displayValue);
      return isNaN(val) ? 0 : val;
    }
    return 0; // Invalid reference
  });

  try {
    // Safely evaluate the final mathematical expression (e.g., "5+10")
    // This is a simplified evaluator; a robust version would use a proper parsing library.
    if (/[^0-9.+\-*/()\s]/.test(evaluatedExpression)) {
      return '#NAME?'; // Contains invalid characters
    }
    return new Function('return ' + evaluatedExpression)();
  } catch (e) {
    return '#ERROR!';
  }
}

// The main function that recalculates the entire sheet
function recalculateSheet(grid) {
  // Create a deep copy to avoid modifying the original grid during iteration
  const newGrid = JSON.parse(JSON.stringify(grid));

  // A simple multi-pass calculation to handle dependencies.
  // A true dependency graph would be more efficient, but this is a solid start.
  for (let i = 0; i < 5; i++) { // Iterate a few times to resolve dependencies
    newGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.value.startsWith('=')) {
          cell.displayValue = evaluateCell(cell, newGrid);
        } else {
          cell.displayValue = cell.value;
        }
      });
    });
  }

  return newGrid;
}

module.exports = { recalculateSheet };
