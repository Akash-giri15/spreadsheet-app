
require('../config/firebase'); // This initializes and connects to Firebase
const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const spreadsheetRoutes = require('./routes/spreadsheets');
app.use('/api/spreadsheets', spreadsheetRoutes);

// Import our logic functions
const { evaluateExpression } = require('./spreadsheetLogic');


app.get('/api/health', (req, res) => {
  res.json({ message: 'The server is healthy and running!' });
});

// The main endpoint for evaluating formulas
app.post('/api/evaluate', (req, res) => {
  try {
    const { expression, gridData } = req.body;

    // This validation is still good to have
    if (expression === undefined || !gridData) { // Check for undefined specifically
      return res.status(400).json({ error: 'Missing expression or gridData' });
    }

    // --- TRY to run the potentially problematic code ---
    const result = evaluateExpression(expression, gridData);

    // If the above line succeeds, send the result
    res.json({ result });

  } catch (error) {
    // --- CATCH any error that happens in the 'try' block ---
    console.error("Error during evaluation:", error); // Log the actual error on the server!
    
    // Send a generic "Internal Server Error" response to the client
    return res.status(500).json({ error: 'An internal server error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});