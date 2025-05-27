const express = require('express');
const router = express.Router();

// Basic foods routes placeholder
// This file exists to prevent server startup errors
// Add your food management routes here

router.get('/test', (req, res) => {
  res.json({ message: 'Foods routes working' });
});

module.exports = router;
