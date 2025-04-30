const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Serve JSON data
router.get("/", (req, res) => {
  const dataPath = path.join(__dirname, "../public", "sample_data.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read data" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

module.exports = router;
