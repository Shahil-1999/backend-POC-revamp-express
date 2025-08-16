const express = require('express');
require('dotenv').config();
const sequelize = require('./connection/db-connection')

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

// Start server only if DB connects
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to DB:", error.message);
    process.exit(1);
  }
})();