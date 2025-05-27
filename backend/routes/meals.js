const express = require("express");
const router = express.Router();

// Basic meals routes placeholder
router.get("/test", (req, res) => {
  res.json({ message: "Meals routes working" });
});

module.exports = router;
