const express = require('express');
const router = express.Router();

// Basic auth routes placeholder
// This file exists to prevent server startup errors
// Add your regular user authentication routes here

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

module.exports = router;
