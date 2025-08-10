const express = require('express');
require('dotenv').config();

const cors = require("cors");
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
const PORT = process.env.PORT;


// Body parsers
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allRoutes = require('./routes/index');

// Routes (each file defines its own paths)
app.use(allRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});