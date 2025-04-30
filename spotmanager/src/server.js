const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Serve JSON data
app.get("/api/spots", (req, res) => {
  const dataPath = path.join(__dirname, "public", "sample_data.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Failed to read data" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
