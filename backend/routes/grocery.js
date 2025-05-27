const express = require('express');
const router = express.Router();

// Basic grocery routes placeholder
// This file exists to prevent server startup errors
// Add your grocery management routes here

router.get('/test', (req, res) => {
  res.json({ message: 'Grocery routes working' });
});

module.exports = router;
