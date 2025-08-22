/**
 * Parses a cell reference string (e.g., "A1", "BC23") into a zero-indexed
 * row and column object. This function remains unchanged.
 * @param {string} cellStr The cell reference string.
 * @returns {{row: number, col: number}|null} An object with row and col, or null if invalid.
 */
function parseCell(cellStr) {
  const match = cellStr.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) { return null; }

  const colStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  col -= 1; // zero-index the column

  const row = parseInt(rowStr, 10) - 1; // zero-index the row
  return { row, col };
}


/**
 * NEW: Recursively evaluates a formula expression.
 * @param {string} expression The formula string (e.g., "A1+B1/2").
 * @param {Array<Array<{value: string}>>} gridData The entire 2D grid data.
 * @param {Set<string>} visited A set to track visited cells for circular dependency detection.
 * @returns {number|string} The calculated result or an error string.
 */
function evaluateExpression(expression, gridData, visited = new Set()) {
  // Replace every cell reference (e.g., A1, BC23) with its calculated value.
  const evaluatedExpression = expression.replace(/[A-Z]+\d+/g, (cellStr) => {
    
    // Check for circular dependencies.
    if (visited.has(cellStr)) {
      // If we've already seen this cell in the current calculation path, it's a loop.
      throw new Error('#REF!');
    }
    // Add the current cell to the path we're visiting.
    visited.add(cellStr);

    const coords = parseCell(cellStr);
    if (!coords) {
      throw new Error(`#ERROR: Invalid cell ref ${cellStr}`);
    }

    // Get the value from the grid, which might involve another recursive call.
    const cellValue = getCellValue(coords, gridData, visited);

    // IMPORTANT: Once we're done with this branch of the calculation,
    // remove the cell from the visited path so it can be used in other calculations.
    visited.delete(cellStr);

    // If the recursive call returned a number, use it. Otherwise, it's an error.
    if (typeof cellValue === 'number') {
      return cellValue;
    }
    // Propagate the error up.
    throw new Error(cellValue);
  });

  try {
    // After all replacements, the expression should be pure math (e.g., "5+10/2").
    // Use a safe method to evaluate the final mathematical expression.
    // This is safer than eval() because it doesn't have access to the outer scope.
    // We also check for invalid characters to prevent any potential code injection.
    if (/[^0-9.+\-*/()\s]/.test(evaluatedExpression)) {
        return '#ERROR: Invalid chars';
    }
    return new Function('return ' + evaluatedExpression)();
  } catch (error) {
    // Catches syntax errors in the final math expression (e.g., "5++10").
    return '#ERROR: Invalid syntax';
  }
}

/**
 * NEW: Gets the value of a specific cell. If the cell contains a formula,
 * it recursively calls evaluateExpression.
 * @param {{row: number, col: number}} coords The coordinates of the cell.
 * @param {Array<Array<{value: string}>>} gridData The entire grid.
 * @param {Set<string>} visited The set for tracking circular dependencies.
 * @returns {number|string} The numeric value, the text value, or an error string.
 */
function getCellValue({ row, col }, gridData, visited) {
  // Ensure the cell exists within the grid boundaries.
  if (!gridData[row] || !gridData[row][col]) {
    return 0; // Treat out-of-bounds cells as 0.
  }
  
  const cell = gridData[row][col];
  const { value } = cell;

  // If the cell value is empty, treat it as 0.
  if (value === null || value === '') {
    return 0;
  }

  // If it's a formula (starts with '='), evaluate it.
  if (typeof value === 'string' && value.startsWith('=')) {
    try {
      // Pass the existing 'visited' set for continuous circular dependency tracking.
      return evaluateExpression(value.substring(1), gridData, visited);
    } catch (error) {
      return error.message; // Return error from deeper in the evaluation.
    }
  }

  // If it's a number, parse and return it.
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return num;
  }
  
  // If it's just non-numeric text, treat it as 0 for calculations.
  return 0;
}


// This export object MUST be updated to only export the main function.
module.exports = {
  // Only the top-level evaluateExpression function needs to be exported.
  // The other functions are now helpers used internally by it.
  evaluateExpression: (expression, gridData) => evaluateExpression(expression, gridData),
};