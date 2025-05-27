const express = require('express');
const router = express.Router();

// Basic budget routes placeholder
// This file exists to prevent server startup errors
// Add your budget management routes here

router.get('/test', (req, res) => {
  res.json({ message: 'Budget routes working' });
});

module.exports = router;
