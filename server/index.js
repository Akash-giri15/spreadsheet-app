const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes

// A simple test route to confirm the server is running
app.get('/api/health', (req, res) => {
  res.json({ message: 'The server is healthy and running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});