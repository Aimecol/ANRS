const express = require('express');
const router = express.Router();

// Basic users routes placeholder
// This file exists to prevent server startup errors
// Add your user management routes here

router.get('/test', (req, res) => {
  res.json({ message: 'Users routes working' });
});

module.exports = router;
